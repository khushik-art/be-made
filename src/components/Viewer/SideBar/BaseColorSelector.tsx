import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useMainContext } from '../../../hooks/useMainContext';

export const BaseColorSelector = observer(() => {
  const { designManager, dataStore } = useMainContext();

  const base = dataStore.getBase(designManager.selectedBaseId);
  const colors = base.colors ?? [];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Choose Base Colour
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}>
        {colors.map((color) => {
          const isSelected = color.id === designManager.selectedBaseColor;

          return (
            <Box key={color.id}>
              {/* Swatch */}
              <Box
                onClick={() => designManager.setBaseColor(color.id)}
                sx={{
                  border: isSelected ? '2px solid #000' : '1px solid #ddd',
                  borderRadius: 3,
                  cursor: 'pointer',
                  height: 96,
                  overflow: 'hidden',
                  position: 'relative',
                  width: 96,
                }}>
                <img
                  src={color.preview}
                  alt={color.label}
                  style={{
                    height: '100%',
                    objectFit: 'cover',
                    width: '100%',
                  }}
                />
              </Box>

              {/* Label */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? 600 : 400,
                  mt: 1,
                  textAlign: 'center',
                }}>
                {color.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});
