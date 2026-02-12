import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useMainContext } from '../../../hooks/useMainContext';
import { useMeshParser } from '../../../hooks/useMeshParser';
import { MeshView } from '../MeshView/MeshView';

export const MeshCompute = observer(() => {
  const { design3DManager, designManager } = useMainContext();
  const { meshManager, cameraManager } = design3DManager;
  const { viewManager } = designManager;

  const { isLoaded, meshInfo } = useMeshParser(viewManager.glbUrl);

  useEffect(() => {
    if (isLoaded) {
      meshManager.setMeshInfos(meshInfo);
    }
  }, [isLoaded, meshInfo, meshManager]);

  useEffect(() => {
    if (meshManager.groupRef) {
      cameraManager.focusCameraTo([meshManager.groupRef]);
    }
  }, [cameraManager, meshManager.groupRef]);

  return (
    (isLoaded && (
      <group
        ref={(ref) => {
          if (ref) {
            meshManager.setGroupRef(ref);
          }
        }}>
        {meshManager.meshInfos.map((mesh) => (
          <MeshView key={mesh.name} meshInfo={mesh} />
        ))}
      </group>
    )) ||
    null
  );
});
