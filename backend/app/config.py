from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/seamlessbook"
    secret_key: str = "dev-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 1 week
    openrouteservice_api_key: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
