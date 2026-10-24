import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DEMO_MODE: bool = True
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    DATABASE_URL: str = "sqlite+aiosqlite:///./legacybridge.db"
    TINYFISH_API_KEY: str = "tf_live_sample_key"
    TINYFISH_BASE_URL: str = "https://agent.tinyfish.ai"
    OPENAI_API_KEY: str = "sk-placeholder"
    LLM_MODEL: str = "gpt-4o-mini"
    SLACK_WEBHOOK_URL: str = "https://hooks.slack.com/services/MOCK/SLACK/WEBHOOK"
    SECRET_KEY: str = "legacy-bridge-super-secret-dev-key-hackathon2026"
    PORTAL_URL: str = "http://localhost:8080"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
