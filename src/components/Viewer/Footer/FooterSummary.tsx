import { Box, Divider, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useMainContext } from '../../../hooks/useMainContext';

export const FooterSummary = observer(() => {
  const { dataStore, designManager } = useMainContext();
  const selectedChair = designManager.selectedChairId
    ? dataStore.getChair(designManager.selectedChairId)
    : null;
  const selectedChairColor = selectedChair?.colors.find(
    (c) => c.id === designManager.selectedChairColor,
  );

  const Item = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ minWidth: 140 }}>
      <Typography variant="caption" sx={{ color: '#777', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        display: { md: 'flex', xs: 'none' },
        bottom: 0,
        gap: 4,
        overflowX: 'auto',
        overflowY: 'hidden',

        position: 'sticky',
        px: 4,
        py: 2,
        zIndex: 900,
      }}>
      <Item label="Your Build" value="Dining Table" />

      <Divider orientation="vertical" flexItem />

      <Item label="Table Top" value={designManager.selectedTopColor ?? '—'} />

      <Item label="Table Base" value={designManager.selectedBaseId ?? '—'} />

      <Item
        label="Base Colour"
        value={designManager.selectedBaseColor ?? '—'}
      />

      <Item
        label="Dimensions (mm)"
        value={
          designManager.length
            ? `${designManager.length} × ${designManager.width}`
            : '—'
        }
      />

      <Item
        label="Table Top Shape"
        value={designManager.selectedTopShape ?? '—'}
      />

      <Item label="Chair Style" value={selectedChair?.name ?? 'N/A'} />
      <Item label="Chair Color" value={selectedChairColor?.name ?? 'N/A'} />
    </Box>
  );
});
