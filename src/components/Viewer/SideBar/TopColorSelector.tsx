import { Box, Chip, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useMainContext } from '../../../hooks/useMainContext';
import { FinishType } from '../../../state/TableDesignManager';
import { Finish } from '../../../types/finish';

export const TopColorSelector = observer(() => {
  const { designManager, dataStore } = useMainContext();

  type FinishesByType = Record<FinishType, Finish[]>;
  const finishes: Finish[] = dataStore.getAllFinishes();

  const finishesByType = finishes.reduce<FinishesByType>(
    (acc, finish) => {
      acc[finish.finishType].push(finish);
      return acc;
    },
    {
      natural: [] as Finish[],
      polish: [] as Finish[],
      silk: [] as Finish[],
    },
  );

  const renderGrid = (items: typeof finishes) => (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: 'repeat(3, 1fr)',
        mb: 3,
      }}>
      {items.map((finish) => {
        const isSelected = finish.id === designManager.selectedTopColor;

        return (
          <Box
            key={finish.id}
            onClick={() => designManager.setTopColor(finish.id)}
            sx={{
              cursor: 'pointer',
              textAlign: 'center',
            }}>
            <Box
              sx={{
                border: isSelected ? '2px solid black' : '1px solid #ddd',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease',
                '&:hover': {
                  boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                },
                '&:hover .preview-img': {
                  transform: 'scale(1.08)',
                },
              }}>
              <img
                className="preview-img"
                src={finish.preview}
                alt={finish.label}
                style={{
                  display: 'block',
                  height: 96,
                  objectFit: 'cover',
                  transform: 'scale(1)',
                  transition: 'transform 0.25s ease',
                  width: '100%',
                }}
              />
            </Box>

            <Typography variant="body2" sx={{ mt: 1 }}>
              {finish.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Choose Table Top
      </Typography>

      {/* NATURAL */}
      {finishesByType.natural.length > 0 && (
        <>
          <Chip
            label="Natural"
            size="small"
            sx={{ mb: 2, textTransform: 'capitalize' }}
          />
          {renderGrid(finishesByType.natural)}
        </>
      )}

      {/* POLISH */}
      {finishesByType.polish.length > 0 && (
        <>
          <Chip
            label="Polish"
            size="small"
            sx={{ mb: 2, textTransform: 'capitalize' }}
          />
          {renderGrid(finishesByType.polish)}
        </>
      )}

      {/* SILK */}
      {finishesByType.silk.length > 0 && (
        <>
          <Chip
            label="Silk"
            size="small"
            sx={{ mb: 2, textTransform: 'capitalize' }}
          />
          {renderGrid(finishesByType.silk)}
        </>
      )}
    </Box>
  );
});
