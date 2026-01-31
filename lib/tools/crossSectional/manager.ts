import { coerceValues } from './converter';
import { CrossSectionalSchema, calculateCrossSectionalSampleSize } from '@/lib/math/sample-size/crossSectional';
import type { ComputeResult } from './types';

export async function computeCrossSectional(raw: Record<string, unknown>): Promise<ComputeResult<any>> {
  const coerced = coerceValues(raw as any);
  const parsed = CrossSectionalSchema.safeParse(coerced);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
  }
  try {
    const result = calculateCrossSectionalSampleSize(parsed.data);
    return { ok: true, result, values: coerced };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Computation failed', values: coerced };
  }
}

export default computeCrossSectional;


