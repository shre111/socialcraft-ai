from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    supabase_url: str
    supabase_service_key: str
    anthropic_api_key: str
    frontend_url: str = "http://localhost:3000"

    # Optional social platform keys
    meta_app_id: str = ""
    meta_app_secret: str = ""
    youtube_api_key: str = ""
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""


settings = Settings()  # type: ignore[call-arg]
