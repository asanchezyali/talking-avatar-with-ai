# ARPAbet phoneme → Rhubarb viseme letter (A-H, X)
#
# Derived by composing two existing JS mappings:
#   1. viseme-map.js: ARPAbet → Oculus OVR viseme
#   2. lip-sync-service.js visemeToRhubarb(): Oculus viseme → Rhubarb letter
#
# The frontend (visemesMapping.js) maps Rhubarb letters to morph targets:
#   A→viseme_PP, B→viseme_kk, C→viseme_I, D→viseme_AA,
#   E→viseme_O, F→viseme_U, G→viseme_FF, H→viseme_TH, X→viseme_PP

ARPABET_TO_RHUBARB: dict[str, str] = {
    # Vowels
    "AA": "A",  # father
    "AE": "A",  # cat
    "AH": "A",  # but
    "AO": "D",  # dog
    "AW": "D",  # how
    "AY": "A",  # my
    "EH": "C",  # bed
    "ER": "C",  # bird
    "EY": "C",  # say
    "IH": "C",  # bit
    "IY": "C",  # beat
    "OW": "D",  # go
    "OY": "D",  # boy
    "UH": "E",  # book
    "UW": "E",  # boot
    # Consonants
    "B": "B",   # boy
    "CH": "H",  # chin
    "D": "H",   # dog
    "DH": "G",  # this
    "F": "F",   # fish
    "G": "H",   # go
    "HH": "X",  # hat (breath)
    "JH": "H",  # judge
    "K": "H",   # cat
    "L": "H",   # love
    "M": "B",   # mom
    "N": "H",   # no
    "NG": "H",  # sing
    "P": "B",   # pet
    "R": "H",   # red
    "S": "F",   # sun
    "SH": "H",  # she
    "T": "H",   # top
    "TH": "G",  # think
    "V": "F",   # very
    "W": "E",   # way
    "Y": "C",   # yes
    "Z": "F",   # zoo
    "ZH": "H",  # measure
}

VALID_RHUBARB_VALUES = frozenset("ABCDEFGHX")


def phoneme_to_rhubarb(phoneme: str) -> str:
    """Convert an ARPAbet phoneme to a Rhubarb viseme letter.

    Strips stress markers (0, 1, 2) that g2p-en appends to vowels.
    Returns 'X' (silence) for unknown phonemes.
    """
    clean = phoneme.rstrip("012")
    return ARPABET_TO_RHUBARB.get(clean, "X")
