import type { RawValues, CoercedValues } from './types';

export function coerceValues(raw: RawValues): CoercedValues {
  const out: CoercedValues = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string') {
      const t = v.trim();
      if (t === '' || t === '-' || t === '.' || t === '-.') {
        out[k] = undefined;
        continue;
      }
      const n = Number(t);
      out[k] = Number.isFinite(n) ? n : v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Named export only; import via barrels as needed.

