from fastapi import FastAPI
<<<<<<< HEAD
=======
from pydantic import BaseModel
from scripts.simple_generator import generate_tshirt_pattern
import os

app = FastAPI()

# ✅ Modèle de données pour les paramètres du t-shirt
class TShirtParams(BaseModel):
    sleeve_length: float  # longueur de manche
    bust: float           # tour de poitrine
    neckline: str         # type d'encolure
    fit: str              # type de coupe (slim, regular, etc.)

# ✅ Route de test
@app.get("/")
def read_root():
    return {"status": "Backend OK"}

# ✅ Route principale pour générer un patron
@app.post("/generate_pattern/")
def generate_pattern(params: TShirtParams):
    # Dossier de sortie
    output_dir = os.path.join(os.path.dirname(__file__), "../output")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "pattern.svg")

    # Appel du générateur
    generate_tshirt_pattern(
        sleeve_length=params.sleeve_length,
        bust=params.bust,
        neckline=params.neckline,
        fit=params.fit,
        output_file=output_path
    )

    return {
        "message": "Patron généré avec succès 🎉",
        "path": output_path.replace("\\", "/")
    }
>>>>>>> 3de4ee1 (Ajout des dernières modifications backend)

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "Backend OK"}
