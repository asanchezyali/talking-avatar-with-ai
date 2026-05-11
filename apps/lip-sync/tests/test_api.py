import wave
from contextlib import asynccontextmanager
from io import BytesIO
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from lip_sync.api.routes import create_router
from lip_sync.domain.phoneme_map import VALID_RHUBARB_VALUES


def _create_wav_bytes(duration_seconds: float = 1.0) -> bytes:
    """Create minimal WAV file bytes for testing."""
    buf = BytesIO()
    with wave.open(buf, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        num_frames = int(16000 * duration_seconds)
        wf.writeframes(b"\x00\x00" * num_frames)
    return buf.getvalue()


def _create_mock_whisper():
    mock = MagicMock()
    mock.transcribe.return_value = [
        {"word": "Hello", "start": 0.0, "end": 0.4},
        {"word": "world", "start": 0.5, "end": 0.9},
    ]
    return mock


def _create_mock_g2p():
    mock = MagicMock()
    phonemes = {
        "Hello": ["HH", "AH0", "L", "OW1"],
        "world": ["W", "ER1", "L", "D"],
    }
    mock.word_to_phonemes.side_effect = lambda w: phonemes.get(w, ["AH0"])
    return mock


def _create_test_app():
    mock_whisper = _create_mock_whisper()
    mock_g2p = _create_mock_g2p()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.whisper_client = mock_whisper
        app.state.g2p_client = mock_g2p
        yield

    app = FastAPI(lifespan=lifespan)
    app.include_router(create_router(), prefix="/api")
    return app


@pytest.fixture
def client():
    app = _create_test_app()
    with TestClient(app) as c:
        yield c


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_lip_sync_endpoint(client):
    wav_bytes = _create_wav_bytes(1.0)

    response = client.post(
        "/api/lip-sync",
        files={"audio": ("test.wav", wav_bytes, "audio/wav")},
    )

    assert response.status_code == 200
    data = response.json()

    assert "metadata" in data
    assert "mouthCues" in data
    assert data["metadata"]["generatedBy"] == "python-lip-sync"
    assert data["metadata"]["duration"] > 0
    assert len(data["mouthCues"]) > 0

    for cue in data["mouthCues"]:
        assert "start" in cue
        assert "end" in cue
        assert "value" in cue
        assert cue["value"] in VALID_RHUBARB_VALUES


def test_lip_sync_with_text(client):
    wav_bytes = _create_wav_bytes(1.0)

    response = client.post(
        "/api/lip-sync",
        files={"audio": ("test.wav", wav_bytes, "audio/wav")},
        data={"text": "Hello world"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["mouthCues"]) > 0
