import { coerceValues } from './converter';
import {
  LogRankParamsSchema,
  CoxParamsSchema,
  OneArmParamsSchema,
  calculateLogRank,
  calculateCox,
  calculateOneArm,
} from '@/lib/math/sample-size/survivalAnalysis';
import type { ComputeResult, SurvivalTab } from './types';

export async function computeSurvival(tab: SurvivalTab, raw: Record<string, unknown>): Promise<ComputeResult<any>> {
  const coerced = coerceValues(raw as any);
  try {
    switch (tab) {
      case 'log-rank': {
        const parsed = LogRankParamsSchema.safeParse(coerced);
        if (!parsed.success) return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
        const result = calculateLogRank(parsed.data);
        return { ok: true, result, values: coerced };
      }
      case 'cox': {
        const parsed = CoxParamsSchema.safeParse(coerced);
        if (!parsed.success) return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
        const result = calculateCox(parsed.data);
        return { ok: true, result, values: coerced };
      }
      case 'one-arm': {
        const parsed = OneArmParamsSchema.safeParse(coerced);
        if (!parsed.success) return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
        const result = calculateOneArm(parsed.data);
        return { ok: true, result, values: coerced };
      }
    }
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Computation failed', values: coerced };
  }
  return { ok: false, message: 'Invalid tab', values: coerced };
}

export default computeSurvival;


