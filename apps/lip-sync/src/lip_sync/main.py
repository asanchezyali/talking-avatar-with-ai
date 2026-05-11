import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from lip_sync.api.routes import create_router
from lip_sync.config import Settings
from lip_sync.infrastructure.g2p_client import G2PClient
from lip_sync.infrastructure.whisper_client import WhisperClient

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = Settings()
    app.state.whisper_client = WhisperClient(model_name=settings.whisper_model)
    app.state.g2p_client = G2PClient()
    yield


app = FastAPI(title="Lip Sync Service", lifespan=lifespan)
app.include_router(create_router(), prefix="/api")
