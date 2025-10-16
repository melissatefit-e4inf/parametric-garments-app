from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm

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
    fit: str = "regular"
    collar: str = "crew"

# Créer le dossier output s'il n'existe pas
output_dir = os.path.join(os.path.dirname(__file__), "..", "output")
os.makedirs(output_dir, exist_ok=True)

def generate_sewing_pattern(params, filepath):
    """Génère un vrai patron de couture PDF"""
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4
    
    # Titre
    c.setFont("Helvetica-Bold", 16)
    c.drawString(2*cm, height - 3*cm, "PATRON DE COUTURE - T-SHIRT")
    
    # Informations des paramètres
    c.setFont("Helvetica", 10)
    c.drawString(2*cm, height - 4.5*cm, f"Longueur manches: {params['sleeve']}cm")
    c.drawString(2*cm, height - 5*cm, f"Longueur torse: {params['torso']}cm")
    c.drawString(2*cm, height - 5.5*cm, f"Encolure: {params['neck']}cm")
    c.drawString(2*cm, height - 6*cm, f"Coupe: {params['fit']} - Col: {params['collar']}")
    
    # Échelle 1:4 (1cm réel = 0.25cm sur PDF)
    scale = 0.25
    
    # Position de départ pour le patron
    start_x = 5 * cm
    start_y = height - 10 * cm
    
    # Dessiner le patron principal (simplifié)
    c.setLineWidth(1)
    
    # Corps du T-shirt
    torso_width = params['torso'] * scale * 0.6
    torso_height = params['torso'] * scale
    
    # Rectangle principal
    c.rect(start_x, start_y - torso_height, torso_width, torso_height)
    
    # Épaule
    shoulder_width = torso_width * 0.8
    shoulder_x = start_x + (torso_width - shoulder_width) / 2
    c.line(shoulder_x, start_y, shoulder_x + shoulder_width, start_y)
    
    # Encolure
    neck_depth = params['neck'] * scale * 0.5
    if params['collar'] == 'vneck':
        # Col en V
        c.line(shoulder_x + shoulder_width/2, start_y, 
               shoulder_x + shoulder_width/2, start_y - neck_depth)
    else:
        # Col rond
        neck_width = shoulder_width * 0.6
        neck_start_x = shoulder_x + (shoulder_width - neck_width) / 2
        c.roundRect(neck_start_x, start_y - neck_depth/2, neck_width, neck_depth, neck_depth/2)
    
    # Manches
    sleeve_length = params['sleeve'] * scale
    sleeve_width = params['sleeve'] * scale * 0.8
    
    # Manche gauche
    c.rect(start_x - sleeve_width, start_y - sleeve_length, sleeve_width, sleeve_length)
    # Manche droite
    c.rect(start_x + torso_width, start_y - sleeve_length, sleeve_width, sleeve_length)
    
    # Légendes et mesures
    c.setFont("Helvetica", 8)
    c.drawString(start_x + torso_width + 1*cm, start_y - sleeve_length/2, f"MANCHE\n{params['sleeve']}cm")
    c.drawString(start_x + torso_width/2, start_y - torso_height - 1*cm, f"CORPS\n{params['torso']}cm")
    
    # Échelle
    c.drawString(2*cm, 2*cm, f"Échelle: 1:4 (1cm = {scale}cm sur le PDF)")
    c.drawString(2*cm, 1.5*cm, "Imprimer à 100% pour patron réel")
    
    c.save()
    return filepath

# Route pour générer le patron
@app.post("/generate")
async def generate_tshirt(params: TshirtParams):
    try:
        # Créer le nom de fichier
        filename = f"tshirt_{params.sleeve}_{params.torso}_{params.neck}_{params.fit}.pdf"
        filepath = os.path.join(output_dir, filename)
        
        # Générer le PDF
        generate_sewing_pattern(params.dict(), filepath)
        
        return {
            "message": "Pattern generation successful!",
            "file": filename,
            "file_url": f"/download/{filename}",
            "parameters": params.dict(),
            "status": "success"
        }
    except Exception as e:
        return {
            "message": f"Error generating pattern: {str(e)}",
            "status": "error"
        }

# Route pour télécharger le fichier
@app.get("/download/{filename}")
def download_file(filename: str):
    filepath = os.path.join(output_dir, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type='application/pdf', filename=filename)
    return {"error": "File not found"}

# Route de test
@app.get("/")
def read_root():
    return {"message": "✅ Backend API is running!", "version": "2.0"}

# Route pour vérifier la santé de l'API
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "parametric-garments-backend"}