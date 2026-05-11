import logging

import whisper

logger = logging.getLogger(__name__)


class WhisperClient:
    def __init__(self, model_name: str = "base"):
        logger.info("Loading Whisper model '%s'...", model_name)
        self.model = whisper.load_model(model_name)
        logger.info("Whisper model loaded.")

    def transcribe(self, audio_path: str) -> list[dict]:
        """Transcribe audio and return word-level timestamps.

        Returns:
            List of dicts with keys: word (str), start (float), end (float).
        """
        result = self.model.transcribe(audio_path, word_timestamps=True)
        words = []
        for segment in result.get("segments", []):
            for w in segment.get("words", []):
                words.append({
                    "word": w["word"].strip(),
                    "start": w["start"],
                    "end": w["end"],
                })
        return words
