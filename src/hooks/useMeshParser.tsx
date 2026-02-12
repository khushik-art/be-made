import { useCallback, useEffect, useState } from 'react';

import { MeshInfo } from '../core/MeshInfo';
import { Logger } from '../utils/Logger';
import { Utils3D } from '../utils/Utils3D';

export const useMeshParser = (url: string | undefined | null) => {
  const [state, setState] = useState({
    isLoaded: false,
    meshInfo: [] as MeshInfo[],
  });

  const loader = useCallback(async () => {
    // Reset state when URL changes or is cleared
    if (!url) {
      setState((prev) => ({ ...prev, isLoaded: false, meshInfo: [] }));
      return;
    }

    // Reset loading state before starting new load
    setState((prev) => ({ ...prev, isLoaded: false, meshInfo: [] }));

    try {
      const nodes = await Utils3D.loadNodeMapForGLTF(url);

      let meshCore = [] as MeshInfo[];

      const allMesh = Object.values(nodes).flat();

      meshCore = allMesh.map((mesh) => MeshInfo.parseMeshInfo(mesh));

      setState({
        isLoaded: true,
        meshInfo: meshCore,
      });
    } catch (error) {
      Logger.error(`Error loading GLB file: ${error}`);
      setState((prev) => ({
        ...prev,
        isLoaded: false,
        meshInfo: [],
      }));
    }
  }, [url]);

  useEffect(() => {
    loader();
  }, [loader]);

  return state;
};
