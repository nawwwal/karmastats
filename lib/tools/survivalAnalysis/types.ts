import type {
  RawValues,
  CoercedValues,
  ComputeOk as SharedComputeOk,
  ComputeErr as SharedComputeErr,
  ComputeResult as SharedComputeResult,
} from '@/lib/tools/shared/types';

export type SurvivalTab = 'log-rank' | 'cox' | 'one-arm';

export type ComputeOk<Result> = SharedComputeOk<Result, SurvivalTab>;
export type ComputeErr = SharedComputeErr<SurvivalTab>;
export type ComputeResult<Result> = SharedComputeResult<Result, SurvivalTab>;

export type { RawValues, CoercedValues };

