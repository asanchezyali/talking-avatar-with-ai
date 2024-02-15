import { convertTextToSpeech } from "./elevenLabs.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import { readJsonTranscript, audioFileToBase64 } from "../utils/files.mjs";

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000;

const lipSync = async ({  }) => {
  const messages = [
    {
      text: 'Drawbugs are fascinating creatures I encountered in my travels. They have the unique ability to sketch their surroundings with their legs, creating intricate designs in the sand.',
      facialExpression: 'smile',
      animation: 'TalkingOne'
    },
    {
      text: "They're not dangerous, but they are very shy. If you're lucky enough to spot one, you have to stay very still and quiet, or they'll scurry away.",
      facialExpression: 'default',
      animation: 'TalkingThree'
    },
    {
      text: "I've tried to sketch like them, but I can't quite get the hang of it. I guess it's a skill that only drawbugs have!",
      facialExpression: 'funnyFace',
      animation: 'Idle'
    }
  ]
  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = `audios/message_${index}.mp3`;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await convertTextToSpeech({ text: message.text, fileName });
          break;
        } catch (error) {
          if (error.response && error.response.status === 429 && attempt < MAX_RETRIES - 1) {
            await delay(RETRY_DELAY);
          } else {
            throw error;
          }
        }
      }
    })
  );

  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = `audios/message_${index}.mp3`;

      try {
        await getPhonemes({ message: index });
        message.audio = await audioFileToBase64({ fileName });
        message.lipsync = await readJsonTranscript({ fileName: `audios/message_${index}.json` });
      } catch (error) {
        console.error(`Error while getting phonemes for message ${index}:`, error);
      }
    })
  );

  return messages;
};

export { lipSync };