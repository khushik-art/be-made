import * as THREE from 'three';

type RectLimits = {
  mode: 'rect';
  maxLength: number;
  maxWidth: number;
};

type DiameterLimits = {
  mode: 'diameter';
  maxDiameter: number;
};

type TopDimensionLimits = RectLimits | DiameterLimits;

export class TopDimensionManager {
  private _topSurface: THREE.Object3D | null = null;
  private _mdfLayer: THREE.Object3D | null = null;
  private _limits: TopDimensionLimits | null = null;

  /* ================= attach ================= */

  attach(
    topSurface: THREE.Object3D,
    mdfLayer: THREE.Object3D,
    limits: TopDimensionLimits,
  ) {
    // console.group('[TopDimensionManager] attach');
    // console.log('limits:', limits);
    this._topSurface = topSurface;
    this._mdfLayer = mdfLayer;
    this._limits = limits;

    // Always start from authored (max-size) geometry
    this._topSurface.scale.set(1, 1, 1);
    this._mdfLayer.scale.set(1, 1, 1);

    // console.groupEnd();
  }

  detach() {
    this._topSurface = null;
    this._mdfLayer = null;
    this._limits = null;
  }

  /* ================= public API ================= */

  // rect shapes
  setDimensions(lengthMm: number, widthMm: number) {
    if (!this._topSurface || !this._mdfLayer || !this._limits) return;
    if (this._limits.mode !== 'rect') return;

    const scaleX = lengthMm / this._limits.maxLength;
    const scaleZ = widthMm / this._limits.maxWidth;

    this._topSurface.scale.set(scaleX, 1, scaleZ);
    this._mdfLayer.scale.set(scaleX, 1, scaleZ);
  }

  // Diameter Shapes
  setDiameter(diameterMm: number) {
    if (!this._topSurface || !this._mdfLayer || !this._limits) return;
    if (this._limits.mode !== 'diameter') return;

    const s = diameterMm / this._limits.maxDiameter;

    this._topSurface.scale.set(s, 1, s);
    this._mdfLayer.scale.set(s, 1, s);
  }

  /* ================= internals ================= */

  private applyScale() {
    if (!this._topSurface || !this._mdfLayer || !this._limits) return;

    let scaleX = 1;
    let scaleZ = 1;

    if (this._limits.mode === 'rect') {
      scaleX = this._lengthMm / this._limits.maxLength;
      scaleZ = this._widthMm / this._limits.maxWidth;
    }

    if (this._limits.mode === 'diameter') {
      const s = this._lengthMm / this._limits.maxDiameter;
      scaleX = s;
      scaleZ = s;
    }

    this._topSurface.scale.set(scaleX, 1, scaleZ);
    this._mdfLayer.scale.set(scaleX, 1, scaleZ);
  }
}
