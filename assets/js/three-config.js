class ThreeJSViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.controls = null;
        this.tshirt = null;
        
        this.init();
    }

    init() {
        // Configuration du renderer
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setClearColor(0x1e293b, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Configuration de la caméra
        this.camera.position.set(5, 3, 5);
        this.camera.lookAt(0, 0, 0);

        // Contrôles orbitaux
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lumière
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Grille de référence
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        this.scene.add(gridHelper);

        // Créer le T-shirt initial
        this.createTshirt();

        // Animation
        this.animate();
    }

    createTshirt() {
        // Supprimer l'ancien T-shirt s'il existe
        if (this.tshirt) {
            this.scene.remove(this.tshirt);
        }

        // Géométrie simplifiée du T-shirt
        const geometry = new THREE.Group();

        // Corps du T-shirt
        const bodyGeometry = new THREE.BoxGeometry(2, 3, 1);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2563eb,
            transparent: true,
            opacity: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        geometry.add(body);

        // Manches
        const sleeveGeometry = new THREE.CylinderGeometry(0.3, 0.2, 1.5, 8);
        const sleeveMaterial = new THREE.MeshPhongMaterial({ color: 0x2563eb });

        const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
        leftSleeve.position.set(-1.2, 1.5, 0);
        leftSleeve.rotation.z = Math.PI / 2;
        geometry.add(leftSleeve);

        const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
        rightSleeve.position.set(1.2, 1.5, 0);
        rightSleeve.rotation.z = -Math.PI / 2;
        geometry.add(rightSleeve);

        // Col
        const collarGeometry = new THREE.TorusGeometry(0.8, 0.1, 8, 16);
        const collarMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const collar = new THREE.Mesh(collarGeometry, collarMaterial);
        collar.position.y = 3;
        collar.rotation.x = Math.PI / 2;
        geometry.add(collar);

        this.tshirt = geometry;
        this.scene.add(this.tshirt);
    }

    updateTshirt(params) {
        if (!this.tshirt) return;

        // Mettre à jour les dimensions basées sur les paramètres
        const sleeveScale = params.sleeveLength / 20;
        const torsoScale = params.torsoLength / 65;
        
        // Corps
        const body = this.tshirt.children[0];
        body.scale.y = torsoScale;
        
        // Manches
        const leftSleeve = this.tshirt.children[1];
        const rightSleeve = this.tshirt.children[2];
        leftSleeve.scale.y = sleeveScale;
        rightSleeve.scale.y = sleeveScale;

        // Ajuster la position des manches
        leftSleeve.position.y = 1.5 * torsoScale;
        rightSleeve.position.y = 1.5 * torsoScale;

        // Col (position)
        const collar = this.tshirt.children[3];
        collar.position.y = 3 * torsoScale;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.renderer.setSize(width, height, false);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }
}