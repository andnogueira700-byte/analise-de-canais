// Palco: renderer, cena principal + camada de textos (overlay), utilitários de animação e câmera.
import * as THREE from 'three';
export { THREE };

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = {
  io: (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  out: (t) => { t = clamp(t); return 1 - Math.pow(1 - t, 3); },
  in: (t) => { t = clamp(t); return t * t * t; },
  back: (t) => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: (t) => { t = clamp(t); return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1; },
  sine: (t) => -(Math.cos(Math.PI * clamp(t)) - 1) / 2,
};
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
// tremida de câmera na mão (suave, determinística)
export const shake = (t, amp = 1, seed = 0) => [
  (Math.sin(t * 1.3 + seed) * 0.6 + Math.sin(t * 2.9 + seed * 2) * 0.3 + Math.sin(t * 7.1 + seed) * 0.1) * amp,
  (Math.sin(t * 1.7 + seed * 3) * 0.6 + Math.sin(t * 3.3 + seed) * 0.3 + Math.sin(t * 6.3 + seed * 5) * 0.1) * amp,
  (Math.sin(t * 1.1 + seed * 7) * 0.6 + Math.sin(t * 2.3 + seed) * 0.4) * amp,
];

export function createStage(W, H) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.02, 2000);
  // overlay em unidades: largura 192, altura 108 (1 unidade = 10 px em 1080p)
  const oscene = new THREE.Scene();
  const ocam = new THREE.OrthographicCamera(-96, 96, 54, -54, -200, 200);
  const ol1 = new THREE.DirectionalLight(0xffffff, 2.2); ol1.position.set(-0.4, 0.8, 1);
  const ol2 = new THREE.AmbientLight(0xffffff, 0.9);
  oscene.add(ol1, ol2);
  // véu para fades
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false, toneMapped: false }));
  veil.position.z = 150; veil.renderOrder = 999; oscene.add(veil);
  const stage = {
    W, H, renderer, scene, camera, oscene, ocam, veil,
    look(pos, target, roll = 0, fov) {
      camera.position.set(...pos); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(...target);
      if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    },
    // projeta ponto do mundo para coordenadas do overlay
    toOverlay(p) { camera.updateMatrixWorld(); const v = new THREE.Vector3(...p).project(camera); return [v.x * 96, v.y * 54, v.z]; },
    render() {
      renderer.autoClear = true; renderer.render(scene, camera);
      renderer.autoClear = false; renderer.clearDepth();
      const tm = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping;
      renderer.render(oscene, ocam); renderer.toneMapping = tm;
    },
  };
  return stage;
}
