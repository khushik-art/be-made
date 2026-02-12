import { useThree } from '@react-three/fiber';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useMainContext } from '../../hooks/useMainContext';

export const SceneBootstrap = observer(() => {
  const { design3DManager } = useMainContext();

  const { scene } = useThree();

  useEffect(() => {
    design3DManager.init(scene);
    return () => design3DManager.dispose();
  }, [scene, design3DManager]);

  return null;
});
