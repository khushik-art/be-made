import { useGLTF } from '@react-three/drei';

type Props = {
  url: string;
};

export const SingleMesh = ({ url }: Props) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

useGLTF.preload('/assets/images/base-shape/linea/model.glb');
