import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { ChairColorTextures, ChairId } from '../../types/chairs';

export class ChairAssets {
  private gltfLoader = new GLTFLoader();
  private textureLoader = new THREE.TextureLoader();

  // cache
  private chairScenes = new Map<ChairId, THREE.Object3D>();
  private textureCache = new Map<string, THREE.Texture>();

  /* ===== public API ===== */

  async load(chairId: ChairId, modelUrl?: string): Promise<void> {
    if (!modelUrl) {
      //   console.warn('[ChairAssets] Missing modelUrl', chairId);
      return;
    }

    if (this.chairScenes.has(chairId)) return;

    const gltf = await this.gltfLoader.loadAsync(modelUrl);
    const scene = gltf.scene;

    scene.traverse((obj) => {
      obj.castShadow = true;
      obj.receiveShadow = false;
    });

    this.chairScenes.set(chairId, scene);
  }

  getChairMesh(chairId: ChairId, textures: ChairColorTextures): THREE.Object3D {
    const baseScene = this.chairScenes.get(chairId);
    if (!baseScene) {
      throw new Error(`[ChairAssets] Chair not loaded: ${chairId}`);
    }

    const clone = baseScene.clone(true);
    this.applyTextures(clone, textures);

    return clone;
  }

  dispose() {
    this.chairScenes.forEach((scene) => {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();

          const mat = obj.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat?.dispose();
          }
        }
      });
    });

    this.textureCache.forEach((t) => t.dispose());

    this.chairScenes.clear();
    this.textureCache.clear();
  }

  /* ===== helpers ===== */

  private applyTextures(root: THREE.Object3D, textures: ChairColorTextures) {
    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      if (!(obj.material instanceof THREE.MeshStandardMaterial)) return;

      //   console.log(obj.name, obj.material.uuid);
      // 🔥 IMPORTANT FIX
      obj.material = obj.material.clone();
      const mat = obj.material;

      if (obj.name.toLowerCase().includes('leg')) {
        mat.map = this.loadColorTexture(textures.chairLegColor);
        mat.metalnessMap = this.loadLinearTexture(textures.chairLegMetalness);
        mat.normalMap = this.loadLinearTexture(textures.chairLegNormal);
        mat.roughnessMap = this.loadLinearTexture(textures.chairLegRoughness);
      } else if (obj.name.toLowerCase().includes('top')) {
        mat.map = this.loadColorTexture(textures.chairTopColor);
        mat.metalnessMap = this.loadLinearTexture(textures.chairTopMetalness);
        mat.normalMap = this.loadLinearTexture(textures.chairTopNormal);
        mat.roughnessMap = this.loadLinearTexture(textures.chairTopRoughness);
      }

      mat.needsUpdate = true;
    });
  }

  private loadColorTexture(url: string): THREE.Texture {
    const cached = this.textureCache.get(url);
    if (cached) return cached;

    const tex = this.textureLoader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;

    this.textureCache.set(url, tex);
    return tex;
  }

  private loadLinearTexture(url: string): THREE.Texture {
    const cached = this.textureCache.get(url);
    if (cached) return cached;

    const tex = this.textureLoader.load(url);
    tex.colorSpace = THREE.NoColorSpace;
    tex.flipY = false;

    this.textureCache.set(url, tex);
    return tex;
  }
}
