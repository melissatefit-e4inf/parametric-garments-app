const API_BASE = location.hostname.includes('github.io')
  ? 'https://presystolic-ann-quintic.ngrok-free.dev'
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
            await this.loadThreeJS();
            this.threeViewer = new ThreeJSViewer('three-canvas');
            
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

            const threeScript = document.createElement('script');
            threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js';
            threeScript.onload = () => {
                const orbitScript = document.createElement('script');
                orbitScript.src = 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/js/controls/OrbitControls.js';
                orbitScript.onload = resolve;
                orbitScript.onerror = reject;
                document.head.appendChild(orbitScript);
            };
            threeScript.onerror = reject;
            document.head.appendChild(threeScript);
        });
    }

    initEventListeners() {
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

        document.querySelectorAll('.fit-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.fit-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.config.fit = btn.dataset.value;
                this.updateSummary();
                this.updateCurrentConfig();
            });
        });

        document.querySelectorAll('.collar-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.collar-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.config.collar = btn.dataset.value;
                this.updateSummary();
                this.updateCurrentConfig();
            });
        });

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
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`.step-content[data-step="${step}"]`).classList.add('active');

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
                window.open(`${API_BASE}${result.file_url}`, '_blank');
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
}

function nextStep(step) {
    window.garmentsApp.nextStep(step);
}

function prevStep(step) {
    window.garmentsApp.prevStep(step);
}

document.addEventListener('DOMContentLoaded', () => {
    window.garmentsApp = new GarmentsWizard();
});