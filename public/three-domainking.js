// Moved from src/assets/three-domainking.js
// ...existing JS content...

// Three.js animated "DOMAIN KING" text intro
window.init3DText = function() {
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 40;
  // Load font and create text
  const loader = new FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeo = new TextGeometry('DOMAIN KING', {
      font: font,
      size: 8,
      height: 2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.5,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 5
    });
    const material = new THREE.MeshNormalMaterial();
    const textMesh = new THREE.Mesh(textGeo, material);
    textMesh.position.x = -30;
    textMesh.position.y = 0;
    scene.add(textMesh);
    let stop = false;
    window.stop3DText = function() { stop = true; renderer.dispose(); };
    function animate() {
      if (stop) return;
      requestAnimationFrame(animate);
      textMesh.rotation.y += 0.02;
      renderer.render(scene, camera);
    }
    animate();
  });
};
