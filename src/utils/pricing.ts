const RECT_TOP_SHAPES = new Set(['capsule', 'oblong', 'oval', 'rectangle']);

const SQUARE_PRICING: Record<number, number> = {
  1200: 2190,
  1300: 2380,
  1400: 2650,
  1500: 2880,
  1580: 2880,
};

const ROUND_PRICING: Record<number, number> = {
  1200: 2290,
  1300: 2480,
  1400: 2750,
  1500: 2980,
  1580: 2980,
};

export const CHECKOUT_PREVIEW_KEY = 'bemade_checkout_preview';
export const CHECKOUT_MODE_KEY = 'bemade_checkout_mode';
export const CHECKOUT_SAMPLES_KEY = 'bemade_checkout_samples';
export const CHECKOUT_MODE_BUILD = 'build';
export const CHECKOUT_MODE_SAMPLES = 'samples';

export const formatGBP = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const nearestKey = (keys: number[], value: number) =>
  keys.reduce((best, current) =>
    Math.abs(current - value) < Math.abs(best - value) ? current : best,
  );

const getRectTopPrice = (length: number) => {
  if (length >= 1600 && length <= 2200) return 2880;
  if (length >= 2250 && length <= 2450) return 3312;
  if (length >= 2500 && length <= 2850) return 3576;
  if (length >= 2900 && length <= 3180) return 3840;

  if (length < 2250) return 2880;
  if (length < 2500) return 3312;
  if (length < 2900) return 3576;
  return 3840;
};

const getSquareOrRoundPrice = (shape: string, length: number): number => {
  const table = shape === 'square' ? SQUARE_PRICING : ROUND_PRICING;
  const key = nearestKey(Object.keys(table).map(Number), length);
  return table[key];
};

const getTablePrice = (shape: string, length: number) => {
  if (RECT_TOP_SHAPES.has(shape)) return getRectTopPrice(length);
  if (shape === 'square' || shape === 'round') {
    return getSquareOrRoundPrice(shape, length);
  }
  return getRectTopPrice(length);
};

export const getPricingBreakdown = (
  shape: string,
  length: number,
  chairQuantity: number,
) => {
  const tablePrice = getTablePrice(shape, length);
  const chairPrice = chairQuantity * 100;
  const totalPrice = tablePrice + chairPrice;

  return {
    chairPrice,
    tablePrice,
    totalPrice,
  };
};

export const getSamplePricingBreakdown = (sampleCount: number) => {
  const pairCount = Math.ceil(Math.max(0, sampleCount) / 2);
  const samplesPrice = pairCount * 20;

  return {
    pairCount,
    samplesPrice,
    totalPrice: samplesPrice,
  };
};
