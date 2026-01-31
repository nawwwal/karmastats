import type {
  RawValues,
  CoercedValues,
  ComputeOk as SharedComputeOk,
  ComputeErr as SharedComputeErr,
  ComputeResult as SharedComputeResult,
} from '@/lib/tools/shared/types';

export type ComputeOk<Result> = SharedComputeOk<Result>;
export type ComputeErr = SharedComputeErr;
export type ComputeResult<Result> = SharedComputeResult<Result>;

export type { RawValues, CoercedValues };

