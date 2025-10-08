// Écouteurs pour sliders (mise à jour live des valeurs affichées)
document.addEventListener('DOMContentLoaded', function() {
    const sliders = ['sleeve-length', 'sleeve-opening', 'torso-length', 'neckline'];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        const valSpan = document.getElementById(id + '-val');
        slider.addEventListener('input', function() {
            valSpan.textContent = this.value;
            updatePreview();  // Appel pour 3D (mock pour l'instant)
        });
    });

    // Bouton générer : Collecte params et prépare envoi backend
    document.getElementById('generate-btn').addEventListener('click', function() {
        const params = {
            sleeve_length: document.getElementById('sleeve-length').value,
            sleeve_opening: document.getElementById('sleeve-opening').value,
            torso_length: document.getElementById('torso-length').value,
            neckline: document.getElementById('neckline').value,
            fit: document.getElementById('fit').value
        };
        console.log('Paramètres collectés :', params);  // Debug
        sendToBackend(params);  // Fonction pour backend (mock)
        document.getElementById('status').textContent = 'Patron généré ! (En attente backend pour SVG/PDF)';
    });
});

// Fonction mock pour envoi backend (remplace par fetch plus tard)
function sendToBackend(params) {
    // Mock : Simule envoi API
    alert('Envoi au backend : ' + JSON.stringify(params));
    // Plus tard : fetch('http://localhost:8000/generate-pattern', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(params)
    // }).then(response => response.json()).then(data => {
    //     // Gère réponse : update 3D ou download SVG
    //     console.log('Réponse backend :', data);
    // });
}

// Mock preview (texte pour l'instant, 3D à Étape 3)
function updatePreview() {
    document.getElementById('status').textContent = 'Preview mis à jour (3D à venir)';
}