import * as THREE from 'three';

import { ChairTransform } from '../../types/chairs';

export class ChairInstances {
  private scene: THREE.Scene | null = null;
  private chairs: THREE.Object3D[] = [];

  attach(scene: THREE.Scene) {
    this.scene = scene;
  }

  setChairs(meshes: THREE.Object3D[], transforms: ChairTransform[]) {
    if (!this.scene) return;

    // clear existing
    this.clear();

    meshes.forEach((mesh, i) => {
      const t = transforms[i];
      if (!t) return;

      mesh.position.copy(t.position);
      mesh.rotation.copy(t.rotation);

      this.scene!.add(mesh);
      this.chairs.push(mesh);
    });
  }

  clear() {
    if (!this.scene) return;

    this.chairs.forEach((c) => this.scene!.remove(c));
    this.chairs = [];
  }

  get bounds(): THREE.Box3 | null {
    if (this.chairs.length === 0) return null;

    const box = new THREE.Box3();
    this.chairs.forEach((chair) => box.expandByObject(chair));
    return box;
  }

  dispose() {
    this.clear();
    this.scene = null;
  }
}
