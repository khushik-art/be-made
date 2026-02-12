import { TopShape } from '../state/TableDesignManager';

export type TopShapeItem = {
  id: TopShape;
  label: string;
  preview: string;

  modelUrl: string;
  modelMdfUrl: string; // ✅ REQUIRED

  dimensionConstraints: {
    minLength?: number;
    maxLength?: number;
    minWidth?: number;
    maxWidth?: number;
    minTopDiameter?: number;
    maxTopDiameter?: number;
    minLengthWidth?: number;
    maxLengthWidth?: number;
  };
};
