import type {
  BaseId,
  ChairId,
  TopShape,
} from '../state/TableDesignManager';

export type SharedConfigV1 = {
  v: 1;
  b: BaseId;
  bc: string;
  ts: TopShape;
  tc: string;
  l: number;
  w: number;
  cid: ChairId | null;
  cc: string | null;
  cq: number;
};

const QUERY_KEY = 'cfg';

export const buildShareUrl = (config: SharedConfigV1) => {
  const encoded = encodeURIComponent(JSON.stringify(config));
  const url = new URL(window.location.origin + '/');
  url.searchParams.set(QUERY_KEY, encoded);
  return url.toString();
};

export const parseSharedConfigFromUrl = (): SharedConfigV1 | null => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(QUERY_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as SharedConfigV1;
    if (parsed?.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
};

