import type {
  RawValues,
  CoercedValues,
  ComputeOk as SharedComputeOk,
  ComputeErr as SharedComputeErr,
  ComputeResult as SharedComputeResult,
} from '@/lib/tools/shared/types';

export type ComparativeTab = 'case-control' | 'cohort';

export type ComputeOk<Result> = SharedComputeOk<Result, ComparativeTab>;
export type ComputeErr = SharedComputeErr<ComparativeTab>;
export type ComputeResult<Result> = SharedComputeResult<Result, ComparativeTab>;

// Convenience union used by pages to type result state
export type AnyComparativeResult = ComputeResult<any>;

export type { RawValues, CoercedValues };
