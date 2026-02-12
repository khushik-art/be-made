// BaseFinishManager.ts
import * as THREE from 'three';

import { BaseFinishTextures } from '../../types/baseFinish';
import { loadTexture } from './FinishUtils';

export class BaseFinishManager {
  apply(base: THREE.Object3D, finish: BaseFinishTextures, baseId: string) {
    if (!base) return;

    const isLinea = baseId === 'linea';

    const material = new THREE.MeshStandardMaterial({
      map: isLinea
        ? null // ❗ no diffuse texture for linea gold
        : loadTexture(finish.diffuse, { srgb: true }),

      metalness: isLinea ? 0.9 : 0.45,
      metalnessMap: isLinea ? null : loadTexture(finish.metallic),

      normalMap: isLinea ? null : loadTexture(finish.normal),
      roughness: isLinea ? 0.35 : 0.25,
      roughnessMap: isLinea ? null : loadTexture(finish.roughness),
    });

    // ✅ Linea special treatment
    if (isLinea) {
      material.color = new THREE.Color('#eee3c2'); // classy gold
      material.side = THREE.DoubleSide;
    } else {
      material.side = THREE.FrontSide;
    }

    base.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // dispose old material
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }

        mesh.material = material;
        mesh.material.needsUpdate = true;
      }
    });
  }
}
