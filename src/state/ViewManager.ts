import { makeAutoObservable } from 'mobx';

import { MeshInfoJson } from '../types';
import { StateManager } from './StateManager';

export class ViewManager {
  private _libState: StateManager;
  private _meshInfoJson: MeshInfoJson | null = null;
  private _jsonUrl = './init.json';
  constructor(libState: StateManager) {
    this._libState = libState;
    makeAutoObservable(this);
  }

  get meshInfoJson() {
    return this._meshInfoJson;
  }

  setMeshInfoJson(meshInfoJson: MeshInfoJson) {
    this._meshInfoJson = meshInfoJson;
  }

  setGlbUrl(glbUrl: string) {
    const newMeshInfoJson: MeshInfoJson = {
      ...(this._meshInfoJson || { availableColors: [] }),
      glbUrl,
    };
    this.setMeshInfoJson(newMeshInfoJson);
  }

  get glbUrl() {
    return this._meshInfoJson?.glbUrl;
  }

  get jsonUrl() {
    return this._jsonUrl;
  }

  setJsonUrl(jsonUrl: string) {
    this._jsonUrl = jsonUrl;
  }
}
