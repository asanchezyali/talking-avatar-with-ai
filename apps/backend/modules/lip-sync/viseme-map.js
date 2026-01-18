/**
 * Oculus OVR Viseme Mapping
 * Maps phonemes to the 15 standard Oculus visemes used by Ready Player Me
 */

// Phoneme to Viseme mapping (ARPAbet to Oculus OVR)
export const phonemeToViseme = {
  // Silence
  '': 'sil',
  ' ': 'sil',

  // Vowels
  'AA': 'aa',  // father
  'AE': 'aa',  // cat
  'AH': 'aa',  // but
  'AO': 'O',   // dog
  'AW': 'O',   // how
  'AY': 'aa',  // my
  'EH': 'E',   // bed
  'ER': 'E',   // bird
  'EY': 'E',   // say
  'IH': 'I',   // bit
  'IY': 'I',   // beat
  'OW': 'O',   // go
  'OY': 'O',   // boy
  'UH': 'U',   // book
  'UW': 'U',   // boot

  // Consonants
  'B': 'PP',   // boy
  'CH': 'CH',  // chin
  'D': 'DD',   // dog
  'DH': 'TH',  // this
  'F': 'FF',   // fish
  'G': 'kk',   // go
  'HH': 'sil', // hat (silent/breath)
  'JH': 'CH',  // judge
  'K': 'kk',   // cat
  'L': 'nn',   // love
  'M': 'PP',   // mom
  'N': 'nn',   // no
  'NG': 'kk',  // sing
  'P': 'PP',   // pet
  'R': 'RR',   // red
  'S': 'SS',   // sun
  'SH': 'CH',  // she
  'T': 'DD',   // top
  'TH': 'TH',  // think
  'V': 'FF',   // very
  'W': 'U',    // way
  'Y': 'I',    // yes
  'Z': 'SS',   // zoo
  'ZH': 'CH',  // measure
};

// Viseme display names for debugging
export const visemeNames = {
  'sil': 'Silence',
  'PP': 'P, B, M',
  'FF': 'F, V',
  'TH': 'Th',
  'DD': 'T, D',
  'kk': 'K, G',
  'CH': 'Ch, J, Sh',
  'SS': 'S, Z',
  'nn': 'N, L',
  'RR': 'R',
  'aa': 'A',
  'E': 'E',
  'I': 'I',
  'O': 'O',
  'U': 'U',
};

// Viseme to Ready Player Me morph target mapping
export const visemeToMorphTarget = {
  'sil': 'viseme_sil',
  'PP': 'viseme_PP',
  'FF': 'viseme_FF',
  'TH': 'viseme_TH',
  'DD': 'viseme_DD',
  'kk': 'viseme_kk',
  'CH': 'viseme_CH',
  'SS': 'viseme_SS',
  'nn': 'viseme_nn',
  'RR': 'viseme_RR',
  'aa': 'viseme_aa',
  'E': 'viseme_E',
  'I': 'viseme_I',
  'O': 'viseme_O',
  'U': 'viseme_U',
};
