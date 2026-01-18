/**
 * English Grapheme-to-Phoneme Rules
 * Converts English text to approximate phonemes using rule-based approach
 * ~80% accuracy for common words
 */

// Common word pronunciations (handles irregular words)
const dictionary = {
  'the': ['DH', 'AH'],
  'a': ['AH'],
  'an': ['AE', 'N'],
  'is': ['IH', 'Z'],
  'are': ['AA', 'R'],
  'was': ['W', 'AA', 'Z'],
  'were': ['W', 'ER'],
  'be': ['B', 'IY'],
  'been': ['B', 'IH', 'N'],
  'have': ['HH', 'AE', 'V'],
  'has': ['HH', 'AE', 'Z'],
  'had': ['HH', 'AE', 'D'],
  'do': ['D', 'UW'],
  'does': ['D', 'AH', 'Z'],
  'did': ['D', 'IH', 'D'],
  'will': ['W', 'IH', 'L'],
  'would': ['W', 'UH', 'D'],
  'could': ['K', 'UH', 'D'],
  'should': ['SH', 'UH', 'D'],
  'can': ['K', 'AE', 'N'],
  'may': ['M', 'EY'],
  'might': ['M', 'AY', 'T'],
  'must': ['M', 'AH', 'S', 'T'],
  'i': ['AY'],
  'you': ['Y', 'UW'],
  'he': ['HH', 'IY'],
  'she': ['SH', 'IY'],
  'it': ['IH', 'T'],
  'we': ['W', 'IY'],
  'they': ['DH', 'EY'],
  'what': ['W', 'AH', 'T'],
  'who': ['HH', 'UW'],
  'which': ['W', 'IH', 'CH'],
  'this': ['DH', 'IH', 'S'],
  'that': ['DH', 'AE', 'T'],
  'these': ['DH', 'IY', 'Z'],
  'those': ['DH', 'OW', 'Z'],
  'hello': ['HH', 'AH', 'L', 'OW'],
  'world': ['W', 'ER', 'L', 'D'],
  'yes': ['Y', 'EH', 'S'],
  'no': ['N', 'OW'],
  'one': ['W', 'AH', 'N'],
  'two': ['T', 'UW'],
  'three': ['TH', 'R', 'IY'],
  'four': ['F', 'AO', 'R'],
  'five': ['F', 'AY', 'V'],
  'of': ['AH', 'V'],
  'to': ['T', 'UW'],
  'and': ['AE', 'N', 'D'],
  'for': ['F', 'AO', 'R'],
  'with': ['W', 'IH', 'TH'],
  'your': ['Y', 'AO', 'R'],
  'my': ['M', 'AY'],
  'from': ['F', 'R', 'AH', 'M'],
  'about': ['AH', 'B', 'AW', 'T'],
  'know': ['N', 'OW'],
  'think': ['TH', 'IH', 'NG', 'K'],
  'just': ['JH', 'AH', 'S', 'T'],
  'like': ['L', 'AY', 'K'],
  'time': ['T', 'AY', 'M'],
  'very': ['V', 'EH', 'R', 'IY'],
  'when': ['W', 'EH', 'N'],
  'come': ['K', 'AH', 'M'],
  'make': ['M', 'EY', 'K'],
  'people': ['P', 'IY', 'P', 'AH', 'L'],
  'because': ['B', 'IH', 'K', 'AH', 'Z'],
  'good': ['G', 'UH', 'D'],
  'some': ['S', 'AH', 'M'],
  'take': ['T', 'EY', 'K'],
  'into': ['IH', 'N', 'T', 'UW'],
  'year': ['Y', 'IH', 'R'],
  'great': ['G', 'R', 'EY', 'T'],
  'after': ['AE', 'F', 'T', 'ER'],
  'over': ['OW', 'V', 'ER'],
  'new': ['N', 'UW'],
  'where': ['W', 'EH', 'R'],
  'most': ['M', 'OW', 'S', 'T'],
  'only': ['OW', 'N', 'L', 'IY'],
  'other': ['AH', 'DH', 'ER'],
  'work': ['W', 'ER', 'K'],
  'first': ['F', 'ER', 'S', 'T'],
  'want': ['W', 'AA', 'N', 'T'],
  'give': ['G', 'IH', 'V'],
  'our': ['AW', 'ER'],
  'there': ['DH', 'EH', 'R'],
  'their': ['DH', 'EH', 'R'],
  "i'm": ['AY', 'M'],
  "i've": ['AY', 'V'],
  "i'll": ['AY', 'L'],
  "it's": ['IH', 'T', 'S'],
  "don't": ['D', 'OW', 'N', 'T'],
  "can't": ['K', 'AE', 'N', 'T'],
  "won't": ['W', 'OW', 'N', 'T'],
  "isn't": ['IH', 'Z', 'AH', 'N', 'T'],
  "aren't": ['AA', 'R', 'AH', 'N', 'T'],
  "wasn't": ['W', 'AA', 'Z', 'AH', 'N', 'T'],
  "weren't": ['W', 'ER', 'AH', 'N', 'T'],
  "haven't": ['HH', 'AE', 'V', 'AH', 'N', 'T'],
  "hasn't": ['HH', 'AE', 'Z', 'AH', 'N', 'T'],
  "hadn't": ['HH', 'AE', 'D', 'AH', 'N', 'T'],
  "didn't": ['D', 'IH', 'D', 'AH', 'N', 'T'],
  "wouldn't": ['W', 'UH', 'D', 'AH', 'N', 'T'],
  "couldn't": ['K', 'UH', 'D', 'AH', 'N', 'T'],
  "shouldn't": ['SH', 'UH', 'D', 'AH', 'N', 'T'],
};

// Grapheme patterns to phonemes (order matters - longer patterns first)
const rules = [
  // Silent letters and special cases
  [/ght/gi, ['T']],
  [/tion/gi, ['SH', 'AH', 'N']],
  [/sion/gi, ['ZH', 'AH', 'N']],
  [/ture/gi, ['CH', 'ER']],
  [/ous/gi, ['AH', 'S']],
  [/ious/gi, ['IY', 'AH', 'S']],
  [/eous/gi, ['IY', 'AH', 'S']],
  [/ness/gi, ['N', 'AH', 'S']],
  [/ment/gi, ['M', 'AH', 'N', 'T']],
  [/able/gi, ['AH', 'B', 'AH', 'L']],
  [/ible/gi, ['AH', 'B', 'AH', 'L']],
  [/ally/gi, ['AH', 'L', 'IY']],
  [/ful/gi, ['F', 'AH', 'L']],
  [/less/gi, ['L', 'AH', 'S']],
  [/ing/gi, ['IH', 'NG']],
  [/ed$/gi, ['D']],

  // Digraphs and trigraphs
  [/tch/gi, ['CH']],
  [/dge/gi, ['JH']],
  [/wh/gi, ['W']],
  [/wr/gi, ['R']],
  [/kn/gi, ['N']],
  [/gn/gi, ['N']],
  [/mb$/gi, ['M']],
  [/mn$/gi, ['M']],
  [/ps/gi, ['S']],
  [/pn/gi, ['N']],

  // Common consonant digraphs
  [/th/gi, ['TH']],
  [/sh/gi, ['SH']],
  [/ch/gi, ['CH']],
  [/ph/gi, ['F']],
  [/gh/gi, ['G']],
  [/ng/gi, ['NG']],
  [/nk/gi, ['NG', 'K']],
  [/ck/gi, ['K']],
  [/qu/gi, ['K', 'W']],

  // Vowel combinations
  [/oo/gi, ['UW']],
  [/ee/gi, ['IY']],
  [/ea/gi, ['IY']],
  [/ai/gi, ['EY']],
  [/ay/gi, ['EY']],
  [/oa/gi, ['OW']],
  [/ow/gi, ['OW']],
  [/ou/gi, ['AW']],
  [/au/gi, ['AO']],
  [/aw/gi, ['AO']],
  [/oi/gi, ['OY']],
  [/oy/gi, ['OY']],
  [/ie/gi, ['IY']],
  [/ei/gi, ['IY']],
  [/ue/gi, ['UW']],
  [/ew/gi, ['UW']],

  // R-controlled vowels
  [/ar/gi, ['AA', 'R']],
  [/er/gi, ['ER']],
  [/ir/gi, ['ER']],
  [/or/gi, ['AO', 'R']],
  [/ur/gi, ['ER']],

  // Single vowels (long with silent e handled by context)
  [/a/gi, ['AE']],
  [/e/gi, ['EH']],
  [/i/gi, ['IH']],
  [/o/gi, ['AA']],
  [/u/gi, ['AH']],
  [/y$/gi, ['IY']],
  [/y/gi, ['Y']],

  // Consonants
  [/b/gi, ['B']],
  [/c(?=[eiy])/gi, ['S']],
  [/c/gi, ['K']],
  [/d/gi, ['D']],
  [/f/gi, ['F']],
  [/g(?=[eiy])/gi, ['JH']],
  [/g/gi, ['G']],
  [/h/gi, ['HH']],
  [/j/gi, ['JH']],
  [/k/gi, ['K']],
  [/l/gi, ['L']],
  [/m/gi, ['M']],
  [/n/gi, ['N']],
  [/p/gi, ['P']],
  [/r/gi, ['R']],
  [/s/gi, ['S']],
  [/t/gi, ['T']],
  [/v/gi, ['V']],
  [/w/gi, ['W']],
  [/x/gi, ['K', 'S']],
  [/z/gi, ['Z']],
];

/**
 * Convert a word to phonemes
 * @param {string} word - Word to convert
 * @returns {string[]} Array of phonemes
 */
export function wordToPhonemes(word) {
  const lower = word.toLowerCase().trim();

  // Check dictionary first
  if (dictionary[lower]) {
    return dictionary[lower];
  }

  // Apply rules
  let remaining = lower;
  const phonemes = [];

  while (remaining.length > 0) {
    let matched = false;

    for (const [pattern, phones] of rules) {
      const match = remaining.match(pattern);
      if (match && match.index === 0) {
        phonemes.push(...phones);
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Skip unmatched character
      remaining = remaining.slice(1);
    }
  }

  return phonemes;
}

/**
 * Convert text to phonemes
 * @param {string} text - Text to convert
 * @returns {Array<{word: string, phonemes: string[]}>} Words with their phonemes
 */
export function textToPhonemes(text) {
  // Split into words, keeping punctuation info
  const words = text.match(/[\w']+|[^\w\s]/g) || [];

  return words.map(word => {
    if (/^[^\w]+$/.test(word)) {
      // Punctuation - add pause
      return { word, phonemes: [''], isPunctuation: true };
    }
    return { word, phonemes: wordToPhonemes(word), isPunctuation: false };
  });
}
