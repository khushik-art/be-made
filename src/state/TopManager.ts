import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { TopFinishTextures } from '../types/topFinish';
import { loadTextureAsync } from './finish/FinishUtils';
import { TopDimensionManager } from './TopDimensionManager';

export class TopManager {
  private _scene: THREE.Scene | null = null;
  private _dimensionManager = new TopDimensionManager();
  private _topSurface: THREE.Object3D | null = null;
  private _mdfLayer: THREE.Object3D | null = null;
  private _bounds: THREE.Box3 | null = null;
  private _loader = new GLTFLoader();
  private _pendingFinish: TopFinishTextures | null = null;
  private _topMaterial: THREE.MeshStandardMaterial | null = null;
  private _dimensionMode: 'rect' | 'diameter' = 'rect';

  attach(scene: THREE.Scene) {
    this._scene = scene;
  }

  dispose() {
    this.disposeTop();
    this._scene = null;
  }

  get surface() {
    return this._topSurface;
  }

  get mdf() {
    return this._mdfLayer;
  }

  get bounds() {
    return this._bounds;
  }

  setVisible(visible: boolean) {
    if (this._topSurface) this._topSurface.visible = visible;
    if (this._mdfLayer) this._mdfLayer.visible = visible;
  }

  async load(
    modelUrl?: string,
    modelMdfUrl?: string,
    limits?:
      | { mode: 'rect'; maxLength: number; maxWidth: number }
      | { mode: 'diameter'; maxDiameter: number }
      | null,
    initialDimensions?: {
      length: number;
      width: number;
      mode: 'rect' | 'diameter';
    },
  ) {
    if (!this._scene || !modelUrl || !modelMdfUrl) return;

    this.disposeTop();

    const [topGltf, mdfGltf] = await Promise.all([
      this._loader.loadAsync(modelUrl),
      this._loader.loadAsync(modelMdfUrl),
    ]);

    this._topSurface = topGltf.scene;
    this._mdfLayer = mdfGltf.scene;

    this.prepareMeshes(this._topSurface);
    this.prepareMeshes(this._mdfLayer);

    this._scene.add(this._mdfLayer);
    this._scene.add(this._topSurface);

    if (limits) {
      this._dimensionManager.attach(this._topSurface, this._mdfLayer, limits);
    }

    if (initialDimensions) {
      if (initialDimensions.mode === 'rect') {
        this._dimensionMode = 'rect';
        this._dimensionManager.setDimensions(
          initialDimensions.length,
          initialDimensions.width,
        );
      } else {
        this._dimensionMode = 'diameter';
        this._dimensionManager.setDiameter(initialDimensions.length);
      }
    }

    if (this._pendingFinish) {
      await this.applyFinishInternal(this._pendingFinish);
    }

    this.updateBounds();
  }

  async setFinish(finish: TopFinishTextures) {
    this._pendingFinish = finish;

    if (this._topSurface && this._mdfLayer) {
      await this.applyFinishInternal(finish);
    }
  }

  private async applyFinishInternal(finish: TopFinishTextures) {
    if (!this._topSurface || !this._mdfLayer) return;

    const cloneTexture = (texture: THREE.Texture | null) => {
      if (!texture) return null;
      const cloned = texture.clone();
      cloned.needsUpdate = true;
      return cloned;
    };

    const [baseMap, metalnessMap, normalMap, roughnessMap, mdfMap] =
      await Promise.all([
        loadTextureAsync(finish.baseUrl, { srgb: true }),
        loadTextureAsync(finish.metalnessUrl),
        loadTextureAsync(finish.normalUrl),
        loadTextureAsync(finish.roughnessUrl),
        loadTextureAsync(finish.mdfUrl, { srgb: true }),
      ]);

    const topMaterial = new THREE.MeshStandardMaterial({
      map: cloneTexture(baseMap),
      metalnessMap: cloneTexture(metalnessMap),
      normalMap: cloneTexture(normalMap),
      roughnessMap: cloneTexture(roughnessMap),
    });

    const mdfMaterial = new THREE.MeshStandardMaterial({
      map: cloneTexture(mdfMap ?? baseMap),
      metalness: 0,
      roughness: 0.9,
    });

    const applyMaterial = (obj: THREE.Object3D, material: THREE.Material) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
          mesh.material = material;
          mesh.material.needsUpdate = true;
        }
      });
    };

    applyMaterial(this._topSurface, topMaterial);
    applyMaterial(this._mdfLayer, mdfMaterial);

    this._topMaterial = topMaterial;
    this.updateTopTextureCropping(
      this._topSurface.scale.x,
      this._topSurface.scale.z,
    );
  }

  setDimensions(length: number, width: number) {
    this._dimensionMode = 'rect';
    this._dimensionManager.setDimensions(length, width);
    this.updateTopTextureCroppingFromScale();
  }

  setDiameter(diameter: number) {
    this._dimensionMode = 'diameter';
    this._dimensionManager.setDiameter(diameter);
    this.updateTopTextureCroppingFromScale();
  }

  private prepareMeshes(object: THREE.Object3D) {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  private updateTopTextureCroppingFromScale() {
    if (!this._topSurface) return;
    this.updateTopTextureCropping(
      this._topSurface.scale.x,
      this._topSurface.scale.z,
    );
  }

  private updateTopTextureCropping(scaleX: number, scaleZ: number) {
    if (!this._topMaterial) return;

    const sx = THREE.MathUtils.clamp(scaleX, 0.0001, 10);
    const sz = THREE.MathUtils.clamp(scaleZ, 0.0001, 10);

    const applyToTexture = (
      texture: THREE.Texture | null,
      center: number[],
    ) => {
      if (!texture) return;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(sx, sz);
      texture.offset.set((1 - sx) * 0.5, (1 - sz) * 0.5);
      texture.center.set(center[0], 0.3);
    };

    let center = [0, 0.3];
    if (this._dimensionMode === 'diameter') center = [-0.3, 0.3];
    applyToTexture(this._topMaterial.map, center);
    applyToTexture(this._topMaterial.metalnessMap, center);
    applyToTexture(this._topMaterial.normalMap, center);
    applyToTexture(this._topMaterial.roughnessMap, center);
  }

  private updateBounds() {
    if (!this._topSurface || !this._mdfLayer) return;
    const box = new THREE.Box3();
    box.expandByObject(this._mdfLayer);
    box.expandByObject(this._topSurface);
    this._bounds = box;
  }

  private disposeTop() {
    if (!this._scene) return;

    const disposeObject = (obj: THREE.Object3D | null) => {
      if (!obj) return;
      this._scene!.remove(obj);

      obj.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        this._dimensionManager.detach();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      });
    };

    disposeObject(this._topSurface);
    disposeObject(this._mdfLayer);

    this._topSurface = null;
    this._mdfLayer = null;
    this._bounds = null;
    this._topMaterial = null;
  }
}
