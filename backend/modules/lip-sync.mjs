import { convertTextToSpeech } from "./elevenLabs.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import { readJsonTranscript, audioFileToBase64 } from "./utils.mjs";

const lipSync = async ({messages}) => {
  await Promise.all(messages.map(async (message, index) => {
    const fileName = `audios/message_${index}.mp3`;
    await convertTextToSpeech({ text: message.text, fileName });
    await getPhonemes(index);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${index}.json`);
  }));
  return messages
}

export { lipSync };

