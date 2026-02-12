import * as THREE from 'three';

import { BaseFinishTextures } from './baseFinish';

export interface IMeshManager {
  /* lifecycle */
  init(): void;
  dispose(): void;

  /* scene wiring */
  setRoot(group: THREE.Group): void;

  /* loading */
  loadBase(modelUrl: string): Promise<void>;

  /* configuration */
  setTopShape(shape: string): void;

  /**
   * Apply fully-resolved material data.
   * MeshManager does NOT know about IDs.
   */
  applyFinish(textures: BaseFinishTextures): void;

  /* bounds */
  updateBounds(): void;
  readonly bounds: THREE.Box3 | null;

  /* hooks */
  handleModelLoaded(scene: THREE.Object3D): void;
}
