import { Box, Button, Divider, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import { NavigationRoutes } from '../../../constant';
import { useMainContext } from '../../../hooks/useMainContext';
import {
  CHECKOUT_MODE_BUILD,
  CHECKOUT_MODE_KEY,
  CHECKOUT_PREVIEW_KEY,
  CHECKOUT_SAMPLES_KEY,
  formatGBP,
  getPricingBreakdown,
} from '../../../utils/pricing';

export const SummarySection = observer(() => {
  const { dataStore, design3DManager, designManager } = useMainContext();
  const navigate = useNavigate();

  const selectedFinish = dataStore.getFinish(designManager.selectedTopColor);
  const selectedBase = dataStore.getBase(designManager.selectedBaseId);
  const selectedBaseColor =
    selectedBase.colors.find((c) => c.id === designManager.selectedBaseColor)
      ?.label ?? designManager.selectedBaseColor;
  const selectedShape =
    dataStore
      .getAllTopShapes()
      .find((shape) => shape.id === designManager.selectedTopShape)?.label ??
    designManager.selectedTopShape;
  const selectedChair = designManager.selectedChairId
    ? dataStore.getChair(designManager.selectedChairId)
    : null;
  const selectedChairColor = selectedChair?.colors.find(
    (color) => color.id === designManager.selectedChairColor,
  );

  const dimensionsLabel =
    designManager.dimensionConstraints.mode === 'diameter'
      ? `${designManager.length} mm`
      : `${designManager.length} x ${designManager.width} mm`;

  const { chairPrice, tablePrice, totalPrice } = getPricingBreakdown(
    designManager.selectedTopShape,
    designManager.length,
    designManager.chairQuantity,
  );

  const handlePlaceOrder = async () => {
    const hasSelectedChairs = Boolean(
      designManager.selectedChairId &&
        designManager.selectedChairColor &&
        designManager.chairQuantity > 0,
    );
    const captureView = hasSelectedChairs ? 'chair-view' : 'right';

    await design3DManager.setCameraView(captureView, {
      duration: 0.01,
      instant: true,
    });

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const canvas =
      (document.querySelector(
        '#configurator-scroll-container canvas',
      ) as HTMLCanvasElement | null) ??
      (document.querySelector('canvas') as HTMLCanvasElement | null);

    if (canvas) {
      try {
        sessionStorage.setItem(CHECKOUT_PREVIEW_KEY, canvas.toDataURL('image/png'));
      } catch {
        sessionStorage.removeItem(CHECKOUT_PREVIEW_KEY);
      }
    }

    sessionStorage.setItem(CHECKOUT_MODE_KEY, CHECKOUT_MODE_BUILD);
    sessionStorage.removeItem(CHECKOUT_SAMPLES_KEY);
    navigate(NavigationRoutes.Login);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mt={2} mb={0.5}>
        BeMade
      </Typography>
      <Typography variant="caption" color="text.secondary">
        YOUR DESIGN | OUR PERFECTION
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        YOUR BUILD
      </Typography>

      <SummaryRow label="Table Top" value={selectedFinish.label} />
      <SummaryRow label="Base" value={selectedBase.label} />
      <SummaryRow label="Base Colour" value={selectedBaseColor} />
      <SummaryRow label="Dimensions" value={dimensionsLabel} />
      <SummaryRow label="Table Top Shape" value={selectedShape} />
      <SummaryRow label="Chair Type" value={selectedChair?.name ?? 'N/A'} />
      <SummaryRow label="Chair Colour" value={selectedChairColor?.name ?? 'N/A'} />
      <SummaryRow
        label="Chair Quantity"
        value={designManager.chairQuantity.toString()}
      />

      <Box
        mt={3}
        p={2}
        sx={{
          backgroundColor: '#f7f7f7',
          borderRadius: 2,
        }}>
        <SummaryRow label="Dining Table" value={formatGBP(tablePrice)} bold />
        <SummaryRow label="Chairs" value={formatGBP(chairPrice)} bold />
        <Divider sx={{ my: 1 }} />
        <SummaryRow label="Total" value={formatGBP(totalPrice)} bold />
      </Box>

      <Box
        mt={3}
        p={2.5}
        sx={{
          backgroundColor: '#eef2f7',
          borderRadius: 3,
        }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Estimated Delivery:
        </Typography>

        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
          Our products are all unique, made to order and this takes some time in
          our factory.
          <br />
          <br />
          Once your order has been made, we will notify and arrange delivery
          with you.
          <br />
          Currently the estimated delivery times are within <b>14-21 days</b>.
        </Typography>
      </Box>

      <Button
        onClick={handlePlaceOrder}
        fullWidth
        sx={{
          '&:hover': {
            backgroundColor: '#000',
          },
          backgroundColor: '#000',
          borderRadius: 999,
          color: '#fff',
          fontSize: 15,
          fontWeight: 500,
          mt: 3,
          py: 1.15,
          textTransform: 'uppercase',
        }}>
        Place Order
      </Button>
    </Box>
  );
});

type RowProps = {
  label: string;
  value: string;
  bold?: boolean;
};

const SummaryRow = ({ label, value, bold }: RowProps) => (
  <>
    <Box display="flex" justifyContent="space-between" py={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={bold ? 700 : 500}
        textTransform="capitalize">
        {value}
      </Typography>
    </Box>
    {!bold && <Divider />}
  </>
);
