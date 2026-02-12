import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { MouseEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavigationRoutes } from '../../../constant';
import topColors from '../../../data/topColors.json';
import { useMainContext } from '../../../hooks/useMainContext';
import { FinishType } from '../../../state/TableDesignManager';
import {
  CHECKOUT_MODE_KEY,
  CHECKOUT_MODE_SAMPLES,
  CHECKOUT_PREVIEW_KEY,
  CHECKOUT_SAMPLES_KEY,
} from '../../../utils/pricing';

type OrderSamplesModalProps = {
  open: boolean;
  onClose: () => void;
};

type HoverPreviewState = {
  finishId: string;
  left: number;
  top: number;
  width: number;
};

const GROUPS: Array<{ id: FinishType; label: string }> = [
  { id: 'natural', label: 'Natural' },
  { id: 'polish', label: 'Polish' },
  { id: 'silk', label: 'Silk' },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const OrderSamplesModal = ({
  open,
  onClose,
}: OrderSamplesModalProps) => {
  const { dataStore } = useMainContext();
  const navigate = useNavigate();
  const finishes = dataStore.getAllFinishes();

  const [selectedFinishIds, setSelectedFinishIds] = useState<string[]>([]);
  const [hoverPreview, setHoverPreview] = useState<HoverPreviewState | null>(
    null,
  );

  const descriptions = useMemo(() => {
    return new Map(topColors.map((item) => [item.id, item.description]));
  }, []);

  const finishesByType = useMemo(() => {
    return finishes.reduce<Record<FinishType, typeof finishes>>(
      (acc, finish) => {
        acc[finish.finishType].push(finish);
        return acc;
      },
      { natural: [], polish: [], silk: [] },
    );
  }, [finishes]);

  const hoveredFinish = hoverPreview
    ? (finishes.find((finish) => finish.id === hoverPreview.finishId) ?? null)
    : null;
  const hoveredDescription = hoveredFinish
    ? (descriptions.get(hoveredFinish.id) ?? 'Sample texture preview.')
    : '';

  const selectedCount = selectedFinishIds.length;
  const canBuyNow = selectedCount > 0;

  const toggleSelection = (finishId: string) => {
    setSelectedFinishIds((current) =>
      current.includes(finishId)
        ? current.filter((id) => id !== finishId)
        : [...current, finishId],
    );
  };

  const setHoverPosition = (
    event: MouseEvent<HTMLElement>,
    finishId: string,
  ) => {
    if (typeof window === 'undefined') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 14;
    const safeMargin = 12;
    const previewWidth = clamp(Math.floor(viewportWidth * 0.24), 280, 420);
    const previewMaxHeight = viewportHeight - safeMargin * 2;

    let left = rect.right + gap;
    if (left + previewWidth > viewportWidth - safeMargin) {
      left = rect.left - gap - previewWidth;
    }
    left = clamp(left, safeMargin, viewportWidth - previewWidth - safeMargin);

    const top = clamp(
      rect.top - 8,
      safeMargin,
      viewportHeight - Math.min(740, previewMaxHeight) - safeMargin,
    );

    setHoverPreview({
      finishId,
      left,
      top,
      width: previewWidth,
    });
  };

  const handleClose = () => {
    setHoverPreview(null);
    onClose();
  };

  const handleBuyNow = () => {
    if (!canBuyNow) return;

    sessionStorage.setItem(CHECKOUT_MODE_KEY, CHECKOUT_MODE_SAMPLES);
    sessionStorage.setItem(CHECKOUT_SAMPLES_KEY, JSON.stringify(selectedFinishIds));
    sessionStorage.removeItem(CHECKOUT_PREVIEW_KEY);

    handleClose();
    navigate(NavigationRoutes.Login);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 1.5,
          overflow: 'hidden',
          width: 'min(1020px, calc(100vw - 40px))',
        },
      }}>
      <DialogTitle
        sx={{
          alignItems: 'center',
          backgroundColor: '#000',
          color: '#fff',
          display: 'flex',
          fontSize: 34,
          fontWeight: 700,
          justifyContent: 'space-between',
          lineHeight: 1.2,
          px: 2.2,
          py: 1.35,
        }}>
        Order Samples
        <IconButton
          onClick={handleClose}
          aria-label="Close order samples"
          sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ overflow: 'hidden', p: 0, position: 'relative' }}>
        <Box
          onScroll={() => setHoverPreview(null)}
          sx={{
            maxHeight: '68vh',
            overflowY: 'auto',
            px: 2.2,
            py: 2,
          }}>
          <Box
            sx={{
              backgroundColor: '#f2f2f2',
              borderRadius: 1.5,
              mb: 3,
              p: 2.2,
            }}>
            <Typography
              sx={{ color: '#4b4b4b', fontSize: 20, fontWeight: 700 }}>
              Sample Pricing
            </Typography>
            <Box component="ul" sx={{ color: '#3f3f3f', m: 0, pl: 2.8 }}>
              <li>A pair of samples costs &pound;20.</li>
              <li>Ordering just one sample is also &pound;20.</li>
              <li>
                For more than two samples, it costs &pound;20 for every
                additional pair. A single extra sample also counts as a full
                pair.
              </li>
              <li>Please select your samples below:</li>
            </Box>
          </Box>

          {GROUPS.map((group) => {
            const items = finishesByType[group.id];
            if (!items.length) return null;

            return (
              <Box key={group.id} sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    mb: 1.8,
                  }}>
                  {group.label}
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.4,
                    gridTemplateColumns: {
                      lg: 'repeat(6, minmax(0, 1fr))',
                      md: 'repeat(5, minmax(0, 1fr))',
                      sm: 'repeat(4, minmax(0, 1fr))',
                      xs: 'repeat(2, minmax(0, 1fr))',
                    },
                  }}>
                  {items.map((finish) => {
                    const isSelected = selectedFinishIds.includes(finish.id);

                    return (
                      <Box
                        key={finish.id}
                        onClick={() => toggleSelection(finish.id)}
                        onMouseEnter={(event) =>
                          setHoverPosition(event, finish.id)
                        }
                        onMouseLeave={() => setHoverPreview(null)}
                        sx={{
                          border: isSelected
                            ? '2px solid #111'
                            : '1px solid #ddd',
                          borderRadius: 2,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          position: 'relative',
                        }}>
                        {isSelected && (
                          <CheckCircleIcon
                            sx={{
                              color: '#fff',
                              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.35))',
                              fontSize: 30,
                              position: 'absolute',
                              right: 8,
                              top: 8,
                              zIndex: 1,
                            }}
                          />
                        )}
                        <Box
                          component="img"
                          src={finish.preview}
                          alt={finish.label}
                          sx={{
                            '&:hover': {
                              transform: 'scale(1.06)',
                            },
                            display: 'block',
                            height: 146,
                            objectFit: 'cover',
                            transition: 'transform 0.22s ease',
                            width: '100%',
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        {hoveredFinish && hoverPreview && (
          <Box
            sx={{
              bgcolor: '#fff',
              border: '12px solid #fff',
              borderRadius: 2,
              boxShadow: '0 12px 30px rgba(0,0,0,0.28)',
              display: { md: 'block', xs: 'none' },
              left: hoverPreview.left,
              maxHeight: 'calc(100vh - 24px)',
              pointerEvents: 'none',
              position: 'fixed',
              top: hoverPreview.top,
              width: hoverPreview.width,
              zIndex: 1600,
            }}>
            <Box
              component="img"
              src={hoveredFinish.samplePreview}
              alt={hoveredFinish.label}
              sx={{
                borderRadius: 1,
                display: 'block',
                height: 'min(68vh, 620px)',
                objectFit: 'cover',
                width: '100%',
              }}
            />
            <Typography sx={{ fontSize: 24, fontWeight: 700, mt: 1.3 }}>
              {hoveredFinish.label}
            </Typography>
            <Typography
              sx={{
                color: '#575757',
                fontSize: 15,
                lineHeight: 1.35,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
              {hoveredDescription}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            alignItems: 'center',
            borderTop: '1px solid #c9c9c9',
            display: 'flex',
            justifyContent: 'space-between',
            px: 2.2,
            py: 1.7,
          }}>
          <Typography sx={{ color: '#555', fontSize: 14, fontWeight: 500 }}>
            {selectedCount} sample{selectedCount === 1 ? '' : 's'} selected
          </Typography>
          <Button
            disabled={!canBuyNow}
            onClick={handleBuyNow}
            sx={{
              '&.Mui-disabled': {
                backgroundColor: '#efefef',
                color: '#9e9e9e',
              },
              backgroundColor: '#000',
              borderRadius: 999,
              color: '#fff',
              fontSize: 20,
              fontWeight: 500,
              px: 3.2,
              py: 1,
              textTransform: 'none',
            }}>
            Buy Now {'->'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
