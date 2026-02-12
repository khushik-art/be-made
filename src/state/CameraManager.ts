import * as THREE from 'three';

import { ConfiguratorStep } from './ConfiguratorStep';

export type CameraView = 'front' | 'right' | 'top' | 'left';
export type ExtendedCameraView =
  | CameraView
  | 'two-chair'
  | 'chair-view'
  | 'chair-top-view';

type OrbitControlsLike = {
  target: THREE.Vector3;
  update: () => void;
};

export class CameraManager {
  private _camera: THREE.PerspectiveCamera | null = null;
  private _controls: OrbitControlsLike | null = null;

  private _transitionActive = false;
  private _transitionTime = 0;
  private _transitionDuration = 0.7;

  private _fromPosition = new THREE.Vector3();
  private _toPosition = new THREE.Vector3();
  private _fromTarget = new THREE.Vector3();
  private _toTarget = new THREE.Vector3();
  private _fromUp = new THREE.Vector3(0, 1, 0);
  private _toUp = new THREE.Vector3(0, 1, 0);

  activeView: ExtendedCameraView = 'front';

  setCamera(camera: THREE.PerspectiveCamera) {
    this._camera = camera;
  }

  setControls(controls: OrbitControlsLike) {
    this._controls = controls;
  }

  get isReady() {
    return Boolean(this._camera && this._controls);
  }

  update(delta: number) {
    if (!this._camera || !this._controls || !this._transitionActive) return;

    this._transitionTime += delta / this._transitionDuration;

    const t = THREE.MathUtils.clamp(this._transitionTime, 0, 1);
    const eased = t * t * (3 - 2 * t);

    this._camera.position.lerpVectors(
      this._fromPosition,
      this._toPosition,
      eased,
    );
    this._camera.up.lerpVectors(this._fromUp, this._toUp, eased).normalize();
    this._controls.target.lerpVectors(this._fromTarget, this._toTarget, eased);
    this._controls.update();

    if (t >= 1) {
      this._transitionActive = false;
      this._camera.position.copy(this._toPosition);
      this._camera.up.copy(this._toUp);
      this._controls.target.copy(this._toTarget);
      this._controls.update();
    }
  }

  moveToView(
    view: ExtendedCameraView,
    bounds: THREE.Box3 | null,
    options?: { instant?: boolean; duration?: number },
  ) {
    if (!this._camera || !this._controls) return;

    const center = bounds
      ? bounds.getCenter(new THREE.Vector3())
      : new THREE.Vector3(0, 0.85, 0);
    const size = bounds
      ? bounds.getSize(new THREE.Vector3())
      : new THREE.Vector3(2.2, 1.2, 1.2);

    const radius = Math.max(size.x, size.y, size.z, 1.5);
    const baseDistance = radius * 2.5;

    const presets: Record<
      ExtendedCameraView,
      { direction: THREE.Vector3; distanceFactor: number }
    > = {
      'chair-top-view': {
        direction: new THREE.Vector3(0, 1, 0),
        distanceFactor: 0.5,
      },
      'chair-view': {
        direction: new THREE.Vector3(1, 0.35, 0.5).normalize(),
        distanceFactor: 0.5,
      },
      front: {
        direction: new THREE.Vector3(0, 0.1, 0.5).normalize(),
        distanceFactor: 0.5,
      },
      left: {
        direction: new THREE.Vector3(-1, 0.4, 0.5).normalize(),
        distanceFactor: 0.5,
      },
      right: {
        direction: new THREE.Vector3(1, 0.4, 0.5).normalize(),
        distanceFactor: 0.5,
      },
      top: {
        direction: new THREE.Vector3(0, 1, 0),
        distanceFactor: 0.5,
      },
      'two-chair': {
        direction: new THREE.Vector3(0, 0.14, 1).normalize(),
        distanceFactor: 0.85,
      },
    };

    const preset = presets[view];
    const position = center
      .clone()
      .add(
        preset.direction.multiplyScalar(baseDistance * preset.distanceFactor),
      );
    const target = center.clone().setY(center.y + size.y * 0.08);

    this._transitionDuration = Math.max(0.01, options?.duration ?? 0.7);
    this._transitionTime = 0;

    this._fromPosition.copy(this._camera.position);
    this._toPosition.copy(position);

    this._fromUp.copy(this._camera.up);
    this._toUp.set(0, 1, 0);
    if (view === 'top' || view === 'chair-top-view') {
      this._toUp.set(0, 0, -1);
    }

    this._fromTarget.copy(this._controls.target);
    this._toTarget.copy(target);

    this.activeView = view;

    if (options?.instant) {
      this._transitionActive = false;
      this._camera.position.copy(this._toPosition);
      this._camera.up.copy(this._toUp);
      this._controls.target.copy(this._toTarget);
      this._controls.update();
      return;
    }

    this._transitionActive = true;
  }

  /* ================= framing ================= */

  frame(_bounds: THREE.Box3 | null) {
    // Intentionally left empty for now.
    // moveToView() handles active framing presets.
  }

  /* ================= step-based camera ================= */

  moveToStep(step: ConfiguratorStep, bounds: THREE.Box3 | null) {
    this.frame(bounds);

    if (step === ConfiguratorStep.Base) {
      this.moveToView('front', bounds, { duration: 0.65 });
    }
  }
}
