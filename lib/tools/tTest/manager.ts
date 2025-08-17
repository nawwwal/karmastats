import * as z from 'zod';
import {
  IndependentSampleSizeSchema,
  PairedSampleSizeSchema,
  OneSampleSampleSizeSchema,
  calculateIndependentSampleSize,
  calculatePairedSampleSize,
  calculateOneSampleSampleSize,
  type IndependentSampleSizeOutput,
  type PairedSampleSizeOutput,
  type OneSampleSampleSizeOutput,
} from '@/lib/math/sample-size/tTest';
import { coerceValues } from './converter';
import type { TTestTab, ComputeResult, CoercedValues } from './types';

export type AnyResult =
  | IndependentSampleSizeOutput
  | PairedSampleSizeOutput
  | OneSampleSampleSizeOutput;

const TabSchemaMap: Record<TTestTab, z.ZodSchema<any>> = {
  independent: IndependentSampleSizeSchema,
  paired: PairedSampleSizeSchema,
  'one-sample': OneSampleSampleSizeSchema,
};

export async function computeTTest(
  tab: TTestTab,
  raw: Record<string, unknown>
): Promise<ComputeResult<AnyResult>> {
  const coerced: CoercedValues = coerceValues(raw);
  const schema = TabSchemaMap[tab];

  const parsed = schema.safeParse(coerced);
  if (!parsed.success) {
    const msg = parsed.error.issues?.map((i) => i.message).join(', ') || 'Invalid input';
    return { ok: false, tab, message: msg, values: coerced };
  }

  try {
    switch (tab) {
      case 'independent': {
        const result = calculateIndependentSampleSize(parsed.data);
        return { ok: true, tab, result, values: coerced };
      }
      case 'paired': {
        const result = calculatePairedSampleSize(parsed.data);
        return { ok: true, tab, result, values: coerced };
      }
      case 'one-sample': {
        const result = calculateOneSampleSampleSize(parsed.data);
        return { ok: true, tab, result, values: coerced };
      }
    }
  } catch (e: any) {
    return { ok: false, tab, message: e?.message || 'Computation failed', values: coerced };
  }
}
