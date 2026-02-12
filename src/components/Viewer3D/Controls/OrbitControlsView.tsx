import { OrbitControls } from '@react-three/drei';

export const OrbitControlsView = () => {
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.08}
      /* Camera limits */
      minDistance={3}
      maxDistance={10}
      /* Rotation limits (important for product viewer) */
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
      /* Disable weird stuff */
      enablePan={false}
      enableZoom={true}
      /* Make rotation smooth */
      rotateSpeed={0.6}
      zoomSpeed={0.6}
    />
  );
};
