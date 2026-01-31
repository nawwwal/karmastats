import type {
  RawValues,
  CoercedValues,
  ComputeOk as SharedComputeOk,
  ComputeErr as SharedComputeErr,
  ComputeResult as SharedComputeResult,
} from '@/lib/tools/shared/types';

export type TrialTab = 'superiority' | 'non-inferiority' | 'equivalence';

export type ComputeOk<Result> = SharedComputeOk<Result, TrialTab>;
export type ComputeErr = SharedComputeErr<TrialTab>;
export type ComputeResult<Result> = SharedComputeResult<Result, TrialTab>;

export type { RawValues, CoercedValues };

