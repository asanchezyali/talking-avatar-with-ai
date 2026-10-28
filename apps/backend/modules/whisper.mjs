import { OpenAIWhisperAudio } from "langchain/document_loaders/fs/openai_whisper_audio";
import { convertAudioToMp3 } from "../utils/audios.mjs";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY;

async function convertAudioToText({ audioData }) {
  const { outputPath, tempDir } = await convertAudioToMp3({ audioData });
  try {
    const loader = new OpenAIWhisperAudio(outputPath, { clientOptions: { apiKey: openAIApiKey } });
    const doc = (await loader.load()).shift();
    return doc.pageContent;
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

export { convertAudioToText };
