from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HelpMate"
    PROJECT_VERSION: str = "1.0.0"
    
    # By defining this without a default value, Pydantic will 
    # automatically raise an error if it's missing in .env
    DATABASE_URL: str 

    class Config:
        # This tells Pydantic to read the .env file automatically
        env_file = ".env"

settings = Settings()