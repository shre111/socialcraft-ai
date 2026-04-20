from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator


REQUIRED_VARS = ["supabase_url", "supabase_service_key", "anthropic_api_key"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    supabase_url: str = ""
    supabase_service_key: str = ""
    anthropic_api_key: str = ""
    frontend_url: str = "http://localhost:3000"

    # Optional social platform keys
    meta_app_id: str = ""
    meta_app_secret: str = ""
    youtube_api_key: str = ""
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""

    @model_validator(mode="after")
    def check_required(self) -> "Settings":
        missing = [var for var in REQUIRED_VARS if not getattr(self, var)]
        if missing:
            lines = "\n".join(f"  - {v.upper()}" for v in missing)
            raise ValueError(
                f"\n\n[SocialCraft AI] Missing required environment variables:\n{lines}\n\n"
                "Add them to backend/.env and restart the server.\n"
            )
        return self


settings = Settings()  # type: ignore[call-arg]
