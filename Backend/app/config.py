from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "RaktSaathi API"
    environment: str = "development"
    database_url: str = "sqlite:///./raktsaathi.db"
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_upload_folder: str = "raktsaathi"
    snowflake_account: str = ""
    snowflake_user: str = ""
    snowflake_password: str = ""
    snowflake_warehouse: str = ""
    snowflake_database: str = ""
    snowflake_schema: str = "PUBLIC"
    snowflake_role: str = ""
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    @property
    def cors_origins(self) -> list[str]:
        return [x.strip() for x in self.frontend_origins.split(",") if x.strip()]

    @property
    def cloudinary_configured(self) -> bool:
        return bool(self.cloudinary_cloud_name and self.cloudinary_api_key and self.cloudinary_api_secret)

    @property
    def snowflake_configured(self) -> bool:
        return all([self.snowflake_account, self.snowflake_user, self.snowflake_password,
                    self.snowflake_warehouse, self.snowflake_database])

settings = Settings()
