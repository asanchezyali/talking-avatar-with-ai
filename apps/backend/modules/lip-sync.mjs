import { readFile } from "fs/promises";
import { convertTextToSpeech } from "./elevenLabs.mjs";
import { audioFileToBase64 } from "../utils/files.mjs";
import { generateLipSync } from "./lip-sync/index.js";

const MAX_RETRIES = 10;
const RETRY_DELAY = 100;

const LIP_SYNC_SERVICE_URL = process.env.LIP_SYNC_SERVICE_URL;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function estimateAudioDuration(text) {
  const words = text.split(/\s+/).length;
  const wordsPerSecond = 2.5; // ~150 WPM
  return Math.max(0.5, words / wordsPerSecond);
}

async function callPythonLipSync(fileName, text) {
  if (!LIP_SYNC_SERVICE_URL) return null;

  try {
    const audioBuffer = await readFile(fileName);
    const formData = new FormData();
    formData.append("audio", new Blob([audioBuffer]), "audio.mp3");
    if (text) formData.append("text", text);

    const response = await fetch(`${LIP_SYNC_SERVICE_URL}/api/lip-sync`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Python lip-sync unavailable, using fallback:", error.message);
    return null;
  }
}

const lipSync = async ({ messages }) => {
  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = `audios/message_${index}.mp3`;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await convertTextToSpeech({ text: message.text, fileName });
          break;
        } catch (error) {
          if (error.response?.status === 429 && attempt < MAX_RETRIES - 1) {
            await delay(RETRY_DELAY * (attempt + 1));
          } else {
            throw error;
          }
        }
      }

      let lipsyncData = await callPythonLipSync(fileName, message.text);

      if (!lipsyncData) {
        const audioDuration = estimateAudioDuration(message.text);
        lipsyncData = generateLipSync(message.text, audioDuration);
      }

      message.audio = await audioFileToBase64({ fileName });
      message.lipsync = lipsyncData;
    })
  );

  return messages;
};

export { lipSync };
