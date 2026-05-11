from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    whisper_model: str = "base"
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"

    model_config = {"env_prefix": "LIP_SYNC_"}
