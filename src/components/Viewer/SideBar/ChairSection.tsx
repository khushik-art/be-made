import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';

import { useMainContext } from '../../../hooks/useMainContext';
import type { ChairId } from '../../../state/TableDesignManager';
import {
  getChairGuidePdfPage,
  getChairRecommendation,
} from '../../../utils/chairRecommendations';
import { ChairQuantityControl } from './ChairQuantityControls';

export const ChairSection = observer(() => {
  const { designManager, dataStore } = useMainContext();

  const chairs = dataStore.getAllChairs();
  const selectedChair = designManager.selectedChairId
    ? dataStore.getChair(designManager.selectedChairId)
    : null;
  const recommendation = getChairRecommendation(
    designManager.selectedTopShape,
    designManager.length,
  );
  const compactCount = recommendation.tight ?? '-';
  const comfortableCount = recommendation.comfort ?? '-';
  const maxAllowed = recommendation.maxAllowed;
  const isQuantityDisabled = !designManager.selectedChairId || maxAllowed === 0;
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const guidePage = getChairGuidePdfPage(designManager.selectedTopShape);
  const guideSrc = useMemo(
    () => `/assets/images/chair_size_chart.pdf#page=${guidePage}&view=FitH`,
    [guidePage],
  );

  useEffect(() => {
    if (designManager.chairQuantity > maxAllowed) {
      designManager.setChairQuantity(maxAllowed);
    }
  }, [designManager, designManager.chairQuantity, maxAllowed]);

  const openChairGuide = () => setIsGuideOpen(true);
  const closeChairGuide = () => setIsGuideOpen(false);

  return (
    <Box>
      {/* Title */}
      <Typography variant="h5" fontWeight={700} mb={3}>
        Wear It With
      </Typography>
      <Typography variant="body1" fontWeight={600} mb={0.5}>
        Compact Seating: {compactCount}
      </Typography>
      <Typography variant="body1" fontWeight={500} mb={2.5}>
        Comfortable Seating: {comfortableCount}
      </Typography>

      {/* Chair cards */}
      <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
        {chairs.map((chair) => {
          const selected = designManager.selectedChairId === chair.id;

          return (
            <Box
              key={chair.id}
              onClick={() => designManager.setChairs(chair.id as ChairId)}
              sx={{
                '&:hover': {
                  boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                },
                '&:hover .preview-img': {
                  transform: 'scale(1.08)',
                },
                backgroundColor: '#f2f2f2',
                border: selected ? '2px solid #111' : '1px solid #eee',
                borderRadius: 2,
                cursor: 'pointer',
                p: 1.5,
                position: 'relative',
                transition: 'all 0.2s',
              }}>
              {selected && (
                <CheckCircleIcon
                  sx={{
                    background: '#f2f2f2',
                    borderRadius: '50%',
                    color: '#111',
                    fontSize: 20,
                    position: 'absolute',
                    right: 6,
                    top: 6,
                  }}
                />
              )}

              <img
                className="preview-img"
                src={chair.colors[0]?.thumbnailUrl}
                alt={chair.name}
                style={{
                  marginBottom: 8,
                  objectFit: 'contain',
                  transform: 'scale(1)',
                  transition: 'transform 0.25s ease',
                  width: '100%',
                }}
              />

              <Typography
                variant="subtitle2"
                fontWeight={600}
                textAlign="center">
                {chair.name}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Chair colors */}
      {selectedChair && (
        <Box mt={4}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Select Chair Color
          </Typography>

          <Box display="flex" gap={1.5}>
            {selectedChair.colors.map((color) => {
              const selected = designManager.selectedChairColor === color.id;

              return (
                <Box
                  key={color.id}
                  onClick={() => designManager.setChairColor(color.id)}
                  sx={{
                    '&:hover': {
                      transform: 'scale(1.08)',
                    },
                    backgroundImage: `url(${color.previewUrl})`,
                    backgroundSize: 'cover',
                    border: selected ? '2px solid #111' : '1px solid #ddd',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    height: 36,
                    transition: 'transform 0.2s ease',
                    width: 36,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Quantity */}
      <Box mt={4}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Select Chair Quantity
          </Typography>
          <IconButton
            onClick={openChairGuide}
            size="small"
            sx={{ p: 0.2 }}
            aria-label="Open chair size guide">
            <InfoOutlinedIcon fontSize="small" color="action" />
          </IconButton>
        </Box>

        <ChairQuantityControl
          value={designManager.chairQuantity}
          onChange={(v) => designManager.setChairQuantity(v)}
          max={maxAllowed}
          isDisabled={isQuantityDisabled}
        />
      </Box>

      <Dialog
        open={isGuideOpen}
        onClose={closeChairGuide}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1.5,
            overflow: 'hidden',
          },
        }}>
        <DialogTitle
          sx={{
            alignItems: 'center',
            backgroundColor: '#000',
            color: '#fff',
            display: 'flex',
            fontWeight: 700,
            justifyContent: 'space-between',
            py: 1.4,
          }}>
          Table Size & Seating Chart Info
          <IconButton onClick={closeChairGuide} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              height: '110vh',
              overflow: 'hidden',
              position: 'relative',
              width: '100%',
            }}>
            <iframe
              title="Chair size chart"
              src={`${guideSrc}&toolbar=0&navpanes=0&scrollbar=0`}
              style={{
                border: 'none',
                display: 'block',
                height: '100%',
                width: '100%',
              }}
            />
            <Box
              sx={{
                inset: 0,
                position: 'absolute',
                zIndex: 1,
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
});
