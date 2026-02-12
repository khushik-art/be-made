import { TopShape } from '../state/TableDesignManager';

type RecommendationRow = {
  comfort?: number;
  tight?: number;
};

type FitType = 'compact' | 'comfortable';

type RecommendationResult = {
  comfort: number | null;
  maxAllowed: number;
  sourceLength: number;
  tight: number | null;
};

const RECT_RULES: Record<number, RecommendationRow> = {
  1200: { comfort: 4, tight: 6 },
  1300: { comfort: 4, tight: 6 },
  1400: { comfort: 4 },
  1500: { comfort: 6 },
  1600: { comfort: 6 },
  1700: { comfort: 6 },
  1800: { comfort: 6, tight: 8 },
  1900: { comfort: 6, tight: 8 },
  2000: { comfort: 8 },
  2100: { comfort: 8 },
  2200: { comfort: 8 },
  2300: { comfort: 8 },
  2400: { comfort: 8, tight: 10 },
  2500: { comfort: 8, tight: 10 },
  2600: { comfort: 10 },
  2700: { comfort: 10 },
  2800: { comfort: 10 },
  2900: { comfort: 10 },
  3000: { comfort: 10, tight: 12 },
  3100: { comfort: 12 },
  3180: { comfort: 12 },
};

const ROUND_RULES: Record<number, RecommendationRow> = {
  1200: { tight: 6 },
  1300: { comfort: 6 },
  1400: { comfort: 6, tight: 7 },
  1500: { comfort: 7 },
  1580: { tight: 8 },
};

const SQUARE_RULES: Record<number, RecommendationRow> = {
  1200: { comfort: 6 },
  1300: { comfort: 6 },
  1400: { comfort: 8 },
  1500: { comfort: 8 },
  1580: { comfort: 8 },
};

const getNearestRuleLength = (
  lookup: Record<number, RecommendationRow>,
  length: number,
) => {
  const keys = Object.keys(lookup).map(Number);

  if (keys.length === 0) return length;

  return keys.reduce((best, current) => {
    const currentDiff = Math.abs(current - length);
    const bestDiff = Math.abs(best - length);
    return currentDiff < bestDiff ? current : best;
  }, keys[0]);
};

const getRulesByShape = (shape: TopShape) => {
  if (shape === 'round') return ROUND_RULES;
  if (shape === 'square') return SQUARE_RULES;
  return RECT_RULES;
};

export const getChairRecommendation = (
  shape: TopShape,
  length: number,
): RecommendationResult => {
  const rules = getRulesByShape(shape);
  const sourceLength = getNearestRuleLength(rules, length);
  const row = rules[sourceLength] ?? {};

  const tight = row.tight ?? null;
  const comfort = row.comfort ?? null;
  const maxAllowed = Math.max(tight ?? 0, comfort ?? 0);

  return {
    comfort,
    maxAllowed,
    sourceLength,
    tight,
  };
};

export const getRecommendedChairCount = (
  shape: TopShape,
  length: number,
  fitType: FitType,
): number | null => {
  const rec = getChairRecommendation(shape, length);
  return fitType === 'compact' ? rec.tight : rec.comfort;
};

export const getChairGuidePdfPage = (shape: TopShape): number => {
  if (shape === 'capsule') return 1;
  if (shape === 'rectangle') return 2;
  if (shape === 'oval') return 4;
  if (shape === 'oblong') return 3;
  if (shape === 'round' || shape === 'square') return 5;
  return 1;
};
