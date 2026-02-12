import { makeAutoObservable } from 'mobx';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

export class EnvManager {
  private _scene: THREE.Scene | null = null;
  private _bgMesh: THREE.Mesh | null = null;
  private _ground: THREE.Mesh | null = null;

  private _lights: THREE.Light[] = [];
  private _envMap: THREE.Texture | null = null;
  private _textureLoader = new THREE.TextureLoader();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /* ================= lifecycle ================= */

  init(scene: THREE.Scene) {
    this._scene = scene;

    this.setupLights();
    this.setupGround();
    this.setupStudioEnvironment();
    this.setBackgroundImage('/assets/images/background/background.svg');
  }

  dispose() {
    if (!this._scene) return;

    if (this._ground) {
      this._scene?.remove(this._ground);
      this._ground.geometry.dispose();
      (this._ground.material as THREE.Material).dispose();
      this._ground = null;
    }

    this._lights.forEach((light) => {
      this._scene?.remove(light);
    });

    this._lights = [];

    if (this._envMap) {
      this._envMap.dispose();
      this._envMap = null;
    }

    this._scene = null;
  }

  /* ================= background ================= */

  setBackgroundColor(color: string) {
    if (!this._scene) return;
    this._scene.background = new THREE.Color(color);
  }

  setBackgroundImage(url: string) {
    if (!this._scene) return;

    const texture = this._textureLoader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      this._scene!.background = tex;
    });
  }

  /* ================= lighting ================= */

  private setupLights() {
    if (!this._scene) return;

    const ambient = new THREE.AmbientLight('#ffffff', 0.34);

    // Key light
    const key = new THREE.DirectionalLight('#ffffff', 0.78);
    key.position.set(0, 12, 8);
    key.target.position.set(0, 0, 0);
    this._scene.add(key.target);
    key.castShadow = true;

    key.shadow.mapSize.set(4096, 4096);

    // IMPORTANT: increase shadow camera size
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;

    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;

    key.shadow.bias = -0.00015;
    key.shadow.radius = 18; // softness

    /* ---------------- SOFT SKY LIGHT ---------------- */
    // const hemi = new THREE.HemisphereLight(
    //   '#ffffff', // sky
    //   '#d6d2cc', // ground tint
    //   0.45, // low intensity
    // );

    const baseLight = new THREE.DirectionalLight('#ffffff', 0.92);
    baseLight.position.set(-5, 4, -5);
    baseLight.target.position.set(0, 0, 0);
    baseLight.castShadow = false;

    /* ---------------- LEFT FILL (NO SHADOW) ---------------- */
    const fill = new THREE.DirectionalLight('#ffffff', 0.92);
    fill.position.set(1, 1, 5);
    fill.target.position.set(0, 0, 0);
    fill.castShadow = false;

    /* ---------------- BACK RIM (NO SHADOW) ---------------- */
    const rim = new THREE.DirectionalLight('#ffffff', 0.96);
    rim.position.set(-1, 2, -5);
    rim.target.position.set(0, 0, 0);
    rim.castShadow = false;

    this._lights.push(ambient, key, baseLight, rim, fill);
    this._lights.forEach((l) => this._scene!.add(l));
  }

  // ground
  private setupGround() {
    if (!this._scene) return;

    const geometry = new THREE.PlaneGeometry(20, 20);

    const material = new THREE.ShadowMaterial({
      opacity: 0.06, // controls darkness
    });

    const ground = new THREE.Mesh(geometry, material);

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001; // slightly below objects
    ground.receiveShadow = true;

    this._scene.add(ground);

    this._ground = ground;
  }

  // environment

  private setupStudioEnvironment() {
    if (!this._scene) return;

    const loader = new RGBELoader();

    loader.load('/assets/hdr/studio_small_09_1k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this._scene!.environment = texture;

      // DO NOT set background
      // we only want reflections
    });
  }
}
