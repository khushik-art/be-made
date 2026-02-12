import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';

import { useMainContext } from '../../hooks/useMainContext';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { Viewer3D } from '../Viewer3D/Viewer3D';
import { FooterSummary } from './Footer/FooterSummary';
import { NavBar } from './NavBar/NavBar';
import { SideBar } from './SideBar/SideBar';

export const Viewer = observer(() => {
  const { design3DManager, designManager } = useMainContext();
  const mainRef = useRef<HTMLDivElement>(null);
  const showGlobalLoader = !design3DManager.hasInitialLoadCompleted;

  useScrollSpy(mainRef.current, (step) => {
    designManager.setStep(step);
  });
  return (
    <Box
      sx={{
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
      }}>
      {/* NAV */}
      <NavBar />

      {/* SCROLL CONTAINER (IMPORTANT) */}
      <Box
        ref={mainRef}
        id="configurator-scroll-container"
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto', // ← ONLY scroll here
          position: 'relative',
        }}>
        <Box
          sx={{
            display: 'flex',
            minWidth: 0,
            minHeight: '100%',
          }}>
          {/* Viewer area */}
          <Box
            sx={{
              backgroundImage:
                'url("/assets/images/background/background.svg")',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              flex: 1,
              height: 'calc(100vh - 72px - 64px)',
              minWidth: 0,
              overflow: 'hidden',
              position: 'sticky',
              top: 0, // nav + footer
            }}>
            <Viewer3D />
          </Box>
          {/* Sidebar */}
          <SideBar />
        </Box>
      </Box>

      {/* FOOTER */}
      <FooterSummary />

      {showGlobalLoader && (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#fff',
            color: '#23262a',
            display: 'flex',
            fontSize: 24,
            fontWeight: 600,
            inset: 0,
            justifyContent: 'center',
            position: 'fixed',
            zIndex: 2000,
          }}>
          Loading 3D Configurator
        </Box>
      )}
    </Box>
  );
});
