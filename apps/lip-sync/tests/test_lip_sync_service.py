from unittest.mock import MagicMock

from lip_sync.application.lip_sync_service import LipSyncService
from lip_sync.domain.phoneme_map import VALID_RHUBARB_VALUES


def _make_service(words: list[dict], duration: float = 2.0):
    """Create a LipSyncService with mocked Whisper and g2p clients."""
    whisper_client = MagicMock()
    whisper_client.transcribe.return_value = words

    g2p_client = MagicMock()
    # Return realistic phonemes per word
    phoneme_map = {
        "Hello": ["HH", "AH0", "L", "OW1"],
        "world": ["W", "ER1", "L", "D"],
    }
    g2p_client.word_to_phonemes.side_effect = lambda w: phoneme_map.get(w, ["AH0"])

    service = LipSyncService(whisper_client, g2p_client)
    return service


def test_basic_lip_sync(tmp_path):
    """Process returns valid LipSyncResult with correct structure."""
    words = [
        {"word": "Hello", "start": 0.0, "end": 0.5},
        {"word": "world", "start": 0.6, "end": 1.2},
    ]
    service = _make_service(words, duration=1.5)

    # Create a minimal WAV file for pydub
    import wave

    wav_path = tmp_path / "test.wav"
    with wave.open(str(wav_path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b"\x00\x00" * 24000)  # 1.5 seconds

    with open(wav_path, "rb") as f:
        audio_bytes = f.read()

    result = service.process(audio_bytes, suffix=".wav")

    assert result.metadata.generatedBy == "python-lip-sync"
    assert result.metadata.duration > 0
    assert len(result.mouthCues) > 0


def test_all_cue_values_are_valid_rhubarb(tmp_path):
    """Every mouth cue value must be a valid Rhubarb letter."""
    words = [
        {"word": "Hello", "start": 0.0, "end": 0.5},
        {"word": "world", "start": 0.6, "end": 1.0},
    ]
    service = _make_service(words)

    import wave

    wav_path = tmp_path / "test.wav"
    with wave.open(str(wav_path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b"\x00\x00" * 32000)

    with open(wav_path, "rb") as f:
        audio_bytes = f.read()

    result = service.process(audio_bytes, suffix=".wav")

    for cue in result.mouthCues:
        assert cue.value in VALID_RHUBARB_VALUES, (
            f"Invalid Rhubarb value '{cue.value}' at {cue.start}-{cue.end}"
        )


def test_cues_are_chronologically_ordered(tmp_path):
    """Mouth cues must be in chronological order with no overlaps."""
    words = [
        {"word": "Hello", "start": 0.0, "end": 0.5},
        {"word": "world", "start": 0.6, "end": 1.0},
    ]
    service = _make_service(words)

    import wave

    wav_path = tmp_path / "test.wav"
    with wave.open(str(wav_path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b"\x00\x00" * 32000)

    with open(wav_path, "rb") as f:
        audio_bytes = f.read()

    result = service.process(audio_bytes, suffix=".wav")

    for i in range(1, len(result.mouthCues)):
        prev = result.mouthCues[i - 1]
        curr = result.mouthCues[i]
        assert curr.start >= prev.start, (
            f"Cue {i} starts at {curr.start} before cue {i-1} at {prev.start}"
        )


def test_silence_gaps_are_filled(tmp_path):
    """Gaps between words should be filled with silence (X)."""
    words = [
        {"word": "Hello", "start": 0.2, "end": 0.5},
        {"word": "world", "start": 0.8, "end": 1.0},
    ]
    service = _make_service(words)

    import wave

    wav_path = tmp_path / "test.wav"
    with wave.open(str(wav_path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b"\x00\x00" * 24000)

    with open(wav_path, "rb") as f:
        audio_bytes = f.read()

    result = service.process(audio_bytes, suffix=".wav")

    # First cue should be silence (gap before "Hello" at 0.2)
    assert result.mouthCues[0].value == "X"
    assert result.mouthCues[0].start == 0.0

    # Find the gap between words
    silence_cues = [c for c in result.mouthCues if c.value == "X" and c.start >= 0.5]
    assert len(silence_cues) > 0, "Expected silence gap between words"


def test_fallback_text_distribution():
    """When Whisper returns no words, text fallback should work."""
    service = _make_service(words=[], duration=2.0)

    result = service._distribute_text_evenly("Hello world", 2.0)
    assert len(result) == 2
    assert result[0]["word"] == "Hello"
    assert result[0]["start"] == 0.0
    assert result[0]["end"] == 1.0
    assert result[1]["word"] == "world"
    assert result[1]["start"] == 1.0
    assert result[1]["end"] == 2.0
