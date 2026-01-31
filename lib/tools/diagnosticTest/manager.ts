import * as z from 'zod';
import { coerceValues } from './converter';
import type { DiagnosticTab, ComputeResult } from './types';
import type { CoercedValues } from './types';
import {
  SingleTestSchema,
  calculateSingleTestSampleSize,
  ComparativeTestSchema,
  calculateComparativeTestSampleSize,
  ROCAnalysisSchema,
  calculateROCAnalysisSampleSize,
} from '@/lib/math/sample-size/diagnosticTest';

type AnyResult = any;

const TabSchemaMap: Record<DiagnosticTab, z.ZodSchema<any>> = {
  single: SingleTestSchema,
  comparative: ComparativeTestSchema,
  roc: ROCAnalysisSchema,
};

export async function computeDiagnostic(tab: DiagnosticTab, raw: Record<string, unknown>): Promise<ComputeResult<AnyResult>> {
  const coerced: CoercedValues = coerceValues(raw as any);
  const schema = TabSchemaMap[tab];
  const parsed = schema.safeParse(coerced);
  if (!parsed.success) {
    return { ok: false, tab, message: parsed.error.issues.map(i => i.message).join(', '), values: coerced };
  }

  try {
    switch (tab) {
      case 'single': {
        const result = calculateSingleTestSampleSize(parsed.data);
        return { ok: true, tab, result, values: coerced };
      }
      case 'comparative': {
        const result = calculateComparativeTestSampleSize(parsed.data);
        return { ok: true, tab, result, values: coerced };
      }
      case 'roc': {
        const result = calculateROCAnalysisSampleSize(parsed.data);
        return { ok: true, tab, result, values: coerced };
      }
    }
  } catch (e: any) {
    return { ok: false, tab, message: e?.message || 'Computation failed', values: coerced };
  }
}

export default computeDiagnostic;


