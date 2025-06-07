import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import paciente, diagnostico 
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.mount("/images", StaticFiles(directory="app/images"), name="images")

frontend_url = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(paciente.router)
app.include_router(diagnostico.router)