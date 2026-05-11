import os
import re

from lip_sync.domain.models import LipSyncMetadata, LipSyncResult, MouthCue
from lip_sync.domain.phoneme_map import phoneme_to_rhubarb
from lip_sync.infrastructure.audio_utils import get_audio_duration, save_temp_audio
from lip_sync.infrastructure.g2p_client import G2PClient
from lip_sync.infrastructure.whisper_client import WhisperClient


class LipSyncService:
    def __init__(self, whisper_client: WhisperClient, g2p_client: G2PClient):
        self.whisper = whisper_client
        self.g2p = g2p_client

    def process(
        self,
        audio_bytes: bytes,
        suffix: str = ".mp3",
        text: str | None = None,
    ) -> LipSyncResult:
        temp_path = save_temp_audio(audio_bytes, suffix)
        try:
            duration = get_audio_duration(temp_path)
            words = self.whisper.transcribe(temp_path)

            if not words and text:
                words = self._distribute_text_evenly(text, duration)

            mouth_cues = self._words_to_cues(words, duration)

            return LipSyncResult(
                metadata=LipSyncMetadata(duration=duration),
                mouthCues=mouth_cues,
            )
        finally:
            os.unlink(temp_path)

    def _words_to_cues(
        self, words: list[dict], total_duration: float
    ) -> list[MouthCue]:
        cues: list[MouthCue] = []
        prev_end = 0.0

        for w in words:
            # Silence gap before this word
            if w["start"] > prev_end + 0.01:
                cues.append(
                    MouthCue(start=round(prev_end, 3), end=round(w["start"], 3), value="X")
                )

            phonemes = self.g2p.word_to_phonemes(w["word"])
            if not phonemes:
                cues.append(
                    MouthCue(start=round(w["start"], 3), end=round(w["end"], 3), value="X")
                )
                prev_end = w["end"]
                continue

            word_duration = w["end"] - w["start"]
            phoneme_duration = word_duration / len(phonemes)

            for i, phoneme in enumerate(phonemes):
                start = w["start"] + i * phoneme_duration
                end = start + phoneme_duration
                value = phoneme_to_rhubarb(phoneme)
                cues.append(
                    MouthCue(start=round(start, 3), end=round(end, 3), value=value)
                )

            prev_end = w["end"]

        # Trailing silence
        if prev_end < total_duration:
            cues.append(
                MouthCue(start=round(prev_end, 3), end=round(total_duration, 3), value="X")
            )

        return cues

    def _distribute_text_evenly(
        self, text: str, duration: float
    ) -> list[dict]:
        """Fallback when Whisper returns no words: distribute evenly."""
        words = re.findall(r"[\w']+", text)
        if not words:
            return []
        per_word = duration / len(words)
        return [
            {"word": w, "start": i * per_word, "end": (i + 1) * per_word}
            for i, w in enumerate(words)
        ]
