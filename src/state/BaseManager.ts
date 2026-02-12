import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { BaseFinishTextures } from '../types/baseFinish';
import { BaseFinishManager } from './finish/BaseFinishManager';

type LegPairState = {
  left: THREE.Object3D;
  leftOriginalX: number;
  right: THREE.Object3D;
  rightOriginalX: number;
};

export class BaseManager {
  private _scene: THREE.Scene | null = null;
  private _base: THREE.Object3D | null = null;
  private _bounds: THREE.Box3 | null = null;
  private _loader = new GLTFLoader();
  private _loadToken = 0;
  private _pendingFinish: {
    textures: BaseFinishTextures;
    baseId: string;
  } | null = null;
  private _currentBaseId: string | null = null;
  private _currentModelUrl: string | null = null;
  private _latestLength = 3180;
  private _latestWidth = 1300;
  private _legPairState: LegPairState | null = null;
  private _originalScaleX = 1;
  private _isCradleSmall = false;

  private _finishManager = new BaseFinishManager();

  attach(scene: THREE.Scene) {
    this._scene = scene;
  }

  async load(modelUrl: string, baseId: string) {
    const resolvedModelUrl = this.resolveModelUrlByRules(modelUrl, baseId);
    const token = ++this._loadToken;
    this.disposeBase();

    const gltf = await this._loader.loadAsync(resolvedModelUrl);

    if (token !== this._loadToken) return;

    this._base = gltf.scene;
    this._currentBaseId = baseId;
    this._currentModelUrl = resolvedModelUrl;
    this._isCradleSmall = resolvedModelUrl.includes('/cradle/smallModel.glb');
    this._legPairState = null;
    this._originalScaleX = this._base.scale.x || 1;

    this.prepareMeshes(this._base);
    this._scene?.add(this._base);
    this.updateBounds();
    this.cacheLegPairs();
    this.applyDimensionBehavior();

    // ✅ apply finish if already selected
    if (this._pendingFinish) {
      this._finishManager.apply(
        this._base,
        this._pendingFinish.textures,
        this._pendingFinish.baseId,
      );
    }
  }

  setFinish(textures: BaseFinishTextures, baseId: string) {
    this._pendingFinish = { baseId, textures };

    if (this._base) {
      this._finishManager.apply(this._base, textures, baseId);
    }
  }

  get object(): THREE.Object3D | null {
    return this._base;
  }

  setVisible(visible: boolean) {
    if (!this._base) return;
    this._base.visible = visible;
  }

  get bounds() {
    return this._bounds;
  }

  updateForTopDimensions(length: number, width: number) {
    this._latestLength = length;
    this._latestWidth = width;

    if (!this._base || !this._currentBaseId || !this._currentModelUrl) return;

    if (this._currentBaseId === 'cradle') {
      const shouldUseSmall = length < 2500;
      if (shouldUseSmall !== this._isCradleSmall) {
        const desiredModel = shouldUseSmall
          ? '/assets/images/base-shape/cradle/smallModel.glb'
          : '/assets/images/base-shape/cradle/model.glb';
        void this.load(desiredModel, this._currentBaseId);
        return;
      }
    }

    this.applyDimensionBehavior();
  }

  private resolveModelUrlByRules(modelUrl: string, baseId: string) {
    if (baseId !== 'cradle') return modelUrl;

    if (this._latestLength < 2500) {
      return '/assets/images/base-shape/cradle/smallModel.glb';
    }

    return '/assets/images/base-shape/cradle/model.glb';
  }

  private updateBounds() {
    if (!this._base) return;
    this._bounds = new THREE.Box3().setFromObject(this._base);
  }

  private cacheLegPairs() {
    if (!this._base || !this._currentBaseId) return;

    const targets = new Set(['linea', 'moon', 'twiste', 'curva']);
    if (!targets.has(this._currentBaseId)) return;

    const baseBounds = new THREE.Box3().setFromObject(this._base);
    const baseSize = baseBounds.getSize(new THREE.Vector3());
    const baseCenter = baseBounds.getCenter(new THREE.Vector3());
    const clusters = new Map<
      string,
      {
        anchor: THREE.Object3D;
        count: number;
        sumX: number;
      }
    >();

    this._base.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const box = new THREE.Box3().setFromObject(node as THREE.Object3D);
      if (box.isEmpty()) return;

      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const isLowerPart = center.y < baseCenter.y + baseSize.y * 0.2;
      const isOffsetEnough =
        Math.abs(center.x - baseCenter.x) > baseSize.x * 0.08;
      const isLegLike =
        isLowerPart && isOffsetEnough && size.y > baseSize.y * 0.08;
      if (!isLegLike) return;

      let anchor: THREE.Object3D = node;
      while (anchor.parent && anchor.parent !== this._base) {
        anchor = anchor.parent;
      }

      const key = anchor.uuid;
      const prev = clusters.get(key);
      if (prev) {
        prev.count += 1;
        prev.sumX += center.x;
      } else {
        clusters.set(key, {
          anchor,
          count: 1,
          sumX: center.x,
        });
      }
    });

    const candidates = Array.from(clusters.values()).map((cluster) => ({
      anchor: cluster.anchor,
      avgX: cluster.sumX / cluster.count,
    }));

    if (candidates.length < 2) return;

    const left = candidates
      .filter((c) => c.avgX < baseCenter.x)
      .sort((a, b) => a.avgX - b.avgX)[0];
    const right = candidates
      .filter((c) => c.avgX > baseCenter.x)
      .sort((a, b) => b.avgX - a.avgX)[0];

    if (!left || !right) return;

    this._legPairState = {
      left: left.anchor,
      leftOriginalX: left.anchor.position.x,
      right: right.anchor,
      rightOriginalX: right.anchor.position.x,
    };
  }

  private applyDimensionBehavior() {
    if (!this._base || !this._currentBaseId) return;

    const twinLegBases = new Set(['linea', 'twiste', 'curva']);
    const isTwinLegBase = twinLegBases.has(this._currentBaseId);
    const isMoon = this._currentBaseId === 'moon';
    if (!isTwinLegBase && !isMoon) return;

    const ratio = THREE.MathUtils.clamp(this._latestLength / 3180, 0.56, 1);
    const moonRatio =
      this._latestLength < 3000
        ? THREE.MathUtils.clamp(this._latestLength / 3000, 0.72, 1)
        : 1;

    const spacingRatio = isMoon ? moonRatio : ratio;

    if (this._legPairState) {
      this._base.scale.x = this._originalScaleX;
      const { left, leftOriginalX, right, rightOriginalX } = this._legPairState;
      const centerX = (leftOriginalX + rightOriginalX) / 2;
      const leftOffset = (leftOriginalX - centerX) * spacingRatio;
      const rightOffset = (rightOriginalX - centerX) * spacingRatio;

      left.position.x = centerX + leftOffset;
      right.position.x = centerX + rightOffset;
    } else {
      // this._base.scale.x = this._originalScaleX * spacingRatio;
    }

    this.updateBounds();
  }

  private prepareMeshes(object: THREE.Object3D) {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });
  }

  private disposeBase() {
    if (!this._base || !this._scene) return;
    this._scene.remove(this._base);
    this._base = null;
    this._bounds = null;
    this._legPairState = null;
  }

  dispose() {
    this.disposeBase();
    this._scene = null;
  }
}
