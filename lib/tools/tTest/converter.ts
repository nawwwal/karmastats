import { CoercedValues, RawValues } from './types';

const isNumericKey = new Set([
  'group1Mean', 'group2Mean', 'pooledSD', 'allocationRatio',
  'meanDifference', 'sdDifference', 'correlation',
  'sampleMean', 'populationMean', 'populationSD',
  'significanceLevel', 'power', 'dropoutRate',
]);

export function coerceValues(raw: RawValues): CoercedValues {
  const out: CoercedValues = {};
  for (const [k, v] of Object.entries(raw)) {
    if (isNumericKey.has(k)) {
      if (typeof v === 'string') {
        const t = v.trim();
        if (t === '' || t === '-' || t === '.' || t === '-.') { out[k] = undefined; continue; }
        const n = Number(t);
        out[k] = Number.isFinite(n) ? n : undefined;
        continue;
      }
      out[k] = v as unknown;
      continue;
    }
    out[k] = v as unknown;
  }
  return out;
}
