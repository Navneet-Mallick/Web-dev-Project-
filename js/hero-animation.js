/**
 * Hero 3D Animation
 * Creates a stunning interactive 3D particle sphere using Three.js
 */

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.Three) {
    // Fallback to simple particle system if Three.js failed to load
    console.warn('Three.js not found, falling back to basic animation');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  const particlesGeometry = new THREE.BufferGeometry();
  const count = 3000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorPalette = [
    new THREE.Color('#00d9ff'),
    new THREE.Color('#7c3aed'),
    new THREE.Color('#f59e0b')
  ];

  for (let i = 0; i < count * 3; i += 3) {
    // Sphere distribution
    const r = 4;
    const phi = Math.acos(-1 + (2 * i / 3) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;

    positions[i] = r * Math.cos(theta) * Math.sin(phi);
    positions[i + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i + 2] = r * Math.cos(phi);

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.015,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  camera.position.z = 8;

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
  });

  function resize() {
    const parent = canvas.parentElement;
    camera.aspect = parent.offsetWidth / parent.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(parent.offsetWidth, parent.offsetHeight);
  }

  window.addEventListener('resize', resize);
  resize();

  function animate() {
    requestAnimationFrame(animate);

    particles.rotation.y += 0.002;
    particles.rotation.x += 0.001;

    // Subtle mouse interaction
    particles.rotation.y += mouseX * 0.05;
    particles.rotation.x += mouseY * 0.05;

    renderer.render(scene, camera);
  }

  animate();
})();
