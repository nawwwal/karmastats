import type {
  RawValues,
  CoercedValues,
  ComputeOk as SharedComputeOk,
  ComputeErr as SharedComputeErr,
  ComputeResult as SharedComputeResult,
} from '@/lib/tools/shared/types';

export type TTestTab = 'independent' | 'paired' | 'one-sample';

export type ComputeOk<Result> = SharedComputeOk<Result, TTestTab>;
export type ComputeErr = SharedComputeErr<TTestTab>;
export type ComputeResult<Result> = SharedComputeResult<Result, TTestTab>;

export type { RawValues, CoercedValues };
