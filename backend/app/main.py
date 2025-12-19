from fastapi import FastAPI
from app.core.database import engine

# This ensures all your models (like TestItem) are loaded into memory.
from app.core.base import Base 

# Import all models, so that Base.metadata.create_all() works
from app.modules.test_crud.router import router as test_crud_router

# 2. This command creates the table ONLY if Base knows about the model
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MASSS API")

app.include_router(test_crud_router)

@app.get("/")
def root():
    return {"message": "Welcome to MiPOS API"}