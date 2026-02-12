// import { Camera } from '@react-three/fiber';
import { makeAutoObservable } from 'mobx';
import { reaction } from 'mobx';
// import { Object3D } from 'three';
import * as THREE from 'three';

import { CameraManager, ExtendedCameraView } from './CameraManager';
import { ConfiguratorStep } from './ConfiguratorStep';
import { EnvManager } from './EnvManager';
import { BaseFinishManager } from './finish/BaseFinishManager';
import { TopFinishManager } from './finish/TopFinishManager';
import { MeshManager } from './MeshManager';
import { StateManager } from './StateManager';

export class Design3DManager {
  private _state: StateManager;
  private _reactionsInitialized = false;
  camera: CameraManager;
  mesh: MeshManager;
  env: EnvManager;
  baseFinish = new BaseFinishManager();
  topFinish = new TopFinishManager();

  isReady = false;
  hasInitialLoadCompleted = false;
  private _loadingCount = 0;
  activeCameraView: ExtendedCameraView = 'front';
  private _initialFrontFramed = false;
  private _initToken = 0;

  constructor(state: StateManager) {
    this._state = state;
    this.camera = new CameraManager();
    this.mesh = new MeshManager();
    this.env = new EnvManager();

    makeAutoObservable(this);
  }

  // lifecycle

  init(scene: THREE.Scene) {
    this._initToken += 1;
    this.env.init(scene);
    this.mesh.init(scene);
    this.hasInitialLoadCompleted = false;

    if (!this._reactionsInitialized) {
      this.setupReactions();
      this._reactionsInitialized = true;
      // console.log('[Design3DManager] setupReactions');
    } else {
      void this.reloadCurrentSelection();
    }
    this.isReady = true;
    void this.waitForInitialLoad(this._initToken);
  }

  dispose() {
    this._initToken += 1;
    this.hasInitialLoadCompleted = false;
    this.isReady = false;
    this._initialFrontFramed = false;
    this.activeCameraView = 'front';
    this.mesh.dispose();
  }

  get isLoading() {
    return this._loadingCount > 0;
  }

  private startLoading() {
    this._loadingCount += 1;
  }

  private endLoading() {
    this._loadingCount = Math.max(0, this._loadingCount - 1);
  }

  private async waitForInitialLoad(token: number) {
    for (let i = 0; i < 240; i += 1) {
      if (token !== this._initToken) return;

      const hasBase = Boolean(this.mesh.base.object);
      const hasTop = Boolean(this.mesh.top.surface && this.mesh.top.mdf);
      if (hasBase && hasTop && !this.isLoading) {
        this.hasInitialLoadCompleted = true;
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (token === this._initToken) {
      this.hasInitialLoadCompleted = true;
    }
  }

  private async reloadCurrentSelection() {
    const dm = this._state.designManager;
    const base = this._state.dataStore.getBase(dm.selectedBaseId);
    const top = this._state.dataStore.getTopShape(dm.selectedTopShape);
    const baseTextures = this._state.dataStore.getBaseFinishTextures(
      dm.selectedBaseId,
      dm.selectedBaseColor,
    );
    const topFinish = this._state.dataStore.getTopFinish(dm.selectedTopColor);

    this.startLoading();
    try {
      await this.mesh.base.load(base.modelUrl, dm.selectedBaseId);

      if (baseTextures) {
        this.mesh.base.setFinish(baseTextures, dm.selectedBaseId);
      }

      const constraints = top.dimensionConstraints;
      if ('minLength' in constraints) {
        await this.mesh.top.load(
          top.modelUrl,
          top.modelMdfUrl,
          {
            mode: 'rect',
            maxLength: constraints.maxLength,
            maxWidth: constraints.maxWidth,
          },
          {
            mode: 'rect',
            length: dm.length,
            width: dm.width,
          },
        );
      } else {
        await this.mesh.top.load(
          top.modelUrl,
          top.modelMdfUrl,
          {
            mode: 'diameter',
            maxDiameter: constraints.maxTopDiameter ?? constraints.maxLengthWidth!,
          },
          {
            mode: 'diameter',
            length: dm.length,
            width: dm.width,
          },
        );
      }

      if (topFinish) {
        await this.mesh.top.setFinish(topFinish);
      }

      if (dm.dimensionConstraints.mode === 'rect') {
        this.mesh.top.setDimensions(dm.length, dm.width);
      } else {
        this.mesh.top.setDiameter(dm.length);
      }
      this.mesh.base.updateForTopDimensions(dm.length, dm.width);

      if (this.camera.isReady && this.mesh.tableBounds) {
        await this.setCameraView('front', { duration: 0.01, instant: true });
      }
    } finally {
      this.endLoading();
    }
  }

  // Product -> 3D

  // onBaseChange(modelUrl: string) {
  //   this.mesh.base.load(modelUrl).then(() => {
  //     this.camera.frame(this.mesh.bounds);
  //   });
  // }

  // onTopShapeChanged(shape: string) {
  //   this.mesh.setTopShape(shape);
  //   // this.onBoundsUpdated();
  // }

  // onFinishChanged(baseId: string, colorId: string) {
  //   // const textures = this._state.dataStore.getBaseFinishTextures(
  //   //   baseId,
  //   //   colorId,
  //   // );
  //   // this.mesh.base.applyFinish(textures);
  // }

  onStepChanged(step: ConfiguratorStep) {
    this.camera.moveToStep(step, this.mesh.bounds);
  }

  get hasChairStyleAndColor() {
    return Boolean(
      this._state.designManager.selectedChairId &&
        this._state.designManager.selectedChairColor,
    );
  }

  async setCameraView(
    view: ExtendedCameraView,
    options?: { duration?: number; instant?: boolean },
  ) {
    if (
      (view === 'two-chair' ||
        view === 'chair-view' ||
        view === 'chair-top-view') &&
      !this.hasChairStyleAndColor
    ) {
      return;
    }

    this.activeCameraView = view;

    await this.applySceneModeForView(view);

    const bounds =
      view === 'two-chair'
        ? this.mesh.chairBounds
        : view === 'chair-view' || view === 'chair-top-view'
          ? this.mesh.fullBounds
          : this.mesh.tableBounds;

    this.camera.moveToView(view, bounds, {
      duration: options?.duration ?? 0.72,
      instant: options?.instant ?? false,
    });
  }

  private refreshActiveCameraFraming() {
    if (!this.camera.isReady) return;

    const activeView = this.activeCameraView;
    const bounds =
      activeView === 'two-chair'
        ? this.mesh.chairBounds
        : activeView === 'chair-view' || activeView === 'chair-top-view'
          ? this.mesh.fullBounds
          : this.mesh.tableBounds;

    this.camera.moveToView(activeView, bounds, {
      duration: 0.01,
      instant: true,
    });
  }

  private async applySceneModeForView(view: ExtendedCameraView) {
    const isTableOnlyView =
      view === 'front' || view === 'left' || view === 'top' || view === 'right';
    const showTable = view !== 'two-chair';
    this.mesh.base.setVisible(showTable);
    this.mesh.top.setVisible(showTable);

    if (isTableOnlyView) {
      this.mesh.chairs.clear();
      return;
    }

    if (!this.hasChairStyleAndColor) {
      if (this._state.designManager.chairQuantity === 0) {
        this.mesh.chairs.clear();
      }
      return;
    }

    const chairParams = this.getSelectedChairParams();
    if (!chairParams) return;

    this.startLoading();
    try {
      if (view === 'two-chair') {
        await this.mesh.chairs.updateTwoChairPreview(chairParams);
      } else {
        const dm = this._state.designManager;
        await this.mesh.chairs.update({
          ...chairParams,
          count: dm.chairQuantity,
          length: dm.length,
          width: dm.width,
          topShape: dm.selectedTopShape,
        });
      }
    } finally {
      this.endLoading();
    }
  }

  private getSelectedChairParams(): {
    chairId: 'aria' | 'vela' | 'siena';
    modelUrl: string;
    textures: {
      chairLegColor: string;
      chairLegMetalness: string;
      chairLegNormal: string;
      chairLegRoughness: string;
      chairTopColor: string;
      chairTopMetalness: string;
      chairTopNormal: string;
      chairTopRoughness: string;
    };
  } | null {
    const dm = this._state.designManager;
    if (!dm.selectedChairId || !dm.selectedChairColor) return null;

    const chair = this._state.dataStore.getChair(dm.selectedChairId);
    const color = chair.colors.find((c) => c.id === dm.selectedChairColor);
    if (!color) return null;

    return {
      chairId: dm.selectedChairId,
      modelUrl: chair.glbUrl,
      textures: {
        chairLegColor: color.chairLegColor,
        chairLegMetalness: color.chairLegMetalness,
        chairLegNormal: color.chairLegNormal,
        chairLegRoughness: color.chairLegRoughness,
        chairTopColor: color.chairTopColor,
        chairTopMetalness: color.chairTopMetalness,
        chairTopNormal: color.chairTopNormal,
        chairTopRoughness: color.chairTopRoughness,
      },
    };
  }

  private setupReactions() {
    /* Base change → load GLB */
    reaction(
      () => this._state.designManager.selectedBaseId,
      async (baseId) => {
        const base = this._state.dataStore.getBase(baseId);
        this.startLoading();
        try {
          await this.mesh.base.load(base.modelUrl, baseId);
          this.refreshActiveCameraFraming();
        } finally {
          this.endLoading();
        }
      },
      { fireImmediately: true }, // load initial base
    );

    /* Base color → apply base finish */
    reaction(
      () => ({
        baseId: this._state.designManager.selectedBaseId,
        colorId: this._state.designManager.selectedBaseColor,
      }),
      ({ baseId, colorId }) => {
        const textures = this._state.dataStore.getBaseFinishTextures(
          baseId,
          colorId,
        );

        if (!textures) return;

        // 🔥 single call, load-safe
        this.mesh.base.setFinish(textures, baseId);
      },
      { fireImmediately: true },
    );

    /* Top shape → update mesh */
    reaction(
      () => this._state.designManager.selectedTopShape,
      async (shape) => {
        const dm = this._state.designManager;
        const top = this._state.dataStore.getTopShape(shape);
        const c = top.dimensionConstraints;
        this.startLoading();
        try {
          // console.group('[Design3DManager] TopShape reaction FIXED');
          // console.log('raw dm values:', {
          //   length: dm.length,
          //   width: dm.width,
          // });

          if ('minLength' in c) {
            // ✅ RECT SHAPES
            const length = c.maxLength;
            const width = c.maxWidth;

            // console.log('normalized rect:', { length, width });

            // 🔥 FORCE state correction BEFORE load
            dm.length = length;
            dm.width = width;

            await this.mesh.top.load(
              top.modelUrl,
              top.modelMdfUrl,
              {
                mode: 'rect',
                maxLength: c.maxLength,
                maxWidth: c.maxWidth,
              },
              {
                mode: 'rect',
                length,
                width,
              },
            );
            this.refreshActiveCameraFraming();
          } else {
            // ✅ DIAMETER SHAPES
            const maxDiameter = c.maxTopDiameter ?? c.maxLengthWidth!;
            const diameter = maxDiameter;

            // console.log('normalized diameter:', diameter);

            // 🔥 FORCE state correction BEFORE load
            dm.length = diameter;
            dm.width = diameter;

            await this.mesh.top.load(
              top.modelUrl,
              top.modelMdfUrl,
              {
                mode: 'diameter',
                maxDiameter,
              },
              {
                mode: 'diameter',
                length: diameter,
                width: diameter,
              },
            );
            this.refreshActiveCameraFraming();
          }

          if (
            !this._initialFrontFramed &&
            this.camera.isReady &&
            this.mesh.tableBounds
          ) {
            await this.setCameraView('front', { duration: 0.01, instant: true });
            this._initialFrontFramed = true;
          }
        } finally {
          this.endLoading();
        }

        // console.groupEnd();
      },
      { fireImmediately: true },
    );

    /* Top Color Changed */
    reaction(
      () => this._state.designManager.selectedTopColor,
      async (colorId, previousColorId) => {
        const finish = this._state.dataStore.getTopFinish(colorId);
        if (!finish) return;

        this.startLoading();
        try {
          await this.mesh.top.setFinish(finish);
        } finally {
          this.endLoading();
        }

        if (previousColorId && previousColorId !== colorId) {
          await this.setCameraView('top');
        }
      },
      { fireImmediately: true },
    );

    /* Dimension changed */
    reaction(
      () => ({
        length: this._state.designManager.length,
        width: this._state.designManager.width,
        mode: this._state.designManager.dimensionConstraints.mode,
      }),
      ({ length, width, mode }) => {
        if (mode === 'rect') {
          this.mesh.top.setDimensions(length, width);
        } else {
          this.mesh.top.setDiameter(length);
        }

        this.mesh.base.updateForTopDimensions(length, width);
      },
      { fireImmediately: true },
    );

    // reaction(
    //   () => this._state.designManager.length,
    //   (diameter) => {
    //     this.mesh.top.setDiameter?.(diameter);
    //   },
    // );

    // Chairs Added

    reaction(
      () => ({
        chairId: this._state.designManager.selectedChairId,
        colorId: this._state.designManager.selectedChairColor,
        count: this._state.designManager.chairQuantity,
        length: this._state.designManager.length,
        width: this._state.designManager.width,
        topShape: this._state.designManager.selectedTopShape,
      }),
      async ({ chairId, colorId, count, length, width, topShape }) => {
        const isTableOnlyView =
          this.activeCameraView === 'front' ||
          this.activeCameraView === 'left' ||
          this.activeCameraView === 'top' ||
          this.activeCameraView === 'right';

        if (isTableOnlyView) {
          this.mesh.chairs.clear();
          return;
        }

        if (!chairId || (!count && this.activeCameraView !== 'two-chair')) {
          this.mesh.chairs.clear();
          return;
        }

        const chair = this._state.dataStore.getChair(chairId);
        const color = chair.colors.find((c) => c.id === colorId);
        if (!color) return;

        if (this.activeCameraView === 'two-chair') {
          await this.applySceneModeForView('two-chair');
          return;
        }

        this.startLoading();
        try {
          await this.mesh.chairs.update({
            chairId,
            modelUrl: chair.glbUrl,
            textures: {
              chairLegColor: color.chairLegColor,
              chairLegMetalness: color.chairLegMetalness,
              chairLegNormal: color.chairLegNormal,
              chairLegRoughness: color.chairLegRoughness,
              chairTopColor: color.chairTopColor,
              chairTopMetalness: color.chairTopMetalness,
              chairTopNormal: color.chairTopNormal,
              chairTopRoughness: color.chairTopRoughness,
            },
            count,
            length,
            width,
            topShape,
          });
        } finally {
          this.endLoading();
        }
      },
      { fireImmediately: true },
    );

    reaction(
      () => ({
        chairColor: this._state.designManager.selectedChairColor,
        chairId: this._state.designManager.selectedChairId,
        count: this._state.designManager.chairQuantity,
      }),
      ({ chairId, chairColor, count }, previous) => {
        const shouldMoveToChairView =
          Boolean(chairId && chairColor) &&
          count > 0 &&
          (previous?.count ?? 0) === 0;

        if (shouldMoveToChairView) {
          void this.setCameraView('chair-view');
        }
      },
      { fireImmediately: true },
    );

    /* Step → camera */
    reaction(
      () => this._state.designManager.currentStep,
      (step) => {
        // this.camera.moveToStep(step, this.mesh.bounds);
      },
    );
  }

  // Viewer -> State

  // onModelloaded(scene: THREE.Object3D) {
  //   this.mesh.handleModelLoaded(scene);

  //   // 🔥 single source of truth
  //   this.onBoundsUpdated();
  // }

  private onBoundsUpdated() {
    this.camera.frame(this.mesh.bounds);
  }
}
