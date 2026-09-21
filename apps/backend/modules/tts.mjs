// TTS provider facade. Dispatches convertTextToSpeech to the chosen
// provider so lip-sync.mjs / server.js don't need to know who's behind it.
//
// Provider is selected per request via the `provider` field on POST /tts
// and POST /sts bodies. Defaults to the value of DEFAULT_TTS_PROVIDER env
// (or "elevenlabs" if unset) for backward compatibility with the original
// codebase.

import { convertTextToSpeech as elevenLabsTts } from "./elevenLabs.mjs";
import {
  convertTextToSpeech as sixtyDbTts,
  convertTextToSpeechStream as sixtyDbTtsStream,
  convertTextToSpeechWebSocket as sixtyDbTtsWebSocket,
} from "./sixtyDb.mjs";

const PROVIDERS = {
  elevenlabs: elevenLabsTts,
  sixty_db: sixtyDbTts,
  // 60db extras, callable directly via convertTextToSpeech({ provider: "sixty_db_stream" })
  sixty_db_stream: sixtyDbTtsStream,
  sixty_db_ws: sixtyDbTtsWebSocket,
};

const DEFAULT_PROVIDER = process.env.DEFAULT_TTS_PROVIDER || "elevenlabs";

function resolveProvider(provider) {
  const key = provider || DEFAULT_PROVIDER;
  const fn = PROVIDERS[key];
  if (!fn) {
    const allowed = Object.keys(PROVIDERS).join(", ");
    throw new Error(`Unknown TTS provider "${key}". Allowed: ${allowed}`);
  }
  return { key, fn };
}

async function convertTextToSpeech({ text, fileName, provider }) {
  const { fn } = resolveProvider(provider);
  await fn({ text, fileName });
}

export { convertTextToSpeech, resolveProvider, PROVIDERS, DEFAULT_PROVIDER };
