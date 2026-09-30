import * as THREE from 'three';

const OPEN = 3.05; // handle angle when the razor is fully open (rad)
const SHUT = 0.14; // handle angle when folded away

const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function bladeGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.12);
  s.lineTo(0, 0.12);
  s.lineTo(0.55, 0.21);
  s.lineTo(3.0, 0.21);
  s.bezierCurveTo(3.32, 0.21, 3.5, 0.02, 3.22, -0.2);
  s.lineTo(0.7, -0.2);
  s.lineTo(0.16, -0.11);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 28,
  });
  g.translate(0, 0, -0.015);
  // Hollow-ground face: bend the broad-face normals along the blade height so the
  // reflection sweeps across studio lights instead of mirroring a single patch.
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  const v = new THREE.Vector3();
  for (let i = 0; i < nor.count; i++) {
    const nz = nor.getZ(i);
    if (Math.abs(nz) > 0.5) {
      const ny = THREE.MathUtils.clamp(pos.getY(i) * 3.4, -0.75, 0.75);
      v.set(0, ny, Math.sign(nz)).normalize();
      nor.setXYZ(i, v.x, v.y, v.z);
    }
  }
  return g;
}

function scaleGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.21);
  s.lineTo(2.95, 0.15);
  s.absarc(2.95, 0, 0.15, Math.PI / 2, -Math.PI / 2, true);
  s.lineTo(0, -0.21);
  s.absarc(0, 0, 0.21, -Math.PI / 2, Math.PI / 2, true);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.016,
    bevelSegments: 4,
    curveSegments: 32,
  });
  g.translate(0, 0, -0.025);
  return g;
}

// A tiny studio: dark room, a few hot softboxes. Polished steel needs bright
// shapes to reflect, otherwise it reads as flat grey.
function studioEnvironment() {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(30, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x24201c, side: THREE.BackSide }),
  );
  env.add(room);
  const box = (w, h, x, y, z, color, power) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  box(26, 3, 0, 14, 4, 0xfff2dc, 7); // long overhead strip
  box(3, 22, -15, 2, 2, 0xffe2bc, 5); // warm left bar
  box(3, 22, 15, 0, 5, 0xc9dcff, 4.5); // cool right bar
  box(24, 2, 0, -12, 6, 0xff4a30, 2.6); // red floor bounce (barber pole)
  box(10, 10, 0, 2, -16, 0xffffff, 1.2); // dim back fill
  box(30, 16, 0, 1, 20, 0xf4efe6, 3.2); // neutral softbox behind the camera
  return env;
}

export function createRazorScene(canvas, { reducedMotion = false, onContextLost = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = studioEnvironment();
  const envTex = pmrem.fromScene(envScene, 0.02).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 1;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  // Lighting: warm key from above, red bounce low left (barber pole), cold rim from behind.
  const key = new THREE.DirectionalLight(0xffe2b8, 1.4);
  key.position.set(3, 5, 6);
  const red = new THREE.PointLight(0xff3a22, 40, 22, 2);
  red.position.set(-5, -2.5, 3);
  const rim = new THREE.DirectionalLight(0xbcd2ff, 1.4);
  rim.position.set(-4, 3, -5);
  scene.add(key, red, rim);

  // Materials
  const steel = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, metalness: 1, roughness: 0.17 });
  const bakelite = new THREE.MeshPhysicalMaterial({
    color: 0x9c1a12,
    roughness: 0.38,
    metalness: 0.05,
    clearcoat: 0.9,
    clearcoatRoughness: 0.18,
  });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc79a4a, metalness: 1, roughness: 0.3 });

  const bGeo = bladeGeometry();
  const sGeo = scaleGeometry();
  const pinGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 32);
  pinGeo.rotateX(Math.PI / 2);
  const washerGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.02, 32);
  washerGeo.rotateX(Math.PI / 2);

  const razor = new THREE.Group(); // holds pieces, offset so the pose stays centred
  const blade = new THREE.Mesh(bGeo, steel);
  const handle = new THREE.Group();
  const scaleA = new THREE.Mesh(sGeo, bakelite);
  const scaleB = new THREE.Mesh(sGeo, bakelite);
  scaleA.position.z = 0.058;
  scaleB.position.z = -0.058;
  handle.add(scaleA, scaleB);
  const pin = new THREE.Mesh(pinGeo, brass);
  const w1 = new THREE.Mesh(washerGeo, brass);
  const w2 = new THREE.Mesh(washerGeo, brass);
  w1.position.z = 0.11;
  w2.position.z = -0.11;
  razor.add(blade, handle, pin, w1, w2);

  const root = new THREE.Group();
  root.add(razor);
  scene.add(root);

  const state = {
    progress: 0,
    px: 0, // pointer -1..1
    py: 0,
    cx: 0, // damped pointer
    cy: 0,
    visible: true,
    raf: 0,
    disposed: false,
    lastW: 0,
    lastH: 0,
    portrait: false,
  };

  function pose(time) {
    const p = reducedMotion ? 0.12 : state.progress;
    const e = ease(Math.min(1, p / 0.82));
    const theta = reducedMotion ? 2.45 : lerp(OPEN, SHUT, e);
    handle.rotation.z = theta;

    // Keep the silhouette centred: its centre slides from the middle of the open
    // razor to the middle of the folded one.
    const centre = lerp(0.18, 1.72, Math.min(1, (Math.PI - theta) / (Math.PI - SHUT)));
    razor.position.set(-centre, 0, 0);

    const bob = reducedMotion ? 0 : Math.sin(time * 0.0009) * 0.05;
    const portrait = state.portrait;
    const baseTilt = portrait ? -1.12 : -0.1;
    root.rotation.z = baseTilt + lerp(0, portrait ? 0.35 : 0.22, e) + bob * 0.4;
    root.rotation.y = lerp(-0.38, 0.45, e) + state.cx * 0.35 + (p > 0.82 ? (p - 0.82) * 2.4 : 0);
    root.rotation.x = lerp(0.35, 0.05, e) - state.cy * 0.22;
    root.position.y = bob;

    const dist = portrait ? lerp(17, 14, e) : lerp(9.2, 7.6, e);
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
  }

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    if (w === state.lastW && h === state.lastH) return;
    state.lastW = w;
    state.lastH = h;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 700 ? 1.6 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    state.portrait = w / h < 0.95;
    camera.updateProjectionMatrix();
  }

  function frame(time) {
    state.raf = 0;
    if (state.disposed) return;
    resize();
    state.cx += (state.px - state.cx) * 0.06;
    state.cy += (state.py - state.cy) * 0.06;
    pose(time);
    renderer.render(scene, camera);
    if (!reducedMotion && state.visible && !document.hidden) state.raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!state.raf && !state.disposed) state.raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
  }

  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);
  const lost = (e) => {
    e.preventDefault();
    stop();
    onContextLost();
  };
  canvas.addEventListener('webglcontextlost', lost);

  const ro = new ResizeObserver(() => {
    resize();
    if (reducedMotion) start();
  });
  ro.observe(canvas);

  return {
    setProgress(p) {
      state.progress = p;
    },
    setPointer(x, y) {
      state.px = x;
      state.py = y;
    },
    setVisible(v) {
      state.visible = v;
      v ? start() : stop();
    },
    start,
    renderOnce() {
      start();
    },
    dispose() {
      state.disposed = true;
      stop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', lost);
      [bGeo, sGeo, pinGeo, washerGeo].forEach((g) => g.dispose());
      [steel, bakelite, brass].forEach((m) => m.dispose());
      envScene.traverse((o) => {
        o.geometry && o.geometry.dispose();
        o.material && o.material.dispose();
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
