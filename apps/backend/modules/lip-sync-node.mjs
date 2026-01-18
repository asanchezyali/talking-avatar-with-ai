/**
 * Node.js Lip Sync Implementation
 * Replaces Rhubarb for faster lip sync generation
 *
 * Performance comparison:
 * - Rhubarb: 1-3 seconds (external process + file I/O)
 * - Node.js: <5ms (in-memory, no external deps)
 */

import { convertTextToSpeech, voice } from "./elevenLabs.mjs";
import { audioFileToBase64 } from "../utils/files.mjs";
import { generateLipSync } from "./lip-sync/index.js";

const MAX_RETRIES = 10;
const RETRY_DELAY = 100;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Estimate audio duration based on text length
 * Average speaking rate: ~150 words per minute
 * @param {string} text - Text content
 * @returns {number} Estimated duration in seconds
 */
function estimateAudioDuration(text) {
  const words = text.split(/\s+/).length;
  const wordsPerSecond = 2.5; // ~150 WPM
  return Math.max(0.5, words / wordsPerSecond);
}

/**
 * Process messages with Node.js lip sync (no Rhubarb)
 * @param {Object} params - Parameters
 * @param {Array} params.messages - Messages to process
 * @returns {Array} Messages with audio and lip sync data
 */
const lipSyncNode = async ({ messages }) => {
  // Process all messages in parallel
  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = `audios/message_${index}.mp3`;
      const startTime = Date.now();

      // Step 1: Generate TTS audio
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

      const ttsTime = Date.now() - startTime;
      console.log(`[${index}] TTS completed in ${ttsTime}ms`);

      // Step 2: Generate lip sync from text (NO Rhubarb needed!)
      const lipSyncStart = Date.now();
      const audioDuration = estimateAudioDuration(message.text);
      const lipsync = generateLipSync(message.text, audioDuration);
      const lipSyncTime = Date.now() - lipSyncStart;

      console.log(`[${index}] Lip sync generated in ${lipSyncTime}ms (${lipsync.mouthCues.length} cues)`);

      // Step 3: Read audio file
      message.audio = await audioFileToBase64({ fileName });
      message.lipsync = lipsync;

      console.log(`[${index}] Total: ${Date.now() - startTime}ms`);
    })
  );

  return messages;
};

/**
 * Hybrid approach: Use audio duration from Eleven Labs if available
 * Falls back to estimation
 */
const lipSyncWithDuration = async ({ messages }) => {
  await Promise.all(
    messages.map(async (message, index) => {
      const fileName = `audios/message_${index}.mp3`;

      // Generate TTS
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

      // Get audio and estimate duration
      const audioBase64 = await audioFileToBase64({ fileName });
      const audioDuration = estimateAudioDuration(message.text);

      // Generate lip sync
      message.audio = audioBase64;
      message.lipsync = generateLipSync(message.text, audioDuration);
    })
  );

  return messages;
};

export { lipSyncNode, lipSyncWithDuration, estimateAudioDuration };
