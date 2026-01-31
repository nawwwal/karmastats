import type {
  RawValues,
  CoercedValues,
  ComputeOk as SharedComputeOk,
  ComputeErr as SharedComputeErr,
  ComputeResult as SharedComputeResult,
} from '@/lib/tools/shared/types';

export type DiagnosticTab = 'single' | 'comparative' | 'roc';

export type ComputeOk<Result> = SharedComputeOk<Result, DiagnosticTab>;
export type ComputeErr = SharedComputeErr<DiagnosticTab>;
export type ComputeResult<Result> = SharedComputeResult<Result, DiagnosticTab>;

export type { RawValues, CoercedValues };

