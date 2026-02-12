import * as THREE from 'three';

import { TopShape } from '../state/TableDesignManager';

/* ===== Chair identity ===== */

export type ChairId = 'aria' | 'vela' | 'siena';
export type ChairColorId = string;

/* ===== Chair selection (from state) ===== */

export interface ChairSelection {
  chairId: ChairId;
  colorId: ChairColorId;
  count: number;
}

/* ===== Chair transforms (layout → scene) ===== */

export interface ChairTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

/* ===== Chair layout ===== */

export interface ChairLayoutParams {
  topShape: TopShape;
  length: number;
  width: number;
  count: number;
}

export type ChairLayoutResult = ChairTransform[];

/* ===== Chair assets ===== */

export interface ChairColorTextures {
  chairLegColor: string;
  chairLegMetalness: string;
  chairLegNormal: string;
  chairLegRoughness: string;
  chairTopColor: string;
  chairTopMetalness: string;
  chairTopNormal: string;
  chairTopRoughness: string;
}

export interface ChairColorVariant {
  id: ChairColorId;
  name: string;
  textures: ChairColorTextures;
}

export interface ChairItem {
  id: ChairId;
  name: string;
  glbUrl: string;
  colors: ChairColorVariant[];
  previewUrl: string;
}
