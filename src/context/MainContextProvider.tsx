import { ReactNode, useMemo } from 'react';

import { StateManager } from '../state/StateManager';
import { parseSharedConfigFromUrl } from '../utils/shareConfig';
import { MainContext } from './MainContext';

export const MainContextProvider = ({ children }: { children: ReactNode }) => {
  const stateManager = useMemo(() => {
    const manager = new StateManager();
    const sharedConfig = parseSharedConfigFromUrl();
    if (sharedConfig) {
      manager.designManager.applyShareConfig(sharedConfig);
    }
    return manager;
  }, []);

  return (
    <MainContext.Provider value={stateManager}>
      {children}
    </MainContext.Provider>
  );
};
