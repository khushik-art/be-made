import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useMainContext } from '../../../hooks/useMainContext';
import type { BaseId } from '../../../state/TableDesignManager';

type Base = {
  id: BaseId;
  label: string;
  thumbnail: string;
};

export const BaseSelector = observer(() => {
  const { designManager, dataStore } = useMainContext();

  const bases = dataStore.getAllBases() as Base[];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Choose Base
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(2, 1fr)',
        }}>
        {bases.map((base) => {
          const isSelected = base.id === designManager.selectedBaseId;

          return (
            <Box
              key={base.id}
              onClick={() => designManager.setBase(base.id)}
              sx={{
                '&:hover': {
                  boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                  transform: 'scale(1.05)',
                },
                '&:hover .preview-img': {
                  transform: 'scale(1.15)',
                },
                backgroundColor: '#f2f2f2',
                border: isSelected ? '2px solid black' : '1px solid #ddd',
                borderRadius: 2,
                cursor: 'pointer',
                overflow: 'hidden',
                p: 1,
                textAlign: 'center',
                transition: 'box-shadow 0.2s ease',
              }}>
              <img
                className="preview-img"
                src={base.thumbnail}
                alt={base.label}
                style={{
                  height: 80,
                  objectFit: 'contain',
                  transform: 'scale(1)',
                  transition: 'transform 0.25s ease',
                  width: '100%',
                }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {base.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});
