/**
 * Lip Sync Module
 * Pure Node.js implementation - no external dependencies
 */

export { generateLipSync, generateLipSyncSmooth, generateLipSyncStream } from './lip-sync-service.js';
export { textToPhonemes, wordToPhonemes } from './grapheme-to-phoneme.js';
export { phonemeToViseme, visemeToMorphTarget, visemeNames } from './viseme-map.js';
