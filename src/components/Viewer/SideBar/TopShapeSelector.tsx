import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useMainContext } from '../../../hooks/useMainContext';

export const TopShapeSelector = observer(() => {
  const { designManager, dataStore } = useMainContext();

  const allShapes = dataStore.getAllTopShapes();

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Choose Table Top Shape
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
        {allShapes.map((shape) => {
          const isSupported = designManager.isTopShapeSupported(shape.id);
          const isSelected = designManager.selectedTopShape === shape.id;

          return (
            <Box
              key={shape.id}
              onClick={() => isSupported && designManager.setTopShape(shape.id)}
              sx={{
                cursor: isSupported ? 'pointer' : 'not-allowed',
                opacity: isSupported ? 1 : 0.3,
                pointerEvents: isSupported ? 'auto' : 'none',
                textAlign: 'center',
              }}>
              <Box
                sx={{
                  backgroundColor: '#f2f2f2',
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
                  src={shape.preview}
                  alt={shape.label}
                  style={{
                    height: 96,
                    objectFit: 'contain',
                    transform: 'scale(1)',
                    transition: 'transform 0.25s ease',
                    width: '100%',
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {shape.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});
