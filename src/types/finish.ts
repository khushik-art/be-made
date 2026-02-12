import { FinishType } from '../state/TableDesignManager';

export type Finish = {
  id: string;
  label: string;
  finishType: FinishType;
  preview: string;
  samplePreview: string;
  textures: {
    baseColor: string;
    mdf: string;
    normal: string;
    roughness: string;
    metalness: string;
  };
};
