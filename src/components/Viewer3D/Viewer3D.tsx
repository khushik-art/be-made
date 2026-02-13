import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { observer } from 'mobx-react-lite';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { FinishOverlay } from '../Viewer/Overlay/FinishOverlay';
import { OverlayDots } from '../Viewer/Overlay/OverlayDots';
import { useMainContext } from '../../hooks/useMainContext';
import type { ExtendedCameraView } from '../../state/CameraManager';
import { buildShareUrl } from '../../utils/shareConfig';

/* ================= Camera Views Overlay ================= */

const CAMERA_VIEW_OPTIONS: Array<{
  id: ExtendedCameraView;
  label: string;
  requiresChairStyleAndColor?: boolean;
}> = [
  { id: 'front', label: 'Front View' },
  { id: 'left', label: 'Left View' },
  { id: 'top', label: 'Top View' },
  { id: 'right', label: 'Right View' },
  {
    id: 'two-chair',
    label: 'Two Chair View',
    requiresChairStyleAndColor: true,
  },
  {
    id: 'chair-view',
    label: 'Chair View',
    requiresChairStyleAndColor: true,
  },
  {
    id: 'chair-top-view',
    label: 'Chair Top View',
    requiresChairStyleAndColor: true,
  },
];

const CameraViewOverlay = observer(() => {
  const { design3DManager, designManager } = useMainContext();
  const hasChairStyleAndColor = Boolean(
    designManager.selectedChairId && designManager.selectedChairColor,
  );
  const visibleViews = CAMERA_VIEW_OPTIONS.filter(
    (option) => hasChairStyleAndColor || !option.requiresChairStyleAndColor,
  );
  const activeIndex = Math.max(
    0,
    visibleViews.findIndex((v) => v.id === design3DManager.activeCameraView),
  );

  const setCameraView = (index: number) => {
    const bounded = (index + visibleViews.length) % visibleViews.length;
    const view = visibleViews[bounded];
    if (!view) return;
    void design3DManager.setCameraView(view.id);
  };

  useEffect(() => {
    const active = design3DManager.activeCameraView;
    const isExtraView =
      active === 'chair-view' ||
      active === 'chair-top-view' ||
      active === 'two-chair';
    if (!hasChairStyleAndColor && isExtraView) {
      void design3DManager.setCameraView('front');
    }
  }, [design3DManager, hasChairStyleAndColor]);

  return (
    <Box
      sx={{
        bottom: { md: 22, xs: 18 },
        left: '50%',
        pointerEvents: 'auto',
        position: 'absolute',
        transform: 'translateX(-50%)',
        zIndex: 20,
      }}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: 0.3,
          justifyContent: 'center',
        }}>
        <IconButton
          onClick={() => setCameraView(activeIndex - 1)}
          sx={{ color: '#656a70', p: { md: 1, xs: 0.6 } }}>
          <ChevronLeftRoundedIcon />
        </IconButton>

        {visibleViews.map((view, idx) => (
          <Tooltip key={view.id} title={view.label} arrow placement="top">
            <IconButton
              onClick={() => setCameraView(idx)}
              sx={{
                p: { md: '6px', xs: '3px' },
              }}>
              <Box
                sx={{
                  bgcolor: idx === activeIndex ? '#5f6368' : '#f0f0f0',
                  borderRadius: '50%',
                  height: { md: 16, xs: 13 },
                  transition: 'all 0.2s ease',
                  width: { md: 16, xs: 13 },
                }}
              />
            </IconButton>
          </Tooltip>
        ))}

        <IconButton
          onClick={() => setCameraView(activeIndex + 1)}
          sx={{ color: '#656a70', p: { md: 1, xs: 0.6 } }}>
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
});

const CanvasActionsOverlay = ({
  isFullscreen,
  onDownload,
  onShare,
  onToggleFullscreen,
}: {
  isFullscreen: boolean;
  onDownload: () => void;
  onShare: () => void;
  onToggleFullscreen: () => void;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: { md: 1.2, xs: 0.8 },
        pointerEvents: 'auto',
        position: 'absolute',
        right: { md: 22, xs: 12 },
        top: { md: 22, xs: 12 },
        zIndex: 20,
      }}>
      <IconButton
        onClick={onDownload}
        sx={{
          backgroundColor: '#f8f8f8',
          border: '1px solid #c9c9c9',
          borderRadius: 1,
          height: { md: 42, xs: 36 },
          width: { md: 42, xs: 36 },
        }}>
        <SaveOutlinedIcon fontSize="small" />
      </IconButton>

      <IconButton
        onClick={onShare}
        sx={{
          backgroundColor: '#f8f8f8',
          border: '1px solid #c9c9c9',
          borderRadius: 1,
          height: { md: 42, xs: 36 },
          width: { md: 42, xs: 36 },
        }}>
        <ShareOutlinedIcon fontSize="small" />
      </IconButton>

      <IconButton
        onClick={onToggleFullscreen}
        sx={{
          backgroundColor: '#f8f8f8',
          border: '1px solid #c9c9c9',
          borderRadius: 1,
          height: { md: 42, xs: 36 },
          width: { md: 42, xs: 36 },
        }}>
        {isFullscreen ? (
          <CloseFullscreenRoundedIcon fontSize="small" />
        ) : (
          <OpenInFullRoundedIcon fontSize="small" />
        )}
      </IconButton>
    </Box>
  );
};

/* ================= Camera Wiring ================= */

const CameraRig = observer(() => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { design3DManager } = useMainContext();

  useEffect(() => {
    if (!camera) return;
    design3DManager.camera.setCamera(camera as THREE.PerspectiveCamera);
  }, [camera, design3DManager]);

  useEffect(() => {
    if (!controlsRef.current) return;
    design3DManager.camera.setControls(controlsRef.current);
  }, [design3DManager]);

  useFrame((_, delta) => {
    design3DManager.camera.update(delta);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.6}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={2.5}
      maxDistance={12}
      enablePan={false}
      enableRotate={false}
      enableZoom={false}
    />
  );
});

/* ================= Scene Bootstrap ================= */

const SceneBootstrap = observer(() => {
  const { scene } = useThree();
  const { design3DManager } = useMainContext();

  useEffect(() => {
    design3DManager.init(scene);

    return () => {
      design3DManager.dispose();
    };
  }, [scene, design3DManager]);

  return null;
});

/* ================= Viewer3D ================= */

export const Viewer3D = observer(() => {
  const dpr = useMemo(() => [1, 1.75] as [number, number], []);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();
  const { design3DManager, designManager } = useMainContext();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFinishOverlayOpen, setIsFinishOverlayOpen] = useState(!isMobile);
  const showCanvasLoader =
    design3DManager.hasInitialLoadCompleted && design3DManager.isLoading;

  useEffect(() => {
    setIsFinishOverlayOpen(!isMobile);
  }, [isMobile]);

  const handleDownload = useCallback(() => {
    const canvas = rootRef.current?.querySelector('canvas') as
      | HTMLCanvasElement
      | undefined;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;

      const now = new Date();
      const stamp = [
        now.getFullYear(),
        `${now.getMonth() + 1}`.padStart(2, '0'),
        `${now.getDate()}`.padStart(2, '0'),
        '-',
        `${now.getHours()}`.padStart(2, '0'),
        `${now.getMinutes()}`.padStart(2, '0'),
      ].join('');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `table-view-${stamp}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    if (!rootRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await rootRef.current.requestFullscreen();
  }, []);

  const handleShare = useCallback(async () => {
    const shareUrl = buildShareUrl(designManager.getShareConfig());

    try {
      await navigator.clipboard.writeText(shareUrl);
      enqueueSnackbar('Copied to clipboard', { variant: 'success' });
      return;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
      } catch {
        enqueueSnackbar('Unable to copy link', { variant: 'error' });
      }
    }
  }, [designManager, enqueueSnackbar]);

  useEffect(() => {
    const onChange = () => {
      const full = document.fullscreenElement === rootRef.current;
      setIsFullscreen(full);

      // Force repeated layout/canvas recalculation after fullscreen transitions,
      // especially on mobile where viewport metrics settle in phases.
      const emitResize = () => window.dispatchEvent(new Event('resize'));
      requestAnimationFrame(emitResize);
      setTimeout(emitResize, 120);
      setTimeout(emitResize, 320);
    };

    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const onViewportResize = () => {
      window.dispatchEvent(new Event('resize'));
    };

    viewport.addEventListener('resize', onViewportResize);
    return () => viewport.removeEventListener('resize', onViewportResize);
  }, []);

  useEffect(() => {
    document.body.style.overflowX = isFullscreen ? 'hidden' : '';
    return () => {
      document.body.style.overflowX = '';
    };
  }, [isFullscreen]);

  return (
    <Box
      ref={rootRef}
      sx={{ height: '100%', position: 'relative', width: '100%' }}>
      <Canvas
        shadows
        dpr={dpr}
        gl={{ preserveDrawingBuffer: true }}
        camera={{ fov: 45, position: [3, 3, 3] }}
        style={{ height: '100%', width: '100%' }}>
        <SceneBootstrap />
        <CameraRig />
      </Canvas>

      <CanvasActionsOverlay
        isFullscreen={isFullscreen}
        onDownload={handleDownload}
        onShare={handleShare}
        onToggleFullscreen={handleToggleFullscreen}
      />
      {showCanvasLoader && (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.24)',
            display: 'flex',
            inset: 0,
            justifyContent: 'center',
            pointerEvents: 'none',
            position: 'absolute',
            zIndex: 25,
          }}>
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: '0 8px 22px rgba(0,0,0,0.10)',
              display: 'flex',
              height: 96,
              justifyContent: 'center',
              width: 96,
            }}>
            <CircularProgress
              size={34}
              thickness={6}
              sx={{
                color: '#111',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
          </Box>
        </Box>
      )}
      <OverlayDots
        isActive={isFinishOverlayOpen}
        onClick={() => setIsFinishOverlayOpen((prev) => !prev)}
      />
      <FinishOverlay
        open={isFinishOverlayOpen}
        onClose={() => setIsFinishOverlayOpen(false)}
      />
      <CameraViewOverlay />
    </Box>
  );
});
