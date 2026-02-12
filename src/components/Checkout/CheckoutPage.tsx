import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavigationRoutes } from '../../constant';
import { useMainContext } from '../../hooks/useMainContext';
import {
  CHECKOUT_MODE_BUILD,
  CHECKOUT_MODE_KEY,
  CHECKOUT_MODE_SAMPLES,
  CHECKOUT_PREVIEW_KEY,
  CHECKOUT_SAMPLES_KEY,
  formatGBP,
  getPricingBreakdown,
  getSamplePricingBreakdown,
} from '../../utils/pricing';

const CHECKOUT_FIELDS = [
  { key: 'fullName', label: 'Full Name *', placeholder: 'Enter full name' },
  {
    key: 'addressLine1',
    label: 'Address Line 1 *',
    placeholder: 'Enter address line 1',
  },
  {
    key: 'addressLine2',
    label: 'Address Line 2',
    placeholder: 'Enter address line 2 (optional)',
  },
  { key: 'city', label: 'City *', placeholder: 'Enter city' },
  { key: 'postcode', label: 'Postcode *', placeholder: 'Enter postcode' },
  { key: 'county', label: 'County', placeholder: 'Enter county' },
  {
    key: 'phoneNumber',
    label: 'Phone Number *',
    placeholder: 'Enter phone number',
  },
  {
    key: 'emailAddress',
    label: 'Email Address *',
    placeholder: 'Enter email address',
  },
] as const;

export const CheckoutPage = observer(() => {
  const navigate = useNavigate();
  const { dataStore, designManager } = useMainContext();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<string>(CHECKOUT_MODE_BUILD);
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);

  useEffect(() => {
    setPreviewImage(sessionStorage.getItem(CHECKOUT_PREVIEW_KEY));
    setCheckoutMode(
      sessionStorage.getItem(CHECKOUT_MODE_KEY) ?? CHECKOUT_MODE_BUILD,
    );
    try {
      const rawSamples = sessionStorage.getItem(CHECKOUT_SAMPLES_KEY);
      const parsed = rawSamples ? (JSON.parse(rawSamples) as string[]) : [];
      setSelectedSampleIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSelectedSampleIds([]);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverflowX = body.style.overflowX;
    const prevRootOverflow = root?.style.overflow ?? '';
    const prevRootHeight = root?.style.height ?? '';

    html.style.overflow = 'auto';
    body.style.overflow = 'auto';
    body.style.overflowX = 'hidden';
    if (root) {
      root.style.overflow = 'visible';
      root.style.height = 'auto';
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overflowX = prevBodyOverflowX;
      if (root) {
        root.style.overflow = prevRootOverflow;
        root.style.height = prevRootHeight;
      }
    };
  }, []);

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
      : `Length: ${designManager.length} mm x Width: ${designManager.width} mm`;

  const { chairPrice, tablePrice, totalPrice } = getPricingBreakdown(
    designManager.selectedTopShape,
    designManager.length,
    designManager.chairQuantity,
  );

  const selectedSamples = dataStore
    .getAllFinishes()
    .filter((finish) => selectedSampleIds.includes(finish.id));
  const { samplesPrice } = getSamplePricingBreakdown(selectedSamples.length);
  const isSampleCheckout =
    checkoutMode === CHECKOUT_MODE_SAMPLES && selectedSamples.length > 0;

  const buildSummary = useMemo(
    () => [
      ['Table Top', selectedFinish.label],
      ['Base', selectedBase.label],
      ['Base Colour', selectedBaseColor],
      ['Dimensions', dimensionsLabel],
      ['Table Top Shape', selectedShape],
      ['Chair Type', selectedChair?.name ?? 'N/A'],
      ['Chair Colour', selectedChairColor?.name ?? 'N/A'],
      ['Chair Quantity', designManager.chairQuantity.toString()],
    ],
    [
      designManager.chairQuantity,
      dimensionsLabel,
      selectedBase.label,
      selectedBaseColor,
      selectedChair?.name,
      selectedChairColor?.name,
      selectedFinish.label,
      selectedShape,
    ],
  );

  const sampleSummary = useMemo(
    () => [
      ['Order Type', 'Sample Order'],
      ['Selected Samples', selectedSamples.map((s) => s.label).join(', ')],
      ['Sample Quantity', selectedSamples.length.toString()],
    ],
    [selectedSamples],
  );

  const summaryRows = isSampleCheckout ? sampleSummary : buildSummary;
  const summaryImageSrc = isSampleCheckout
    ? null
    : previewImage || selectedFinish.preview;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      <Box
        sx={{
          borderBottom: '1px solid #e8e8e8',
          px: 2.5,
          py: 1.6,
        }}>
        <img
          src="/assets/images/header_logo.svg"
          alt="Bemade"
          style={{ display: 'block', height: 56 }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { lg: '1.45fr 0.95fr', xs: '1fr' },
          mx: 'auto',
          px: { md: 6, xs: 2 },
          py: { md: 4, xs: 2.5 },
          width: 'min(1220px, 100%)',
        }}>
        <Box sx={{ pr: { lg: 2, xs: 0 } }}>
          <Typography sx={{ fontSize: 44, fontWeight: 700, mb: 3 }}>
            Checkout
          </Typography>

          <Box
            sx={{
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: {
                sm: 'repeat(2, minmax(0, 1fr))',
                xs: '1fr',
              },
              rowGap: 2,
            }}>
            {CHECKOUT_FIELDS.map((field) => (
              <Box key={field.key}>
                <Typography
                  sx={{
                    color: '#71757a',
                    fontSize: 15,
                    fontWeight: 600,
                    mb: 0.7,
                  }}>
                  {field.label}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={field.placeholder}
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      fontSize: 14,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              mt: 6,
            }}>
            <Button
              onClick={() => {
                window.location.assign(NavigationRoutes.Default);
              }}
              sx={{
                border: '1px solid #cfd2d6',
                borderRadius: 999,
                color: '#3d434a',
                px: 2.6,
                py: 0.8,
                textTransform: 'none',
              }}>
              {'<'} Back to Design
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              sx={{
                backgroundColor: '#000',
                borderRadius: 999,
                color: '#fff',
                px: 2.4,
                py: 0.8,
                textTransform: 'none',
              }}>
              Terms & Conditions
            </Button>
            <Button
              disabled
              sx={{
                borderRadius: 999,
                px: 2.6,
                py: 0.8,
                textTransform: 'none',
              }}>
              Pay Now {'>'}
            </Button>
          </Box>

          <Box
            sx={{ alignItems: 'flex-start', display: 'flex', gap: 1, mt: 4 }}>
            <InfoOutlinedIcon
              sx={{ color: '#656a70', fontSize: 18, mt: 0.1 }}
            />
            <Typography
              sx={{ color: '#4f545b', fontSize: 13.5, lineHeight: 1.5 }}>
              <b>IMPORTANT</b> Due to the bespoke nature of your order, we can
              only provide 48 hours after placing your order, where you may
              cancel or make any changes before production process begins. After
              this point, cancellations and amendments will not be possible.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            backgroundColor: '#f2f2f2',
            borderRadius: 1.5,
            p: 2.2,
          }}>
          {summaryImageSrc ? (
            <Box
              component="img"
              src={summaryImageSrc}
              alt="Selected build preview"
              sx={{
                backgroundColor: '#dfdfdf',
                borderRadius: 1,
                display: 'block',
                height: 270,
                mb: 2.2,
                objectFit: 'cover',
                width: '100%',
              }}
            />
          ) : (
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: '#dfdfdf',
                borderRadius: 1,
                color: '#8a8e93',
                display: 'flex',
                fontSize: 14,
                height: 270,
                justifyContent: 'center',
                mb: 2.2,
                width: '100%',
              }}>
              Preview not applicable for sample order
            </Box>
          )}

          <img
            src="/assets/images/header_logo.svg"
            alt="Bemade"
            style={{ display: 'block', height: 38, marginBottom: 8 }}
          />
          <Typography
            sx={{
              color: '#9b9ea2',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
              mb: 2,
              textTransform: 'uppercase',
            }}>
            Your Design | Our Perfection
          </Typography>

          <Divider sx={{ mb: 2.2 }} />

          <Typography
            sx={{ color: '#5e646b', fontSize: 28, fontWeight: 500, mb: 1 }}>
            {isSampleCheckout ? 'SAMPLE ORDER' : 'YOUR BUILD'}
          </Typography>

          {summaryRows.map(([label, value]) => (
            <Box key={label}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1.1,
                }}>
                <Typography sx={{ color: '#3e4349', fontSize: 16 }}>
                  {label}
                </Typography>
                <Typography
                  sx={{
                    color: '#5d6167',
                    fontSize: 16,
                    textAlign: 'right',
                    textTransform: 'capitalize',
                  }}>
                  {value}
                </Typography>
              </Box>
              <Divider />
            </Box>
          ))}

          <Box sx={{ mt: 2 }}>
            {isSampleCheckout ? (
              <>
                <BuildCostRow
                  label={`Samples (${selectedSamples.length})`}
                  value={formatGBP(samplesPrice)}
                />
                <BuildCostRow label="Total" value={formatGBP(samplesPrice)} bold />
              </>
            ) : (
              <>
                <BuildCostRow label="Dining Table" value={formatGBP(tablePrice)} />
                <BuildCostRow label="Chairs" value={formatGBP(chairPrice)} />
                <BuildCostRow label="Total" value={formatGBP(totalPrice)} bold />
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

const BuildCostRow = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      py: 0.6,
    }}>
    <Typography
      sx={{ color: '#363c42', fontSize: 16, fontWeight: bold ? 700 : 500 }}>
      {label}
    </Typography>
    <Typography
      sx={{ color: '#363c42', fontSize: 16, fontWeight: bold ? 700 : 500 }}>
      {value}
    </Typography>
  </Box>
);
