from lip_sync.domain.phoneme_map import (
    ARPABET_TO_RHUBARB,
    VALID_RHUBARB_VALUES,
    phoneme_to_rhubarb,
)


def test_all_mapped_values_are_valid_rhubarb():
    for phoneme, rhubarb in ARPABET_TO_RHUBARB.items():
        assert rhubarb in VALID_RHUBARB_VALUES, (
            f"Phoneme {phoneme} maps to invalid Rhubarb value '{rhubarb}'"
        )


def test_stress_markers_are_stripped():
    assert phoneme_to_rhubarb("AH0") == "A"
    assert phoneme_to_rhubarb("OW1") == "D"
    assert phoneme_to_rhubarb("IY2") == "C"
    assert phoneme_to_rhubarb("EY1") == "C"
    assert phoneme_to_rhubarb("UW0") == "E"


def test_consonants_no_stress():
    assert phoneme_to_rhubarb("B") == "B"
    assert phoneme_to_rhubarb("P") == "B"
    assert phoneme_to_rhubarb("M") == "B"
    assert phoneme_to_rhubarb("F") == "F"
    assert phoneme_to_rhubarb("TH") == "G"
    assert phoneme_to_rhubarb("DH") == "G"
    assert phoneme_to_rhubarb("HH") == "X"


def test_unknown_phoneme_returns_silence():
    assert phoneme_to_rhubarb("XX") == "X"
    assert phoneme_to_rhubarb("") == "X"
    assert phoneme_to_rhubarb("???") == "X"


def test_vowel_mappings():
    assert phoneme_to_rhubarb("AA") == "A"
    assert phoneme_to_rhubarb("AO") == "D"
    assert phoneme_to_rhubarb("EH") == "C"
    assert phoneme_to_rhubarb("IH") == "C"
    assert phoneme_to_rhubarb("UH") == "E"
