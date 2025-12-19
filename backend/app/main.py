from fastapi import FastAPI
from app.core.database import engine
from fastapi.middleware.cors import CORSMiddleware

# This ensures all your models (like TestItem) are loaded into memory.
from app.core.base import Base 

# Import all models, so that Base.metadata.create_all() works
from app.modules.test_crud.router import router as test_crud_router

# 2. This command creates the table ONLY if Base knows about the model
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MASSS API")

# -------------------------
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",  # React scripts default port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ------------------------

app.include_router(test_crud_router)

@app.get("/")
def root():
    return {"message": "Welcome to HelpMate"}