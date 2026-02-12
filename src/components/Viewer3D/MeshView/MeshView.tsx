import { useEffect, useRef } from 'react';
import { Group } from 'three';

import { centerAndScaleObject } from '../../../utils/Utils3D';
import { SingleMesh } from '../SingleMesh/SingleMesh';

export const MeshView = () => {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Assume GLB is the first child
    const object = groupRef.current.children[0];
    if (!object) return;

    centerAndScaleObject(object, 2.8);
  }, []);
  return (
    <group ref={groupRef}>
      <SingleMesh url="/assets/images/base-shape/linea/model.glb" />
    </group>
  );
};
