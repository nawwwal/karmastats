import { coerceValues } from './converter';
import {
  CaseControlParamsSchema,
  CohortParamsSchema,
  calculateCaseControl,
  calculateCohort,
} from '@/lib/math/sample-size/comparativeStudy';
import type { ComputeResult, ComparativeTab } from './types';

export async function computeComparative(tab: ComparativeTab, raw: Record<string, unknown>): Promise<ComputeResult<any>> {
  const coerced = coerceValues(raw as any);
  try {
    if (tab === 'case-control') {
      const parsed = CaseControlParamsSchema.safeParse(coerced);
      if (!parsed.success) return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
      // The math function expects controlExposure (percent) and oddsRatio — compute OR from p0/p1 if provided
      const { alpha, power, ratio, p0, p1 } = parsed.data as any;
      const ctrl = Number(p0);
      const caseExp = Number(p1);
      const OR = (caseExp / (100 - caseExp)) / (ctrl / (100 - ctrl));
      const sample = calculateCaseControl({ controlExposure: ctrl, oddsRatio: OR, caseControlRatio: ratio, significanceLevel: alpha, power });
      const results = {
        type: 'case-control',
        sampleSize: sample,
        parameters: parsed.data,
        interpretation: {
          nCases: sample.cases,
          nControls: sample.controls,
          totalSample: sample.totalSampleSize,
        },
      };
      return { ok: true, result: results, values: coerced };
    } else {
      const parsed = CohortParamsSchema.safeParse(coerced);
      if (!parsed.success) return { ok: false, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
      const { alpha, power, ratio, p1, p2 } = parsed.data as any;
      const unexposed = Number(p2);
      const rel = Number(p1) / Number(p2);
      const sample = calculateCohort({ unexposedIncidence: unexposed, relativeRisk: rel, exposedUnexposedRatio: ratio, significanceLevel: alpha, power });
      const results = {
        type: 'cohort',
        sampleSize: sample,
        parameters: parsed.data,
        interpretation: {
          nExposed: sample.exposed,
          nUnexposed: sample.unexposed,
          totalSample: sample.totalSampleSize,
        },
      };
      return { ok: true, result: results, values: coerced };
    }
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Computation failed', values: coerced };
  }
}

export default computeComparative;


