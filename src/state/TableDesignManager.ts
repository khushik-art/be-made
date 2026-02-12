import { makeAutoObservable } from 'mobx';

import { TopShapeItem } from '../types/top';
import { ConfiguratorStep } from './ConfiguratorStep';
import { StateManager } from './StateManager';

export type BaseId =
  | 'linea'
  | 'linea-dome'
  | 'linea-contour'
  | 'curva'
  | 'cradle'
  | 'twiste'
  | 'axis'
  | 'base-8'
  | 'butterfly'
  | 'thrio'
  | 'moon';

export type TopShape =
  | 'capsule'
  | 'oblong'
  | 'oval'
  | 'rectangle'
  | 'round'
  | 'square';

export type FinishType = 'polish' | 'natural' | 'silk';

export type ChairId = 'aria' | 'vela' | 'siena';

type RectConstraints = {
  mode: 'rect';
  minLength: number;
  maxLength: number;
  minWidth: number;
  maxWidth: number;
};

type DiameterConstraints = {
  mode: 'diameter';
  min: number;
  max: number;
};

/**
 * ===== TableDesignManager =====
 * Single source of truth for
 * WHAT the user has selected
 */

export class TableDesignManager {
  currentStep: ConfiguratorStep = ConfiguratorStep.Base;
  private _state: StateManager;

  // Base
  selectedBaseId: BaseId;
  selectedBaseColor: string;

  // Table Top
  selectedTopShape: TopShape;
  selectedTopColor: string;

  // Dimensions
  length: number;
  width: number;

  // Chairs
  selectedChairId: ChairId | null;
  selectedChairColor: string | null;
  chairQuantity: number;

  constructor(state: StateManager) {
    this._state = state;

    this.selectedBaseId = 'linea';
    this.selectedBaseColor = 'gold';

    this.selectedTopShape = 'capsule';
    this.selectedTopColor = 'amani_grey';

    this.length = 3180;
    this.width = 1300;

    this.selectedChairId = null;
    this.selectedChairColor = null;
    this.chairQuantity = 0;

    makeAutoObservable(this);
  }
  // Base

  setBase(baseId: BaseId) {
    this.selectedBaseId = baseId;

    const base = this._state.dataStore.getBase(baseId);

    // keep top shape valid
    if (!this.isTopShapeSupported(this.selectedTopShape)) {
      this.selectedTopShape = base.supportedTopShapes[0] as TopShape;
    }

    const availableColors = base.colors.map((c) => c.id);
    if (!availableColors.includes(this.selectedBaseColor)) {
      this.selectedBaseColor = availableColors[0];
    }
  }

  setBaseColor(color: string) {
    this.selectedBaseColor = color;
  }

  // table top

  setTopShape(shape: TopShape) {
    // console.group('[TableDesignManager] setTopShape');
    // console.log('incoming shape:', shape);
    // console.log('BEFORE change', {
    //   length: this.length,
    //   width: this.width,
    //   prevShape: this.selectedTopShape,
    // });
    if (!this.isTopShapeSupported(shape)) return;

    this.selectedTopShape = shape;
    const c = this.dimensionConstraints;

    // console.log('constraints:', c);

    if (c.mode === 'rect') {
      this.length = c.maxLength;
      this.width = c.maxWidth;
      // return;
    }

    // ✅ DIAMETER SHAPES (round / square)
    if (c.mode === 'diameter') {
      this.length = c.max; // 🔥 THIS WAS MISSING
      this.width = c.max; // keep sane
    }
    // console.log('AFTER change', {
    //   length: this.length,
    //   width: this.width,
    //   mode: c.mode,
    // });
    // console.groupEnd();
  }

  setTopColor(color: string) {
    this.selectedTopColor = color;
  }

  get allFinishes() {
    return this._state.dataStore.getAllFinishes();
  }

  get selectedFinishType(): FinishType {
    const finish = this._state.dataStore.getFinish(this.selectedTopColor);
    return finish.finishType as FinishType;
  }

  // dimensions

  get dimensionConstraints(): RectConstraints | DiameterConstraints {
    const top = this._state.dataStore.getTopShape(this.selectedTopShape);
    const c = top.dimensionConstraints;

    // Rectangular / capsule / oval etc
    if ('minLength' in c) {
      return {
        mode: 'rect',
        minLength: c.minLength,
        maxLength: c.maxLength,
        minWidth: c.minWidth,
        maxWidth: c.maxWidth,
      };
    }

    // Round / square
    return {
      mode: 'diameter',
      min: c.minTopDiameter ?? c.minLengthWidth!,
      max: c.maxTopDiameter ?? c.maxLengthWidth!,
    };
  }

  setLength(value: number) {
    const c = this.dimensionConstraints;

    if (c.mode === 'rect') {
      this.length = Math.min(Math.max(value, c.minLength), c.maxLength);
      return;
    }

    // diameter mode
    this.length = Math.min(Math.max(value, c.min), c.max);
  }

  setWidth(width: number) {
    const c = this.dimensionConstraints;
    if (c.mode !== 'rect') return;

    this.width = Math.min(Math.max(width, c.minWidth), c.maxWidth);
  }

  // chairs
  setChairs(chairId: ChairId | null) {
    this.selectedChairId = chairId;

    if (chairId === null) {
      this.selectedChairColor = null;
      this.chairQuantity = 0;
      return;
    }

    const chair = this._state.dataStore.getChair(chairId);
    if (!this.selectedChairColor || !chair.colors.some((c) => c.id === this.selectedChairColor)) {
      this.selectedChairColor = chair.colors[0]?.id ?? null;
    }
  }

  setChairColor(color: string) {
    this.selectedChairColor = color;
  }

  setChairQuantity(quantity: number) {
    this.chairQuantity = Math.max(0, quantity);
  }

  // computed/derived

  get dimensionsLabel() {
    return `${this.length} x ${this.width} mm`;
  }
  get allTopShapes(): TopShapeItem[] {
    return this._state.dataStore.getAllTopShapes();
  }

  isTopShapeSupported(shape: TopShape): boolean {
    const base = this._state.dataStore.getBase(this.selectedBaseId);
    return base.supportedTopShapes.includes(shape);
  }

  // step

  setStep(step: ConfiguratorStep) {
    this.currentStep = step;
  }

  isStepActive(step: ConfiguratorStep) {
    return this.currentStep === step;
  }

  isStepCompleted(step: ConfiguratorStep) {
    const order = Object.values(ConfiguratorStep);
    return order.indexOf(step) < order.indexOf(this.currentStep);
  }

  get summary() {
    return {
      base: this.selectedBaseId,
      baseColor: this.selectedBaseColor,
      chairColor: this.selectedChairColor ?? 'N/A',
      chairQuantity: this.chairQuantity,
      chairType: this.selectedChairId ?? 'N/A',
      dimensions: this.dimensionsLabel,
      tableTop: this.selectedTopColor,
      topShape: this.selectedTopShape,
    };
  }
}
