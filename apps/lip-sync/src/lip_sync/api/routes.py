import asyncio

from fastapi import APIRouter, File, Form, Request, UploadFile

from lip_sync.application.lip_sync_service import LipSyncService


def create_router() -> APIRouter:
    router = APIRouter()

    @router.post("/lip-sync")
    async def lip_sync(
        request: Request,
        audio: UploadFile = File(..., description="Audio file (MP3/WAV)"),
        text: str | None = Form(None),
    ):
        whisper_client = request.app.state.whisper_client
        g2p_client = request.app.state.g2p_client
        service = LipSyncService(whisper_client, g2p_client)

        content = await audio.read()
        suffix = ".wav" if audio.content_type == "audio/wav" else ".mp3"
        result = await asyncio.to_thread(
            service.process, content, suffix, text
        )
        return result.model_dump()

    @router.get("/health")
    async def health():
        return {"status": "ok"}

    return router
