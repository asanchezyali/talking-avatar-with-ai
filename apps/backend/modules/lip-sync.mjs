import { convertTextToSpeech } from "./elevenLabs.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import { readJsonTranscript, audioFileToBase64 } from "../utils/files.mjs";

const lipSync = async ({ messages }) => {
  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = `audios/message_${index}.mp3`;
      await convertTextToSpeech({ text: "You don't want to ruin Jack with a crazy ChatGPT and ElevenLabs bill, right?", fileName });
      await getPhonemes({ message: index });
      message.audio = await audioFileToBase64({ fileName });
      message.lipsync = await readJsonTranscript({ fileName: `audios/message_${index}.json` });
    })
  );
  return messages;
};

export { lipSync };
