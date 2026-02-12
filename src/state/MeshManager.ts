import * as THREE from 'three';

import { BaseManager } from './BaseManager';
import { ChairManager } from './chairs/ChairManager';
import { TopManager } from './TopManager';

export class MeshManager {
  base: BaseManager;
  top: TopManager;
  chairs: ChairManager;

  constructor() {
    this.base = new BaseManager();
    this.top = new TopManager();
    this.chairs = new ChairManager();
  }

  init(scene: THREE.Scene) {
    this.base.attach(scene);
    this.top.attach(scene);
    this.chairs.attach(scene);
  }

  dispose() {
    this.base.dispose();
    this.top.dispose();
    this.chairs.dispose();
  }

  get bounds(): THREE.Box3 | null {
    return this.tableBounds;
  }

  get tableBounds(): THREE.Box3 | null {
    const baseBounds = this.base.bounds;
    const topBounds = this.top.bounds;

    if (!baseBounds && !topBounds) return null;
    if (!baseBounds) return topBounds ? topBounds.clone() : null;
    if (!topBounds) return baseBounds.clone();

    const box = baseBounds.clone();
    box.union(topBounds);
    return box;
  }

  get chairBounds(): THREE.Box3 | null {
    return this.chairs.bounds ? this.chairs.bounds.clone() : null;
  }

  get fullBounds(): THREE.Box3 | null {
    const table = this.tableBounds;
    const chair = this.chairBounds;

    if (!table && !chair) return null;
    if (!table) return chair;
    if (!chair) return table;

    const box = table.clone();
    box.union(chair);
    return box;
  }
}
