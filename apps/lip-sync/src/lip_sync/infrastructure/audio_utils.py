import os
import tempfile

from pydub import AudioSegment


def get_audio_duration(file_path: str) -> float:
    """Get audio duration in seconds. Supports MP3 and WAV."""
    audio = AudioSegment.from_file(file_path)
    return audio.duration_seconds


def save_temp_audio(content: bytes, suffix: str = ".mp3") -> str:
    """Save audio bytes to a temporary file and return its path."""
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "wb") as f:
        f.write(content)
    return path
