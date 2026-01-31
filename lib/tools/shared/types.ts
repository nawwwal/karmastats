export type RawValues = Record<string, unknown>;
export type CoercedValues = Record<string, unknown>;

export interface ComputeOk<Result, Tab = string> {
  ok: true;
  tab?: Tab;
  result: Result;
  values: CoercedValues;
}

export interface ComputeErr<Tab = string> {
  ok: false;
  tab?: Tab;
  message: string;
  values: CoercedValues;
}

export type ComputeResult<Result, Tab = string> = ComputeOk<Result, Tab> | ComputeErr<Tab>;

// No default export; this module provides named types only.

