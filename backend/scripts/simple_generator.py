import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm  # Importez les centimètres !

def generate_pattern(params, output_dir):
    filename = f"tshirt_pattern_{params['torso']}_{params['sleeve']}.pdf"
    filepath = os.path.join(output_dir, filename)

    c = canvas.Canvas(filepath, pagesize=A4)
    c.setFont("Helvetica", 10)
    c.drawString(1 * cm, 28 * cm, "Patron de T-Shirt (Taille personnalisée)")

    # --- 1. Définir les mesures (en cm) ---
    # On part du principe que :
    # params['torso'] = Largeur totale de la poitrine (ex: 50 pour M)
    # params['neck'] = Largeur totale de l'encolure (ex: 18)
    # params['sleeve'] = Longueur de la manche (ex: 20)
    
    # Les patrons sont dessinés en DEMI-largeur (car coupés au pli)
    demi_torse = (params['torso'] / 2) * cm
    demi_encolure = (params['neck'] / 2) * cm
    
    # On invente des proportions logiques pour le reste
    longueur_totale = demi_torse * 2.8  # Longueur T-shirt
    prof_emmanchure = demi_torse * 0.9   # Profondeur de l'emmanchure
    prof_encolure = demi_encolure * 1.0  # Profondeur de l'encolure
    chute_epaule = 2 * cm
    
    # Point de départ sur la feuille PDF
    x0 = 4 * cm
    y0 = 6 * cm

    # --- 2. Dessiner le DEVANT (FRONT) ---
    
    # On commence le tracé (Path)
    p = c.beginPath()
    
    # Point A: Milieu bas (au pli)
    p.moveTo(x0, y0)
    
    # Point B: Côté bas (ourlet)
    p.lineTo(x0 + demi_torse, y0)
    
    # Point C: Coin de l'emmanchure (sous le bras)
    p.lineTo(x0 + demi_torse, y0 + prof_emmanchure)
    
    # Point D: Bout de l'épaule
    # C'est une COURBE entre C et D
    p.curveTo(
        x0 + demi_torse - (2 * cm), y0 + prof_emmanchure + (10 * cm), # Point de contrôle 1
        x0 + demi_torse, y0 + longueur_totale - chute_epaule,      # Point de contrôle 2
        x0 + demi_encolure, y0 + longueur_totale - chute_epaule     # Point D (arrivée)
    )

    # Point E: Coin de l'encolure (au pli)
    # C'est une COURBE entre D et E
    p.curveTo(
        x0 + demi_encolure, y0 + longueur_totale - chute_epaule - (prof_encolure / 2), # Contrôle 1
        x0 + (demi_encolure / 2), y0 + longueur_totale - prof_encolure,              # Contrôle 2
        x0, y0 + longueur_totale - prof_encolure                         # Point E (arrivée)
    )

    # Point final: Retour au Point A (ligne du pli)
    p.lineTo(x0, y0)
    
    # On dessine le tracé en noir
    c.drawPath(p, stroke=1, fill=0)

    # --- 3. Ajouter les textes et marquages ---
    
    # Ligne du "Pli" (milieu)
    c.setDash(3, 3) # Ligne en pointillés
    c.line(x0, y0, x0, y0 + longueur_totale)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x0 + 0.5 * cm, y0 + longueur_totale / 2, "MILIEU - Couper au Pli")
    
    # Droit-fil
    c.setDash() # Ligne pleine
    c.line(x0 + demi_torse / 2, y0 + 2*cm, x0 + demi_torse / 2, y0 + 12*cm)
    c.drawString(x0 + (demi_torse / 2) - 0.5*cm, y0 + 13*cm, "Droit-Fil")

    # Infos
    c.setFont("Helvetica", 9)
    c.drawString(x0 + demi_torse + 1*cm, y0, f"Largeur: {params['torso']} cm")
    c.drawString(x0 + demi_torse + 1*cm, y0 + 2*cm, f"Encolure: {params['neck']} cm")

    # N'oubliez pas de faire la même chose pour le DOS et la MANCHE
    c.showPage()
    c.setFont("Helvetica", 14)
    c.drawString(5*cm, 15*cm, "Pièces DOS et MANCHE à ajouter...")

    c.save()
    return filepath