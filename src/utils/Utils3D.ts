import * as THREE from 'three';

export function centerAndScaleObject(object: THREE.Object3D, targetSize = 2.5) {
  const box = new THREE.Box3().setFromObject(object);

  const size = new THREE.Vector3();
  box.getSize(size);

  const center = new THREE.Vector3();
  box.getCenter(center);

  // 🔹 Center the object
  object.position.sub(center);

  // 🔹 Uniform scale
  const maxAxis = Math.max(size.x, size.y, size.z);
  const scale = targetSize / maxAxis;

  object.scale.setScalar(scale);

  // 🔹 Update matrix
  object.updateMatrixWorld();
}
