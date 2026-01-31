import { coerceValues } from './converter';
import {
  SuperiorityBinarySchema,
  SuperiorityContinuousSchema,
  NonInferioritySchema,
  EquivalenceSchema,
  calculateSuperiorityBinary,
  calculateSuperiorityContinuous,
  calculateNonInferiority,
  calculateEquivalence,
} from '@/lib/math/sample-size/clinicalTrial';
import type { ComputeResult, TrialTab } from './types';

export async function computeClinical(tab: TrialTab, raw: Record<string, unknown>, opts?: Record<string, unknown>): Promise<ComputeResult<any>> {
  const coerced = coerceValues(raw as any);
  try {
    switch (tab) {
      case 'superiority': {
        // choose binary vs continuous via opts.superiorityOutcome
        const outcome = (opts as any)?.superiorityOutcome ?? 'binary';
        if (outcome === 'binary') {
          const parsed = SuperiorityBinarySchema.safeParse(coerced);
          if (!parsed.success) return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
          const result = calculateSuperiorityBinary(parsed.data);
          return { ok: true, result, values: coerced };
        } else {
          const parsed = SuperiorityContinuousSchema.safeParse(coerced);
          if (!parsed.success) return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
          const result = calculateSuperiorityContinuous(parsed.data);
          return { ok: true, result, values: coerced };
        }
      }
      case 'non-inferiority': {
        const parsed = NonInferioritySchema.safeParse(coerced);
        if (!parsed.success) return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
        const result = calculateNonInferiority(parsed.data);
        return { ok: true, result, values: coerced };
      }
      case 'equivalence': {
        const parsed = EquivalenceSchema.safeParse(coerced);
        if (!parsed.success) return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
        const result = calculateEquivalence(parsed.data);
        return { ok: true, result, values: coerced };
      }
    }
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Computation failed', values: coerced };
  }
  return { ok: false, message: 'Invalid tab', values: coerced };
}

export default computeClinical;


