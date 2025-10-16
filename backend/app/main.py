from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
import json

app = FastAPI()

# Autoriser le front-end à communiquer avec le backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Route pour générer le patron (version simplifiée)
@app.post("/generate")
async def generate_tshirt(sleeve: int, torso: int, neck: int):
    try:
        # Simulation de génération réussie
        filename = f"tshirt_{sleeve}_{torso}_{{neck}}.pdf"
        
        return {
            "message": "Pattern generation successful!",
            "file": filename,
            "parameters": {
                "sleeve_length": sleeve,
                "torso_length": torso, 
                "neckline": neck
            },
            "status": "success",
            "download_url": f"/download/{filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route de test
@app.get("/")
def read_root():
    return {"message": "✅ Backend API is running!", "version": "1.0"}

# Route pour vérifier la santé de l'API
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "parametric-garments-backend"}

# Route pour simuler le téléchargement
@app.get("/download/{filename}")
def download_file(filename: str):
    return {
        "message": f"File {filename} would be downloaded",
        "simulation": True
    }