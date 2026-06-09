// 60db TTS module. Mirrors elevenLabs.mjs in surface (write mp3 to disk)
// so the lip-sync.mjs / Rhubarb pipeline downstream does not change.
//
// Three surfaces exposed:
//  - convertTextToSpeech            REST POST /tts-synthesize (one-shot)
//  - convertTextToSpeechStream      REST POST /tts-stream (NDJSON, buffered)
//  - convertTextToSpeechWebSocket   wss://api.60db.ai/ws/tts (PCM -> ffmpeg mp3)
//
// All three write the final audio to `fileName`. Only convertTextToSpeech is
// wired into the lip-sync pipeline; the other two are exported for callers
// that want streaming/realtime use cases.

import { promises as fs } from "fs";
import { Buffer } from "buffer";
import { randomUUID } from "crypto";
import WebSocket from "ws";
import dotenv from "dotenv";
import { execCommand } from "../utils/files.mjs";

dotenv.config();

const apiKey = process.env.SIXTY_DB_API_KEY;
const voiceId = process.env.SIXTY_DB_VOICE_ID || "fbb75ed2-975a-40c7-9e06-38e30524a9a1"; // 60db default
const speed = Number(process.env.SIXTY_DB_SPEED ?? 1.0);
const stability = Number(process.env.SIXTY_DB_STABILITY ?? 50);
const similarity = Number(process.env.SIXTY_DB_SIMILARITY ?? 75);

const REST_BASE = "https://api.60db.ai";
const WS_URL = "wss://api.60db.ai/ws/tts";

const authHeaders = () => {
  if (!apiKey) throw new Error("SIXTY_DB_API_KEY is not set");
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
};

// REST one-shot. Writes mp3 to disk so Rhubarb can pick it up via ffmpeg.
async function convertTextToSpeech({ text, fileName }) {
  const body = {
    text,
    voice_id: voiceId,
    speed,
    stability,
    similarity,
    output_format: "mp3",
    enhance: true,
  };

  const res = await fetch(`${REST_BASE}/tts-synthesize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = new Error(`60db /tts-synthesize ${res.status}: ${await res.text()}`);
    // Match elevenlabs-node's error shape so lip-sync.mjs retry-on-429 keeps working
    err.response = { status: res.status };
    throw err;
  }

  const json = await res.json();
  if (!json.audio_base64) {
    throw new Error(`60db response missing audio_base64: ${JSON.stringify(json).slice(0, 200)}`);
  }
  await fs.writeFile(fileName, Buffer.from(json.audio_base64, "base64"));
}

// REST NDJSON streaming. Buffers all chunks then writes once.
// Server emits {type:"chunk", result:{audioContent: base64}} lines, then
// {type:"complete"} or {type:"error", message}.
async function convertTextToSpeechStream({ text, fileName }) {
  const body = { text, voice_id: voiceId, speed, stability, similarity, enhance: true };

  const res = await fetch(`${REST_BASE}/tts-stream`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = new Error(`60db /tts-stream ${res.status}: ${await res.text()}`);
    err.response = { status: res.status };
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const audioParts = [];
  let buffer = "";

  // Walk the response stream line-by-line. Last line may be incomplete so we
  // hold it in `buffer` until the next chunk arrives.
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // partial line for next iteration
    for (const line of lines) {
      if (!line.trim()) continue;
      const evt = JSON.parse(line);
      if (evt.type === "chunk" && evt.result?.audioContent) {
        audioParts.push(Buffer.from(evt.result.audioContent, "base64"));
      } else if (evt.type === "error") {
        throw new Error(`60db stream error: ${evt.message}`);
      }
    }
  }
  if (buffer.trim()) {
    const evt = JSON.parse(buffer);
    if (evt.type === "chunk" && evt.result?.audioContent) {
      audioParts.push(Buffer.from(evt.result.audioContent, "base64"));
    }
  }

  await fs.writeFile(fileName, Buffer.concat(audioParts));
}

// WebSocket session. Returns LINEAR16 PCM frames; ffmpeg-encodes them into
// the target mp3 so the lip-sync pipeline works on the result.
async function convertTextToSpeechWebSocket({ text, fileName }) {
  if (!apiKey) throw new Error("SIXTY_DB_API_KEY is not set");

  const sampleRate = 16000;
  const audioChunks = await runWsSession({ text, sampleRate });

  // Write raw PCM to a temp file, then ffmpeg -> target mp3.
  const pcmPath = fileName.replace(/\.[^.]+$/, "") + `.${randomUUID()}.pcm`;
  await fs.writeFile(pcmPath, Buffer.concat(audioChunks));
  try {
    await execCommand({
      command: `ffmpeg -y -f s16le -ar ${sampleRate} -ac 1 -i ${pcmPath} ${fileName}`,
    });
  } finally {
    await fs.unlink(pcmPath).catch(() => {});
  }
}

// WS state machine: connection_established -> create_context -> send_text +
// flush -> collect audio_chunk frames -> flush_completed -> close_context.
function runWsSession({ text, sampleRate }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS_URL}?apiKey=${encodeURIComponent(apiKey)}`);
    const contextId = randomUUID();
    const audioChunks = [];

    const send = (obj) => ws.send(JSON.stringify(obj));
    const fail = (msg) => {
      try { ws.close(); } catch (_) {}
      reject(new Error(msg));
    };

    ws.on("open", () => {
      // Wait for connection_established (the server's first frame) before sending create_context.
    });

    ws.on("message", (raw) => {
      let evt;
      try { evt = JSON.parse(raw.toString()); } catch { return; }

      if (evt.connection_established) {
        send({
          create_context: {
            context_id: contextId,
            voice_id: voiceId,
            audio_config: { audio_encoding: "LINEAR16", sample_rate_hertz: sampleRate },
            speed, stability, similarity,
          },
        });
      } else if (evt.context_created) {
        send({ send_text: { context_id: contextId, text } });
        send({ flush_context: { context_id: contextId } });
      } else if (evt.audio_chunk?.audioContent) {
        audioChunks.push(Buffer.from(evt.audio_chunk.audioContent, "base64"));
      } else if (evt.flush_completed) {
        send({ close_context: { context_id: contextId } });
      } else if (evt.context_closed) {
        ws.close();
        resolve(audioChunks);
      } else if (evt.error) {
        fail(`60db WS error: ${evt.error.message}`);
      }
    });

    ws.on("error", (e) => fail(`60db WS transport error: ${e.message}`));
    ws.on("close", () => {
      if (audioChunks.length === 0) reject(new Error("60db WS closed before audio received"));
    });
  });
}

export { convertTextToSpeech, convertTextToSpeechStream, convertTextToSpeechWebSocket };
