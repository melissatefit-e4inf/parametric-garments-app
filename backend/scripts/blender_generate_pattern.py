import bpy
import sys
import os

# Arguments : taille + chemin fichier temporaire
if "--" in sys.argv:
    idx = sys.argv.index("--")
    size = sys.argv[idx + 1]
    output_file = sys.argv[idx + 2]
else:
    size = "M"
    output_file = "pattern_temp.stl"

def generate_pattern(size="M"):
    # Exemple minimal : créer un cube et exporter en STL
    bpy.ops.mesh.primitive_cube_add(size=2)
    bpy.ops.export_mesh.stl(filepath=output_file)
    print(f"STL generated at: {output_file}")

if __name__ == "__main__":
    generate_pattern(size)
