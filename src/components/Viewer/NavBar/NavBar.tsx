import { Box, Button } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { NAV_STEPS, STEP_SECTION_IDS } from '../../../data/NavBar.steps';
import { useMainContext } from '../../../hooks/useMainContext';
import { scrollToSection } from '../../../utils/scrollToSection';
import { OrderSamplesModal } from './OrderSamplesModal';

export const NavBar = observer(() => {
  const { designManager } = useMainContext();
  const [isOrderSamplesOpen, setIsOrderSamplesOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          alignItems: 'center',
          borderBottom: '1px solid #e6e6e6',
          display: 'flex',
          flexWrap: 'wrap',
          minHeight: { md: 72, xs: 86 },
          px: { md: 5, xs: 2 },
          py: { md: 0, xs: 0.8 },
        }}>
        <Box
          sx={{
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            mr: { md: 6, xs: 1 },
            minWidth: 0,
          }}>
          <img
            src="/assets/images/header_logo.svg"
            alt="Bemade"
            style={{
              display: 'block',
              height: 28,
            }}
          />
        </Box>

        <Box
          sx={{
            width: { xs: '100%', md: 'auto' },
            display: 'flex',
            flexGrow: 1,
            gap: { md: 4, xs: 2.2 },
            overflowX: { xs: 'auto', md: 'visible' },
            pb: { xs: 0.6, md: 0 },
            pt: { xs: 0.6, md: 0 },
            order: { xs: 3, md: 2 },
            borderTop: { xs: '1px solid #ececec', md: 'none' },
          }}>
          {NAV_STEPS.map(({ label, step }) => {
            const isActive = designManager.isStepActive(step);

            return (
              <Button
                key={step}
                disableRipple
                onClick={() => {
                  const sectionId = STEP_SECTION_IDS[step];
                  scrollToSection(sectionId);
                  designManager.setStep(step);
                }}
                sx={{
                  '&::after': {
                    backgroundColor: isActive ? '#111' : 'transparent',
                    bottom: -18,
                    content: '""',
                    height: 2,
                    left: 0,
                    position: 'absolute',
                    right: 0,
                  },
                  '&:hover': {
                    background: 'transparent',
                    color: '#111',
                  },
                  background: 'transparent',
                  borderRadius: 0,
                  color: isActive ? '#111' : '#777',
                  fontSize: { md: 13, xs: 12 },
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.08em',
                  minWidth: 'unset',
                  whiteSpace: 'nowrap',
                  p: 0,
                  position: 'relative',
                  textTransform: 'uppercase',
                }}>
                {label}
              </Button>
            );
          })}
        </Box>

        <Button
          onClick={() => setIsOrderSamplesOpen(true)}
          sx={{
            '&:hover': {
              backgroundColor: '#000',
            },
            backgroundColor: '#000',
            borderRadius: 999,
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            ml: 'auto',
            order: { xs: 2, md: 3 },
            px: 3,
            py: 1,
            textTransform: 'none',
          }}>
          Order Sample
        </Button>
      </Box>

      <OrderSamplesModal
        open={isOrderSamplesOpen}
        onClose={() => setIsOrderSamplesOpen(false)}
      />
    </>
  );
});
