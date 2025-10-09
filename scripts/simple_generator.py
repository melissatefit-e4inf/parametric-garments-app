import svgwrite

def generate_tshirt_pattern(sleeve_length, bust, neckline="round", fit="regular", output_file="../output/pattern.svg"):
    """
    Génère un patron simplifié de t-shirt (SVG)
    sleeve_length : longueur de manche en mm
    bust : largeur du buste en mm
    neckline : type d'encolure ('round', 'v', 'square')
    fit : type de coupe ('slim', 'regular', 'oversize')
    """

    dwg = svgwrite.Drawing(output_file, profile='tiny', size=("800mm", "800mm"))

    # Calculs simples (adaptés à la démo)
    body_width = bust
    body_height = 600
    sleeve_height = sleeve_length
    neckline_depth = 50 if neckline == "round" else (70 if neckline == "v" else 40)

    # Corps du t-shirt
    dwg.add(dwg.rect(insert=(100, 100),
                     size=(body_width, body_height),
                     fill='none',
                     stroke='black',
                     stroke_width=2))

    # Manches
    dwg.add(dwg.polygon(points=[
        (100, 100), (100 - 80, 100 - sleeve_height),
        (100 + 200, 100 - sleeve_height), (100 + 200, 100)
    ],
        fill='none', stroke='blue', stroke_width=2))

    dwg.add(dwg.polygon(points=[
        (100 + body_width, 100),
        (100 + body_width + 80, 100 - sleeve_height),
        (100 + body_width - 200, 100 - sleeve_height),
        (100 + body_width - 200, 100)
    ],
        fill='none', stroke='blue', stroke_width=2))

    # Encolure
    if neckline == "round":
        dwg.add(dwg.circle(center=(100 + body_width / 2, 100), r=neckline_depth, stroke='red', fill='none'))
    elif neckline == "v":
        dwg.add(dwg.polyline(points=[
            (100 + body_width / 2 - neckline_depth, 100),
            (100 + body_width / 2, 100 + neckline_depth),
            (100 + body_width / 2 + neckline_depth, 100)
        ],
            stroke='red', fill='none', stroke_width=2))
    elif neckline == "square":
        dwg.add(dwg.rect(insert=(100 + body_width / 2 - neckline_depth, 100),
                         size=(2 * neckline_depth, neckline_depth),
                         fill='none', stroke='red', stroke_width=2))

    dwg.add(dwg.text("T-shirt Pattern", insert=(100, 90), fill='black', font_size="20px"))
    dwg.save()
    print(f"✅ Patron sauvegardé dans : {output_file}")

