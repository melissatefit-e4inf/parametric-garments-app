from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
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

# Route pour générer le patron
@app.post("/generate")
def generate_tshirt(params: TshirtParams):
    # Simulation - retourne un message de succès
    return {
        "message": "Pattern generation successful!",
        "file": f"tshirt_{params.sleeve}_{params.torso}_{params.neck}.pdf",
        "status": "success"
    }

# Route de test
@app.get("/")
def read_root():
    return {"message": "Backend API is running!"}

# Route pour vérifier la santé de l'API
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "parametric-garments-backend"}