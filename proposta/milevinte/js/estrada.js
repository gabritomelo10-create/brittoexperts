// Cena 3D da estrada: o caminhão da Mil & Vinte anda com o scroll, a câmera chega na lateral da
// carreta e a logo sai do caminhão e pousa no cartão de visita. Three.js, céu físico de fim de
// tarde, reflexos do próprio céu na pintura e sombras. Sem modelos externos: tudo é geometria.
import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const section = document.getElementById("estrada");
const canvas = document.getElementById("s3d");
const caps = Array.from(section.querySelectorAll("[data-from]"));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = innerWidth < 760;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (e) {
  section.classList.add("no3d");
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.6 : 1.8));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.62;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(small ? 52 : 40, 1, 0.1, 3000);
scene.add(camera);

/* ---------- céu, sol e reflexos ---------- */
const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 9), THREE.MathUtils.degToRad(205));
const sky = new Sky();
sky.scale.setScalar(10000);
const su = sky.material.uniforms;
su.turbidity.value = 7; su.rayleigh.value = 2.2; su.mieCoefficient.value = 0.006; su.mieDirectionalG.value = 0.82;
su.sunPosition.value.copy(sun);
scene.add(sky);
const pmrem = new THREE.PMREMGenerator(renderer);
const skyScene = new THREE.Scene();
const sky2 = sky.clone(); skyScene.add(sky2);
scene.environment = pmrem.fromScene(skyScene, 0.02).texture;
scene.fog = new THREE.Fog(0xc9b89c, 70, 520);

const hemi = new THREE.HemisphereLight(0xfff1dd, 0x3c4a32, 0.55);
scene.add(hemi);
const light = new THREE.DirectionalLight(0xffdcae, 3.2);
light.castShadow = true;
light.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
const sc = light.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 120;
light.shadow.bias = -0.0004; light.shadow.normalBias = 0.03;
scene.add(light, light.target);

/* ---------- texturas procedurais ---------- */
function noiseTex(w, h, base, spread, specks, rep) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d");
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  const img = x.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * spread;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  x.putImageData(img, 0, 0);
  for (let i = 0; i < specks; i++) {
    const g = 60 + Math.random() * 90;
    x.fillStyle = `rgba(${g},${g},${g},${Math.random() * 0.5})`;
    x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- chão, estrada e entorno ---------- */
const grassTex = noiseTex(512, 512, "#4f5a34", 60, 3000, [180, 180]);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true;
scene.add(ground);

const asphaltTex = noiseTex(512, 512, "#36383a", 34, 9000, [90, 1.4]);
const road = new THREE.Mesh(new THREE.PlaneGeometry(900, 13), new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.92, metalness: 0 }));
road.rotation.x = -Math.PI / 2; road.receiveShadow = true;
scene.add(road);
const shoulderMat = new THREE.MeshStandardMaterial({ map: noiseTex(256, 256, "#7d7465", 50, 2000, [200, 1]), roughness: 1 });
for (const z of [-8, 8]) {
  const s = new THREE.Mesh(new THREE.PlaneGeometry(900, 3), shoulderMat);
  s.rotation.x = -Math.PI / 2; s.position.set(0, -0.01, z); s.receiveShadow = true; scene.add(s);
}
const paint = new THREE.MeshStandardMaterial({ color: 0xf2f0e6, roughness: 0.6 });
const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(3.2, 0.02, 0.16), paint, 110);
const m4 = new THREE.Matrix4();
for (let i = 0; i < 110; i++) { m4.makeTranslation(-450 + i * 8.2, 0.01, 0); dashes.setMatrixAt(i, m4); }
dashes.receiveShadow = true; scene.add(dashes);
for (const z of [-6.1, 6.1]) {
  const e = new THREE.Mesh(new THREE.BoxGeometry(900, 0.02, 0.18), new THREE.MeshStandardMaterial({ color: z < 0 ? 0xe8c14a : 0xf2f0e6, roughness: 0.6 }));
  e.position.set(0, 0.01, z); scene.add(e);
}

// postes do outro lado da pista
const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b9094, metalness: 0.8, roughness: 0.35 });
const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.09, 0.13, 8, 8), poleMat, 30);
const arms = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.1, 2.4), poleMat, 30);
for (let i = 0; i < 30; i++) {
  const x = -420 + i * 30;
  m4.makeTranslation(x, 4, -10.5); poles.setMatrixAt(i, m4);
  m4.makeTranslation(x, 7.9, -9.4); arms.setMatrixAt(i, m4);
}
poles.castShadow = true; scene.add(poles, arms);

// árvores espalhadas
const treeN = small ? 220 : 420;
const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x3f5a2c, roughness: 0.95, flatShading: true }), treeN);
const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15, 0.22, 1, 6), new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 }), treeN);
const q = new THREE.Quaternion(), v = new THREE.Vector3(), sV = new THREE.Vector3();
for (let i = 0; i < treeN; i++) {
  const side = i % 2 ? 1 : -1;
  const x = -450 + Math.random() * 900, z = side * (16 + Math.random() * 110), hgt = 3 + Math.random() * 5;
  m4.compose(v.set(x, hgt * 0.35, z), q, sV.set(1, hgt * 0.7, 1)); trunks.setMatrixAt(i, m4);
  m4.compose(v.set(x, hgt * 0.85, z), q, sV.set(hgt * 0.45, hgt * 0.55, hgt * 0.45)); crowns.setMatrixAt(i, m4);
}
crowns.castShadow = true; scene.add(crowns, trunks);

// serras ao fundo
const hillMat = new THREE.MeshStandardMaterial({ color: 0x5d6a55, roughness: 1, flatShading: true });
for (let i = 0; i < 14; i++) {
  const h = new THREE.Mesh(new THREE.ConeGeometry(60 + Math.random() * 80, 40 + Math.random() * 50, 7), hillMat);
  h.position.set(-600 + i * 95 + Math.random() * 40, 10, -330 - Math.random() * 120);
  scene.add(h);
}

/* ---------- a logo: fundo claro do arquivo vira transparente ---------- */
function loadLogo() {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
      const x = c.getContext("2d"); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) {
        const m = Math.min(d.data[i], d.data[i + 1], d.data[i + 2]);
        if (m > 225) d.data[i + 3] = Math.max(0, (255 - m) * 8);
      }
      x.putImageData(d, 0, 0);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      res({ tex: t, ratio: img.width / img.height });
    };
    img.onerror = () => res(null);
    img.src = canvas.dataset.logo;
  });
}

/* ---------- o caminhão ---------- */
const NAVY = 0x0b1a63, BLUE = 0x1636d1;
const truck = new THREE.Group();
scene.add(truck);
const carPaint = new THREE.MeshPhysicalMaterial({ color: NAVY, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
const whitePaint = new THREE.MeshPhysicalMaterial({ color: 0xf4f5f7, metalness: 0.2, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.12 });
const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12 });
const dark = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.3, roughness: 0.65 });
const glass = new THREE.MeshPhysicalMaterial({ color: 0x0c1318, metalness: 0.2, roughness: 0.04, clearcoat: 1, transparent: true, opacity: 0.88 });
const rubber = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
const steel = new THREE.MeshStandardMaterial({ color: 0xb9bec4, metalness: 0.9, roughness: 0.25 });

function add(geo, mat, x, y, z, parent = truck) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
// carreta (baú)
add(new RoundedBoxGeometry(12.4, 3.05, 2.55, 3, 0.06), whitePaint, -0.9, 2.78, 0);
for (let i = 0; i < 11; i++) add(new THREE.BoxGeometry(0.05, 2.9, 2.6), whitePaint, -6.9 + i * 1.2, 2.78, 0); // nervuras
add(new THREE.BoxGeometry(12.4, 0.22, 2.4), dark, -0.9, 1.15, 0);
add(new THREE.BoxGeometry(12.4, 0.08, 2.62), new THREE.MeshPhysicalMaterial({ color: BLUE, metalness: 0.4, roughness: 0.3, clearcoat: 1 }), -0.9, 1.42, 0);
// chassi e para-choques laterais
add(new THREE.BoxGeometry(15.2, 0.28, 1.0), dark, -0.2, 0.82, 0);
for (const z of [-1.18, 1.18]) add(new THREE.BoxGeometry(5.2, 0.12, 0.05), steel, -1.4, 0.82, z);
// cavalo (cabine)
add(new RoundedBoxGeometry(2.7, 2.55, 2.48, 4, 0.22), carPaint, 6.75, 2.35, 0);
add(new RoundedBoxGeometry(1.2, 1.0, 2.44, 3, 0.18), carPaint, 7.55, 1.25, 0); // capô baixo
add(new RoundedBoxGeometry(2.0, 0.9, 2.3, 3, 0.2), carPaint, 6.3, 3.95, 0); // defletor
const ws = add(new THREE.BoxGeometry(0.06, 1.05, 2.2), glass, 8.12, 2.95, 0);
ws.rotation.z = -0.12;
for (const z of [-1.245, 1.245]) {
  add(new THREE.BoxGeometry(1.0, 0.9, 0.04), glass, 7.35, 2.95, z);
  add(new THREE.BoxGeometry(0.06, 0.55, 0.06), dark, 8.2, 3.0, z * 1.18);
  add(new THREE.BoxGeometry(0.14, 0.5, 0.08), chrome, 8.25, 2.95, z * 1.27);
  add(new THREE.CylinderGeometry(0.09, 0.09, 2.6, 12), chrome, 5.3, 3.4, z * 0.92);
  const tank = add(new THREE.CylinderGeometry(0.34, 0.34, 1.3, 20), chrome, 5.6, 0.75, z * 1.05);
  tank.rotation.z = Math.PI / 2;
}
add(new THREE.BoxGeometry(0.1, 0.9, 2.0), chrome, 8.22, 1.35, 0); // grade
for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.12, 0.05, 1.9), dark, 8.24, 1.0 + i * 0.14, 0);
add(new THREE.BoxGeometry(0.3, 0.34, 2.5), steel, 8.25, 0.6, 0); // para-choque
const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d0, emissiveIntensity: 2.2 });
for (const z of [-0.95, 0.95]) add(new THREE.BoxGeometry(0.06, 0.2, 0.42), headMat, 8.4, 0.95, z);
const tailMat = new THREE.MeshStandardMaterial({ color: 0x550000, emissive: 0xff2a1a, emissiveIntensity: 1.4 });
for (const z of [-1.0, 1.0]) add(new THREE.BoxGeometry(0.06, 0.16, 0.3), tailMat, -7.16, 1.15, z);

// rodas
const wheels = [];
const tireGeo = new THREE.CylinderGeometry(0.53, 0.53, 0.34, 28);
const rimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.36, 16);
const hubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.38, 8);
for (const x of [-6.0, -4.8, 3.9, 5.0, 7.3]) {
  for (const z of [-1.02, 1.02]) {
    const w = new THREE.Group(); w.position.set(x, 0.53, z); w.rotation.x = Math.PI / 2;
    add(tireGeo, rubber, 0, 0, 0, w); add(rimGeo, steel, 0, 0, 0, w);
    for (let k = 0; k < 6; k++) { const n = add(hubGeo, chrome, Math.cos(k) * 0.18, 0, Math.sin(k) * 0.18, w); n.scale.set(0.5, 1, 0.5); }
    truck.add(w); wheels.push(w);
  }
}
truck.position.z = 2.3;

/* ---------- logo na carreta, cartão de visita e logo que voa ---------- */
let decal, decalBack, flyer, card;
const DEC = { x: -0.9, y: 2.78, w: 8.6 };
const cardGroup = new THREE.Group();
camera.add(cardGroup);
const veil = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: 0x0b0d0a, transparent: true, opacity: 0, depthWrite: false }));
veil.position.z = -8; camera.add(veil);

function cardFace(back) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 576;
  const x = c.getContext("2d");
  if (back) {
    const g = x.createLinearGradient(0, 0, 1024, 576); g.addColorStop(0, "#0b1a63"); g.addColorStop(1, "#1636d1");
    x.fillStyle = g; x.fillRect(0, 0, 1024, 576);
  } else {
    x.fillStyle = "#fbfbfa"; x.fillRect(0, 0, 1024, 576);
    x.fillStyle = "#0b1a63"; x.fillRect(0, 0, 22, 576);
    x.fillStyle = "#1636d1"; x.fillRect(22, 0, 8, 576);
    x.fillStyle = "#0b1a63"; x.font = "600 40px Manrope, Arial"; x.fillText("Nome Sobrenome", 90, 400);
    x.fillStyle = "#5d6470"; x.font = "500 28px Manrope, Arial"; x.fillText("Cargo · Mil & Vinte Logística", 90, 446);
    x.fillText("(92) 0000-0000 · contato@empresa.com.br", 90, 490);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const CARD = { w: 1.8, h: 1.0, lx: -0.13, ly: 0.17, lw: 1.3 };
{
  const side = new THREE.MeshStandardMaterial({ color: 0xe8e8e6, roughness: 0.7 });
  const front = new THREE.MeshPhysicalMaterial({ map: cardFace(false), roughness: 0.55, clearcoat: 0.3 });
  const back = new THREE.MeshPhysicalMaterial({ map: cardFace(true), roughness: 0.4, clearcoat: 0.6 });
  card = new THREE.Mesh(new THREE.BoxGeometry(CARD.w, CARD.h, 0.012), [side, side, side, side, front, back]);
  cardGroup.add(card);
  const cl = new THREE.PointLight(0xfff4e0, 6, 6); cl.position.set(0.6, 0.8, 1.6); cardGroup.add(cl);
}
cardGroup.visible = false;

loadLogo().then((L) => {
  if (!L) return;
  const h = DEC.w / L.ratio;
  const mat = new THREE.MeshPhysicalMaterial({ map: L.tex, transparent: true, roughness: 0.35, clearcoat: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  decal = new THREE.Mesh(new THREE.PlaneGeometry(DEC.w, h), mat);
  decal.position.set(DEC.x, DEC.y, 1.285); truck.add(decal);
  decalBack = decal.clone(); decalBack.rotation.y = Math.PI; decalBack.position.z = -1.285; truck.add(decalBack);
  flyer = new THREE.Mesh(new THREE.PlaneGeometry(1, 1 / L.ratio), new THREE.MeshPhysicalMaterial({ map: L.tex, transparent: true, roughness: 0.3, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }));
  flyer.visible = false; scene.add(flyer);
  CARD.lh = CARD.lw / L.ratio;
});

/* ---------- roteiro do scroll ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t) => t * t * (3 - 2 * t);
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
const lerpV = (a, b, t) => a.clone().lerp(b, t);

const camKeys = [ // relativas ao caminhão: [posição, alvo]
  [new THREE.Vector3(24, 1.3, 11), new THREE.Vector3(5, 2.2, 0)],
  [new THREE.Vector3(10, 2.0, 15), new THREE.Vector3(2, 2.4, 0)],
  [new THREE.Vector3(-20, 6.5, 15), new THREE.Vector3(0, 2.2, 0)],
  [new THREE.Vector3(-0.9, 3.0, small ? 15 : 15.5), new THREE.Vector3(-0.9, 2.6, 0)],
];
if (small) camKeys.forEach((k) => { k[0].x *= 1.5; k[0].z *= 1.55; });
const closePos = new THREE.Vector3(DEC.x, DEC.y, small ? 14 : 8.4), closeLook = new THREE.Vector3(DEC.x, DEC.y, 1.3);

let target = 0, prog = 0, dist = 0, lastX = null;
const tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();
const wp = new THREE.Vector3(), wq = new THREE.Quaternion(), ws2 = new THREE.Vector3();
const ap = new THREE.Vector3(), aq = new THREE.Quaternion();

function frame(p, time) {
  // A: o caminhão anda (0 → .6)
  const a = easeIO(clamp(p / 0.6));
  const tx = -150 + 178 * a;
  truck.position.x = tx;
  if (lastX !== null) dist += tx - lastX;
  lastX = tx;
  wheels.forEach((w) => (w.rotation.y = -dist / 0.53));
  const moving = p < 0.6 ? 1 : 0;
  truck.position.y = moving * Math.sin(time * 9) * 0.012;

  // câmera
  if (p < 0.6) {
    const k = clamp(p / 0.6) * (camKeys.length - 1), i = Math.min(camKeys.length - 2, Math.floor(k)), f = ease(k - i);
    tmpP.copy(lerpV(camKeys[i][0], camKeys[i + 1][0], f));
    tmpL.copy(lerpV(camKeys[i][1], camKeys[i + 1][1], f));
  } else {
    const b = seg(p, 0.6, 0.76);
    tmpP.copy(lerpV(camKeys[3][0], closePos, b));
    tmpL.copy(lerpV(camKeys[3][1], closeLook, b));
  }
  camera.position.copy(tmpP).add(truck.position);
  camera.lookAt(tmpL.add(truck.position));

  // luz e sombra acompanham o caminhão
  light.position.copy(truck.position).addScaledVector(sun, 60);
  light.target.position.copy(truck.position);

  // C: a logo sai do caminhão e pousa no cartão (.76 → 1)
  const show = p > 0.74;
  cardGroup.visible = show;
  veil.material.opacity = 0.86 * seg(p, 0.76, 0.9);
  if (show) {
    const c = seg(p, 0.8, 0.94);
    cardGroup.position.set(0, small ? 0.15 : 0.05, small ? -4.6 : -3.4);
    card.rotation.set(-0.35 * (1 - c) + Math.sin(time * 0.8) * 0.03, -0.9 * (1 - c) + Math.sin(time * 0.6) * 0.06, 0.12 * (1 - c));
    card.position.y = -1.4 * (1 - seg(p, 0.76, 0.86));
  }
  if (decal && flyer) {
    const f = seg(p, 0.78, 0.93);
    decal.material.opacity = 1 - 0.85 * seg(p, 0.78, 0.84);
    flyer.visible = p > 0.78;
    if (flyer.visible) {
      decal.getWorldPosition(ap); decal.getWorldQuaternion(aq);
      card.updateWorldMatrix(true, false);
      wp.set(CARD.lx, CARD.ly, 0.008).applyMatrix4(card.matrixWorld);
      card.getWorldQuaternion(wq);
      flyer.position.copy(ap).lerp(wp, f);
      flyer.position.y += Math.sin(f * Math.PI) * 0.45;
      flyer.quaternion.copy(aq).slerp(wq, f);
      const s = THREE.MathUtils.lerp(DEC.w, CARD.lw, Math.pow(f, 0.7));
      flyer.scale.set(s, s, 1);
    }
  }

  caps.forEach((el) => el.classList.toggle("on", p >= +el.dataset.from && p < +el.dataset.to));
  renderer.render(scene, camera);
}

/* ---------- laço ---------- */
function size() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
size();
addEventListener("resize", size);
function readScroll() {
  const r = section.getBoundingClientRect();
  target = clamp(-r.top / Math.max(1, r.height - innerHeight));
}
addEventListener("scroll", readScroll, { passive: true });
readScroll(); prog = target;

let visible = true;
new IntersectionObserver((es) => (visible = es[0].isIntersecting), { rootMargin: "200px" }).observe(section);
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  if (!visible) return;
  prog += (target - prog) * (reduce ? 1 : 0.09);
  frame(prog, clock.getElapsedTime());
});
section.classList.add("ready");
