import { Box, Divider, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useMainContext } from '../../../hooks/useMainContext';

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ minWidth: 120 }}>
    <Typography variant="caption" sx={{ color: '#8b8b8b', display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
      {value}
    </Typography>
  </Box>
);

export const FooterSummary = observer(() => {
  const { dataStore, designManager } = useMainContext();
  const selectedChair = designManager.selectedChairId
    ? dataStore.getChair(designManager.selectedChairId)
    : null;
  const selectedChairColor = selectedChair?.colors.find(
    (c) => c.id === designManager.selectedChairColor,
  );

  const values = [
    { label: 'Table Top', value: designManager.selectedTopColor ?? 'N/A' },
    { label: 'Table Base', value: designManager.selectedBaseId ?? 'N/A' },
    { label: 'Base Colour', value: designManager.selectedBaseColor ?? 'N/A' },
    {
      label: 'Dimensions',
      value: designManager.length
        ? `${designManager.length} x ${designManager.width}`
        : 'N/A',
    },
    { label: 'Chair Style', value: selectedChair?.name ?? 'N/A' },
    { label: 'Chair Color', value: selectedChairColor?.name ?? 'N/A' },
  ];

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        bottom: 0,
        display: { md: 'flex', xs: 'none' },
        gap: 4,
        overflowX: 'auto',
        overflowY: 'hidden',
        position: 'sticky',
        px: 4,
        py: 2,
        zIndex: 900,
      }}>
      <SummaryItem label="Your Build" value="Dining Table" />

      <Divider orientation="vertical" flexItem />

      {values.map((item) => (
        <SummaryItem key={item.label} label={item.label} value={item.value} />
      ))}
    </Box>
  );
});
