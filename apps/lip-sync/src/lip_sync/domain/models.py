from pydantic import BaseModel


class MouthCue(BaseModel):
    start: float
    end: float
    value: str  # Rhubarb format: A-H, X


class LipSyncMetadata(BaseModel):
    soundFile: str = ""
    duration: float
    generatedBy: str = "python-lip-sync"


class LipSyncResult(BaseModel):
    metadata: LipSyncMetadata
    mouthCues: list[MouthCue]
