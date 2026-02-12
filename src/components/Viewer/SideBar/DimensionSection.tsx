import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useMainContext } from '../../../hooks/useMainContext';
import { DimensionControl } from './DimensionControl';

export const DimensionSection = observer(() => {
  const { designManager } = useMainContext();
  const c = designManager.dimensionConstraints;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mt={4} mb={2}>
        Dimensions
      </Typography>

      <Box
        mb={4}
        p={2}
        sx={{
          border: '1px solid #eee',
          borderRadius: 2,
          backgroundColor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
        <Typography variant="body2" color="text.secondary">
          All table heights are fixed between <b>730mm</b> to <b>750mm</b>
        </Typography>
      </Box>

      {/* Rectangular / Capsule / Oval */}
      {c.mode === 'rect' && (
        <>
          <DimensionControl
            label="Top Length"
            value={designManager.length}
            min={c.minLength}
            max={c.maxLength}
            onChange={(v) => designManager.setLength(v)}
          />

          <DimensionControl
            label="Top Width"
            value={designManager.width}
            min={c.minWidth}
            max={c.maxWidth}
            onChange={(v) => designManager.setWidth(v)}
          />
        </>
      )}

      {/* Round / Square */}
      {c.mode === 'diameter' && (
        <DimensionControl
          label="Diameter"
          value={designManager.length}
          min={c.min}
          max={c.max}
          onChange={(v) => designManager.setLength(v)}
        />
      )}
    </Box>
  );
});
