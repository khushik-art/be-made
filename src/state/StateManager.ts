import { makeAutoObservable } from 'mobx';

import { DataStore } from '../data/DataStore';
import { Design3DManager } from './Design3DManager';
import { TableDesignManager } from './TableDesignManager';

export class StateManager {
  constructor() {
    makeAutoObservable(this);
  }

  private _dataStore = new DataStore();

  get dataStore() {
    return this._dataStore;
  }

  private _designManager = new TableDesignManager(this);

  get designManager() {
    return this._designManager;
  }

  private _design3DManager = new Design3DManager(this);

  get design3DManager() {
    return this._design3DManager;
  }
}
