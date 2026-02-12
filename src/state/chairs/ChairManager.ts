import * as THREE from 'three';

import {
  ChairColorTextures,
  ChairId,
  ChairLayoutParams,
  ChairLayoutResult,
} from '../../types/chairs';
import { ChairAssets } from './ChairAssets';
import { ChairInstances } from './ChairInstances';
import { ChairLayout } from './ChairLayout';

export class ChairManager {
  private _scene: THREE.Scene | null = null;

  private assets: ChairAssets;
  private instances: ChairInstances;

  constructor() {
    this.assets = new ChairAssets();
    this.instances = new ChairInstances();
  }

  /* ===== lifecycle ===== */

  attach(scene: THREE.Scene) {
    this._scene = scene;
    this.instances.attach(scene);
  }

  dispose() {
    this.instances.dispose();
    this.assets.dispose();
    this._scene = null;
  }

  /* ===== reactive update entrypoint ===== */

  async update(
    params: ChairLayoutParams & {
      chairId: ChairId;
      modelUrl: string;
      textures: ChairColorTextures;
    },
  ) {
    if (!this._scene) return;

    const { chairId, modelUrl, textures, count } = params;

    // 1️⃣ ensure GLB loaded
    await this.assets.load(chairId, modelUrl);

    // 2️⃣ fake layout
    const transforms = ChairLayout.getLayout(params);

    // 3️⃣ create meshes
    const meshes = Array.from({ length: count }).map(() =>
      this.assets.getChairMesh(chairId, textures),
    );

    // 4️⃣ push to scene
    this.instances.setChairs(meshes, transforms);

    // console.log('Chair transforms', transforms.slice(0, 2));
  }

  /* ===== explicit clearing ===== */

  clear() {
    this.instances.clear();
  }

  get bounds() {
    return this.instances.bounds;
  }

  async updateTwoChairPreview(params: {
    chairId: ChairId;
    modelUrl: string;
    textures: ChairColorTextures;
  }) {
    if (!this._scene) return;

    const { chairId, modelUrl, textures } = params;

    await this.assets.load(chairId, modelUrl);

    const transforms: ChairLayoutResult = [
      {
        position: new THREE.Vector3(-0.34, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      },
      {
        position: new THREE.Vector3(0.34, 0, 0),
        rotation: new THREE.Euler(0, Math.PI, 0),
      },
    ];

    const meshes = Array.from({ length: 2 }).map(() =>
      this.assets.getChairMesh(chairId, textures),
    );

    this.instances.setChairs(meshes, transforms);
  }
}
