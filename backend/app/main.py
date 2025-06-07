from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import paciente, diagnostico 
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/images", StaticFiles(directory="app/images"), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(paciente.router)
app.include_router(diagnostico.router)