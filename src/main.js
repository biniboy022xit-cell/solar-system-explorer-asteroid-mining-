import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { bodies, resources } from "./data.js";

const container = document.querySelector("#scene-container");
const loading = document.querySelector("#scene-loading");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050914);
scene.fog = new THREE.FogExp2(0x050914, 0.00135);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1200);
camera.position.set(0, 115, 185);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 18;
controls.maxDistance = 420;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0x9bb4d1, 0.65));
const sunLight = new THREE.PointLight(0xffd9a0, 2100, 650, 1.35);
scene.add(sunLight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(bodies[0].radius, 48, 32),
  new THREE.MeshBasicMaterial({ color: bodies[0].color })
);
scene.add(sun);
const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(13.5, 32, 24),
  new THREE.MeshBasicMaterial({ color: 0xffb84c, transparent: true, opacity: 0.10, side: THREE.BackSide })
);
sun.add(sunGlow);

const planetObjects = [];
const orbitLines = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pickables = [];
let selectedIndex = 0;
let simulationSpeed = 1;
let running = true;
let showTrails = true;
let showLabels = true;
let elapsed = 0;
let previousTime = performance.now();
let cameraDestination = null;

function makeLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "500 25px Manrope, sans-serif";
  ctx.fillStyle = "#d9e8f6";
  ctx.fillText(text, 8, 39);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(15, 3.75, 1);
  return sprite;
}

function makeOrbit(radius) {
  const points = [];
  for (let i = 0; i <= 256; i++) {
    const a = (i / 256) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: 0x45627f, transparent: true, opacity: 0.32 }));
  scene.add(line);
  orbitLines.push(line);
}

bodies.slice(1).forEach((body, index) => {
  makeOrbit(body.orbit);
  const material = new THREE.MeshStandardMaterial({
    color: body.color,
    roughness: 0.88,
    metalness: 0.02
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(body.radius, 32, 24), material);
  mesh.userData.bodyIndex = index + 1;
  scene.add(mesh);
  pickables.push(mesh);

  const label = makeLabel(body.name);
  label.position.set(0, body.radius + 3.2, 0);
  mesh.add(label);

  if (body.name === "Saturn") {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(body.radius * 1.35, body.radius * 2.15, 64),
      new THREE.MeshBasicMaterial({ color: 0xcbb98f, side: THREE.DoubleSide, transparent: true, opacity: 0.64 })
    );
    ring.rotation.x = Math.PI / 2.35;
    mesh.add(ring);
  }
  planetObjects.push({ mesh, label, body, index: index + 1 });
});

const asteroidCount = 1500;
const asteroidPositions = new Float32Array(asteroidCount * 3);
const asteroidSeeds = [];
for (let i = 0; i < asteroidCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 62 + Math.random() * 10;
  const y = (Math.random() - 0.5) * 2.8;
  asteroidSeeds.push({ angle, radius, y, speed: 0.05 + Math.random() * 0.06 });
  asteroidPositions[i * 3] = Math.cos(angle) * radius;
  asteroidPositions[i * 3 + 1] = y;
  asteroidPositions[i * 3 + 2] = Math.sin(angle) * radius;
}
const asteroidGeometry = new THREE.BufferGeometry();
asteroidGeometry.setAttribute("position", new THREE.BufferAttribute(asteroidPositions, 3));
const asteroidBelt = new THREE.Points(
  asteroidGeometry,
  new THREE.PointsMaterial({ color: 0xa9a99f, size: 0.55, transparent: true, opacity: 0.72, sizeAttenuation: true })
);
scene.add(asteroidBelt);

const starCount = 2600;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const radius = 240 + Math.random() * 650;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = radius * Math.cos(phi);
  starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xc6d7ea, size: 0.65, transparent: true, opacity: 0.7 })));

function setSelected(index) {
  selectedIndex = index;
  const body = bodies[index];
  document.querySelector("#body-index").textContent = String(index).padStart(2, "0");
  document.querySelector("#body-name").textContent = body.name;
  document.querySelector("#body-type").textContent = body.type;
  document.querySelector("#body-description").textContent = body.description;
  document.querySelector("#body-diameter").textContent = body.diameter;
  document.querySelector("#body-distance").textContent = body.distance;
  document.querySelector("#body-period").textContent = body.period;
  document.querySelector("#body-temperature").textContent = body.temperature;
  document.querySelector("#body-resources").textContent = body.resources;
  document.querySelector("#body-mining").textContent = body.mining;
  document.querySelector("#body-swatch").style.background = `#${body.color.toString(16).padStart(6, "0")}`;
  document.querySelectorAll("[data-body-index]").forEach(button => {
    button.classList.toggle("selected", Number(button.dataset.bodyIndex) === index);
  });
  focusBody(index);
}

function focusBody(index) {
  let destination;
  if (index === 0) destination = new THREE.Vector3(0, 0, 0);
  else destination = planetObjects[index - 1].mesh.getWorldPosition(new THREE.Vector3());
  const offset = index === 0 ? new THREE.Vector3(0, 50, 90) : new THREE.Vector3(0, 12, 23);
  cameraDestination = { target: destination.clone(), position: destination.clone().add(offset) };
}

const picker = document.querySelector("#planet-buttons");
bodies.forEach((body, index) => {
  const button = document.createElement("button");
  button.className = "planet-button";
  button.dataset.bodyIndex = index;
  button.textContent = body.name;
  button.addEventListener("click", () => setSelected(index));
  picker.appendChild(button);
});

const resourceGrid = document.querySelector("#resource-grid");
resources.forEach((resource, index) => {
  const article = document.createElement("article");
  article.className = "resource-card";
  article.innerHTML = `
    <span class="resource-number">RESOURCE / ${String(index + 1).padStart(2, "0")}</span>
    <h3>${resource.name}</h3>
    <div class="resource-detail"><span>POTENTIAL TARGETS</span><p>${resource.targets}</p></div>
    <div class="resource-detail"><span>POSSIBLE USE</span><p>${resource.use}</p></div>
    <div class="resource-detail"><span>HYPOTHETICAL METHOD</span><p>${resource.method}</p></div>
    <p class="resource-note">${resource.note}</p>`;
  resourceGrid.appendChild(article);
});

document.querySelector("#pause-btn").addEventListener("click", event => {
  running = !running;
  event.currentTarget.textContent = running ? "Ⅱ Pause" : "▶ Resume";
  document.querySelector("#run-status").textContent = running ? "RUNNING" : "PAUSED";
});
document.querySelector("#speed-range").addEventListener("input", event => {
  simulationSpeed = Number(event.target.value);
  document.querySelector("#speed-output").textContent = `${simulationSpeed.toFixed(1)}×`;
});
document.querySelector("#trails-btn").addEventListener("click", event => {
  showTrails = !showTrails;
  orbitLines.forEach(line => line.visible = showTrails);
  event.currentTarget.textContent = `Trails ${showTrails ? "on" : "off"}`;
  event.currentTarget.classList.toggle("active", showTrails);
});
document.querySelector("#labels-btn").addEventListener("click", event => {
  showLabels = !showLabels;
  planetObjects.forEach(item => item.label.visible = showLabels);
  event.currentTarget.textContent = `Labels ${showLabels ? "on" : "off"}`;
  event.currentTarget.classList.toggle("active", showLabels);
});
document.querySelector("#reset-btn").addEventListener("click", () => {
  controls.reset();
  setSelected(0);
});

renderer.domElement.addEventListener("pointerdown", event => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  if (hits.length) setSelected(hits[0].object.userData.bodyIndex);
});

function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener("resize", resize);
resize();

function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;
  if (running) elapsed += delta * simulationSpeed;

  planetObjects.forEach(({ mesh, body, label }) => {
    const angle = elapsed * body.speed * 0.22;
    mesh.position.set(Math.cos(angle) * body.orbit, 0, Math.sin(angle) * body.orbit);
    mesh.rotation.y += delta * 0.22;
    label.visible = showLabels;
  });

  asteroidSeeds.forEach((seed, index) => {
    const angle = seed.angle + elapsed * seed.speed * 0.12;
    asteroidPositions[index * 3] = Math.cos(angle) * seed.radius;
    asteroidPositions[index * 3 + 1] = seed.y;
    asteroidPositions[index * 3 + 2] = Math.sin(angle) * seed.radius;
  });
  asteroidGeometry.attributes.position.needsUpdate = true;
  sun.rotation.y += delta * 0.025;

  if (cameraDestination) {
    controls.target.lerp(cameraDestination.target, 0.035);
    camera.position.lerp(cameraDestination.position, 0.035);
    if (camera.position.distanceTo(cameraDestination.position) < 0.15) cameraDestination = null;
  }
  controls.update();
  renderer.render(scene, camera);
}
setSelected(0);
loading.remove();
requestAnimationFrame(animate);
