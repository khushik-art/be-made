import CloseIcon from '@mui/icons-material/Close';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import topColors from '../../../data/topColors.json';
import { useMainContext } from '../../../hooks/useMainContext';

type FinishOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const toTitleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export const FinishOverlay = observer(
  ({ open, onClose }: FinishOverlayProps) => {
    const { dataStore, designManager } = useMainContext();
    const finish = dataStore.getFinish(designManager.selectedTopColor);

    const descriptions = useMemo(() => {
      return new Map(topColors.map((item) => [item.id, item.description]));
    }, []);

    if (!open || !finish) return null;

    const description =
      descriptions.get(finish.id) ??
      'A premium finish for contemporary spaces.';

    return (
      <Box
        sx={{
          backgroundColor: '#f2f3f4',
          borderRadius: 2.2,
          boxShadow: '0 10px 24px rgba(0,0,0,0.14)',
          left: { md: 22, xs: 12 },
          maxWidth: {
            md: 'min(520px, calc(100% - 44px))',
            xs: 'min(340px, calc(100% - 88px))',
          },
          maxHeight: { xs: '40%', md: 'none' },
          overflow: { xs: 'auto', md: 'visible' },
          p: { md: 2.2, xs: 1.2 },
          pointerEvents: 'auto',
          position: 'absolute',
          bottom: { md: 80, xs: 54 },
          zIndex: 21,
        }}>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close finish information"
          sx={{
            color: '#59606a',
            position: 'absolute',
            right: { md: 12, xs: 8 },
            top: { md: 12, xs: 6 },
          }}>
          <CloseIcon />
        </IconButton>

        <Typography
          sx={{
            color: '#1f2328',
            fontSize: { md: 20, xs: 14 },
            fontWeight: 600,
            lineHeight: 1.1,
            mb: 0.5,
            pr: 4,
          }}>
          {finish.label}
        </Typography>

        <Chip
          label={toTitleCase(finish.finishType)}
          size="small"
          sx={{
            backgroundColor: '#e3e4e5',
            color: '#5a5f64',
            fontSize: { md: 15, xs: 11 },
            fontWeight: 300,
            mb: 0.6,
          }}
        />

        <Typography
          sx={{
            color: '#61666d',
            fontSize: { md: 14, xs: 11 },
            lineHeight: 1.35,
            maxWidth: { md: 440, xs: '100%' },
          }}>
          {description}
        </Typography>
      </Box>
    );
  },
);
