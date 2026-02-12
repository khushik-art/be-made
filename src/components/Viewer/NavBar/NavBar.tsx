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
          height: 72,
          px: 5,
        }}>
        <Box
          sx={{
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            mr: 6,
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
            display: 'flex',
            flexGrow: 1,
            gap: 4,
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
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.08em',
                  minWidth: 'unset',
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
