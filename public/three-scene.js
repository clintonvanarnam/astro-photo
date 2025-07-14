// three-scene.js
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let camera, scene, renderer, mesh;
let animationFrameId;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        // event.preventDefault(); // This was preventing the click event from firing on mobile
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

function initThreeScene() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Set background to black

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add mouse and touch listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('touchstart', onDocumentTouchStart, { passive: false });
    document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });

    // Environment Map for reflections
    new RGBELoader()
        .setPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/')
        .load('royal_esplanade_1k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            // scene.background = texture; // This is removed to keep the background black
            scene.environment = texture; // This provides the reflections
        });

    // Lighting - The environment map provides most of the light.
    // A point light can be used to add highlights.
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 2000);
    pointLight.position.set(80, 80, 80);
    scene.add(pointLight);

    // Font and Text Geometry
    const loader = new FontLoader();
    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_bold.typeface.json', function (font) {
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
            roughness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            reflectivity: 1.0
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    });

    // Animation loop
    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        targetX = mouseX * .002;
        targetY = mouseY * .002;

        if (mesh) {
            mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
            mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);
        }

        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    });
}

function destroyThreeScene() {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('touchstart', onDocumentTouchStart);
    document.removeEventListener('touchmove', onDocumentTouchMove);

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement = null;
        renderer = null;
    }
    if (scene) {
        scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        scene = null;
    }
    camera = null;
    mesh = null;
    const canvas = document.getElementById('three-canvas');
    if (canvas) {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const loseContextExtension = gl.getExtension('WEBGL_lose_context');
            if (loseContextExtension) {
                loseContextExtension.loseContext();
            }
        }
    }
}

window.threeScene = {
    init: initThreeScene,
    destroy: destroyThreeScene
};
