import { audioFileToBase64, readJsonTranscript } from "../utils/files.mjs";
import dotenv from "dotenv";
dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY;
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const sixtyDbApiKey = process.env.SIXTY_DB_API_KEY;
const DEFAULT_PROVIDER = process.env.DEFAULT_TTS_PROVIDER || "elevenlabs";

// Active provider's key is what matters; we only require the one the caller
// is about to use, not both.
const ttsKeyForProvider = (provider) => {
  const p = provider || DEFAULT_PROVIDER;
  if (p === "sixty_db" || p === "sixty_db_stream" || p === "sixty_db_ws") return sixtyDbApiKey;
  return elevenLabsApiKey;
};

async function sendDefaultMessages({ userMessage, provider }) {
  let messages;
  if (!userMessage) {
    messages = [
      {
        text: "Hey there... How was your day?",
        audio: await audioFileToBase64({ fileName: "audios/intro_0.wav" }),
        lipsync: await readJsonTranscript({ fileName: "audios/intro_0.json" }),
        facialExpression: "smile",
        animation: "TalkingOne",
      },
      {
        text: "I'm Jack, your personal AI assistant. I'm here to help you with anything you need.",
        audio: await audioFileToBase64({ fileName: "audios/intro_1.wav" }),
        lipsync: await readJsonTranscript({ fileName: "audios/intro_1.json" }),
        facialExpression: "smile",
        animation: "TalkingTwo",
      },
    ];
    return messages;
  }
  if (!ttsKeyForProvider(provider) || !openAIApiKey) {
    messages = [
      {
        text: "Please my friend, don't forget to add your API keys!",
        audio: await audioFileToBase64({ fileName: "audios/api_0.wav" }),
        lipsync: await readJsonTranscript({ fileName: "audios/api_0.json" }),
        facialExpression: "angry",
        animation: "TalkingThree",
      },
      {
        text: "You don't want to ruin Jack with a crazy ChatGPT and ElevenLabs bill, right?",
        audio: await audioFileToBase64({ fileName: "audios/api_1.wav" }),
        lipsync: await readJsonTranscript({ fileName: "audios/api_1.json" }),
        facialExpression: "smile",
        animation: "Angry",
      },
    ];
    return messages;
  }
}

const defaultResponse = [
  {
    text: "I'm sorry, there seems to be an error with my brain, or I didn't understand. Could you please repeat your question?",
    facialExpression: "sad",
    animation: "Idle",
  },
];

export { sendDefaultMessages, defaultResponse };
