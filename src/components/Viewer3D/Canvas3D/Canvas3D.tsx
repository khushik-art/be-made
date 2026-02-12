import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import Env from '../Env/Env';
import { SceneBootstrap } from '../SceneBootstrap';

export const Canvas3D = () => {
  return (
    <Canvas
      camera={{ fov: 40, position: [0, 2, 6] }}
      shadows
      gl={{
        alpha: true,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.toneMappingExposure = 1.15;
      }}>
      <Env />
      <SceneBootstrap />
    </Canvas>
  );
};
