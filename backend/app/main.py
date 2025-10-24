from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from scripts.simple_generator import generate_pattern
import os

app = FastAPI()

# Autoriser le front-end à communiquer avec le backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Modèle des paramètres du T-shirt
class TshirtParams(BaseModel):
    sleeve: int
    torso: int
    neck: int

# Dossier de sortie
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Route pour générer le patron
@app.post("/generate")
def generate_tshirt(params: TshirtParams):
    # Génération PDF directement dans output
    file_path = generate_pattern(params.dict(), OUTPUT_DIR)
    return FileResponse(file_path, filename=os.path.basename(file_path))
