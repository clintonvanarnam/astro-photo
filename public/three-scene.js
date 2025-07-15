// three-scene.js
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let camera, scene, renderer, mesh;
let animationFrameId;
let mouseX = 0, mouseY = 0;
let windowHalfX = 0;
let windowHalfY = 0;
let isInitialized = false;

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        mouseX = (event.touches[0].pageX - windowHalfX) * 2.5;
        mouseY = (event.touches[0].pageY - windowHalfY) * 2.5;
    }
}

function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = (event.touches[0].pageX - windowHalfX) * 2.5;
        mouseY = (event.touches[0].pageY - windowHalfY) * 2.5;
    }
}

function onWindowResize() {
    if (!isInitialized) return;
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    if (!isInitialized) return;
    animationFrameId = requestAnimationFrame(animate);
    render();
}

function render() {
    if (!isInitialized) return;
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

function cleanup() {
    console.log('Cleaning up Three.js scene...');
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('touchstart', onDocumentTouchStart);
    document.removeEventListener('touchmove', onDocumentTouchMove);
    window.removeEventListener('resize', onWindowResize);

    if (renderer) {
        renderer.dispose();
        renderer = null;
    }
    if (scene) {
        // Basic cleanup. For more complex scenes, you'd traverse and dispose geometries/materials.
        scene = null;
    }
    camera = null;
    mesh = null;
    isInitialized = false;
}

function init() {
    if (isInitialized) {
        console.log('Three.js scene already initialized.');
        return;
    }

    const canvas = document.getElementById('three-canvas');
    if (!canvas) {
        console.log('Canvas element #three-canvas not found. Aborting Three.js initialization.');
        return;
    }
    console.log('Initializing Three.js scene...');

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add mouse and touch listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('touchstart', onDocumentTouchStart, { passive: true });
    document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });
    window.addEventListener('resize', onWindowResize);

    // Environment Map for reflections
    new RGBELoader()
        .setPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/')
        .load('royal_esplanade_1k.hdr', function (texture) {
            if (!scene) return; // Scene might have been cleaned up
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
        });

    // Lighting
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 2000);
    pointLight.position.set(80, 80, 80);
    scene.add(pointLight);

    // Font and Text Geometry
    const loader = new FontLoader();
    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        if (!scene) return; // Scene might have been cleaned up
        const geometry = new TextGeometry('DOMAIN KING', {
            font: font,
            size: 10,
            depth: 1,
            curveSegments: 16,
            bevelEnabled: true,
            bevelThickness: 0.5,
            bevelSize: 0.3,
            bevelOffset: 0,
            bevelSegments: 5
        });
        geometry.center();

        // Chrome-like material
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.1,
            transparent: true,
            transmission: 0.9,
            reflectivity: 0.9,
            ior: 1.5,
            side: THREE.DoubleSide
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    });

    isInitialized = true;
    animate(); // Start the animation loop
}

// Expose init and cleanup to the global scope
window.threeScene = {
    init: init,
    cleanup: cleanup
};
