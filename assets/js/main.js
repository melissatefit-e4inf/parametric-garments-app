const API_BASE = location.hostname.includes('github.io')
  ? 'https://presystolic-ann-quintic.ngrok-free.dev' // <- ton URL ngrok actuelle
  : 'http://localhost:8000';


class GarmentsWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.config = {
            sleeveLength: 20,
            sleeveOpening: 30,
            torsoLength: 65,
            fit: 'regular',
            neckline: 8,
            collar: 'crew'
        };
        
        this.threeViewer = null;
        this.init();
    }

    async init() {
        this.initEventListeners();
        this.updateProgressBar();
        this.updateCurrentConfig();
        await this.init3DViewer();
    }

    async init3DViewer() {
        try {
            // Charger Three.js dynamiquement
            await this.loadThreeJS();
            
            this.threeViewer = new ThreeJSViewer('three-canvas');
            
            // Redimensionnement responsive
            window.addEventListener('resize', () => {
                if (this.threeViewer) {
                    this.threeViewer.onResize();
                }
            });
            
            console.log('✅ Three.js viewer initialized');
        } catch (error) {
            console.error('❌ Three.js initialization failed:', error);
        }
    }

    async loadThreeJS() {
        return new Promise((resolve, reject) => {
            if (window.THREE && window.OrbitControls) {
                resolve();
                return;
            }

            // Charger Three.js depuis CDN
            const threeScript = document.createElement('script');
            threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js';
            threeScript.onload = () => {
                // Charger OrbitControls
                const orbitScript = document.createElement('script');
                orbitScript.src = 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
                orbitScript.onload = resolve;
                orbitScript.onerror = reject;
                document.head.appendChild(orbitScript);
            };
            threeScript.onerror = reject;
            document.head.appendChild(threeScript);
        });
    }

    initEventListeners() {
        // Sliders
        document.getElementById('sleeve-length').addEventListener('input', (e) => {
            this.config.sleeveLength = parseInt(e.target.value);
            this.updateDisplayValue('sleeve-length-val', `SHORT (${e.target.value}cm)`);
            this.updateSummary();
            this.updateCurrentConfig();
        });

        document.getElementById('sleeve-opening').addEventListener('input', (e) => {
            this.config.sleeveOpening = parseInt(e.target.value);
            this.updateDisplayValue('sleeve-opening-val', `REGULAR (${e.target.value}cm)`);
            this.updateSummary();
            this.updateCurrentConfig();
        });

        document.getElementById('torso-length').addEventListener('input', (e) => {
            this.config.torsoLength = parseInt(e.target.value);
            this.updateDisplayValue('torso-length-val', `REGULAR (${e.target.value}cm)`);
            this.updateSummary();
            this.updateCurrentConfig();
        });

        document.getElementById('neckline').addEventListener('input', (e) => {
            this.config.neckline = parseInt(e.target.value);
            this.updateDisplayValue('neckline-val', `ROUND (${e.target.value}cm)`);
            this.updateSummary();
            this.updateCurrentConfig();
        });

        // Options de fit
        document.querySelectorAll('.fit-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.fit-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.config.fit = btn.dataset.value;
                this.updateSummary();
                this.updateCurrentConfig();
            });
        });

        // Options de collar
        document.querySelectorAll('.collar-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.collar-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.config.collar = btn.dataset.value;
                this.updateSummary();
                this.updateCurrentConfig();
            });
        });

        // Bouton génération
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generatePattern();
        });
    }

    nextStep(step) {
        this.currentStep = step;
        this.showStep(step);
        this.updateProgressBar();
    }

    prevStep(step) {
        this.currentStep = step;
        this.showStep(step);
        this.updateProgressBar();
    }

    showStep(step) {
        // Cacher toutes les étapes
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });

        // Afficher l'étape courante
        document.querySelector(`.step-content[data-step="${step}"]`).classList.add('active');

        // Mettre à jour le stepper
        document.querySelectorAll('.step').forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.remove('active', 'completed');
            
            if (stepNumber === step) {
                stepEl.classList.add('active');
            } else if (stepNumber < step) {
                stepEl.classList.add('completed');
            }
        });
    }

    updateProgressBar() {
        const progress = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
    }

    updateDisplayValue(elementId, value) {
        document.getElementById(elementId).textContent = value;
    }

    updateSummary() {
        document.getElementById('summary-sleeve-length').textContent = `${this.config.sleeveLength}cm`;
        document.getElementById('summary-sleeve-opening').textContent = `${this.config.sleeveOpening}cm`;
        document.getElementById('summary-torso-length').textContent = `${this.config.torsoLength}cm`;
        document.getElementById('summary-fit').textContent = this.config.fit.toUpperCase();
        document.getElementById('summary-neckline').textContent = `${this.config.neckline}cm`;
        document.getElementById('summary-collar').textContent = this.getCollarDisplayName(this.config.collar);
    }

    updateCurrentConfig() {
        document.getElementById('current-sleeves').textContent = 
            `${this.config.sleeveLength}cm / ${this.config.sleeveOpening}cm`;
        document.getElementById('current-torso').textContent = `${this.config.torsoLength}cm`;
        document.getElementById('current-fit').textContent = this.config.fit.toUpperCase();
        document.getElementById('current-neckline').textContent = 
            `${this.getCollarDisplayName(this.config.collar)} (${this.config.neckline}cm)`;
        
        // Mettre à jour la vue 3D
        if (this.threeViewer) {
            this.threeViewer.updateTshirt(this.config);
        }
    }

    getCollarDisplayName(collar) {
        const names = {
            'crew': 'Crew Neck',
            'vneck': 'V-Neck',
            'round': 'Round Neck'
        };
        return names[collar] || collar;
    }

    
async generatePattern() {
  const generateBtn = document.getElementById('generate-btn');
  const originalText = generateBtn.innerHTML;

  try {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sleeve: this.config.sleeveLength,
        torso: this.config.torsoLength,
        neck: this.config.neckline,
        fit: this.config.fit,
        collar: this.config.collar
      })
    });

    if (!response.ok) throw new Error(`API ${response.status}`);

    const result = await response.json();

    if (result.status === 'success') {
      window.open(`${API_BASE}${result.file_url}`, '_blank'); // <-- plus de localhost
      generateBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
      generateBtn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Generation error:', error);
    generateBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
    alert('Error: ' + error.message);
  } finally {
    setTimeout(() => {
      generateBtn.innerHTML = originalText;
      generateBtn.disabled = false;
      generateBtn.style.background = '';
    }, 3000);
  }
}


// Fonctions globales pour la navigation
function nextStep(step) {
    window.garmentsApp.nextStep(step);
}

function prevStep(step) {
    window.garmentsApp.prevStep(step);
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    window.garmentsApp = new GarmentsWizard();
});