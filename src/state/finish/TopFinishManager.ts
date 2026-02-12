import * as THREE from 'three';

import { TopFinishTextures } from '../../types/topFinish';
import { loadTexture } from './FinishUtils';

export class TopFinishManager {
  apply(
    topSurface: THREE.Object3D | null,
    mdfLayer: THREE.Object3D | null,
    finish: TopFinishTextures,
  ) {
    if (!topSurface || !mdfLayer) return;

    /* ================= TOP SURFACE MATERIAL ================= */

    const topMaterial = new THREE.MeshStandardMaterial({
      envMapIntensity: 0.15,
      map: loadTexture(finish.baseUrl, { srgb: true }),
      metalness: 0.5,
      metalnessMap: loadTexture(finish.metalnessUrl),
      normalMap: loadTexture(finish.normalUrl),
      roughnessMap: loadTexture(finish.roughnessUrl),
    });

    topSurface.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // dispose previous
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }

        mesh.material = topMaterial;
        mesh.material.needsUpdate = true;
      }
    });

    /* ================= MDF MATERIAL ================= */

    const mdfMaterial = new THREE.MeshStandardMaterial({
      map: loadTexture(finish.mdfUrl, { srgb: true }),
      metalness: 0,
      roughness: 0.9,
    });

    mdfLayer.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }

        mesh.material = mdfMaterial;
        mesh.material.needsUpdate = true;
      }
    });
  }
}
