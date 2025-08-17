export type TTestTab = 'independent' | 'paired' | 'one-sample';

export type RawValues = Record<string, unknown>;
export type CoercedValues = Record<string, unknown>;

export interface ComputeOk<Result> {
  ok: true;
  tab: TTestTab;
  result: Result;
  values: CoercedValues;
}

export interface ComputeErr {
  ok: false;
  tab: TTestTab;
  message: string;
  values: CoercedValues;
}

export type ComputeResult<Result> = ComputeOk<Result> | ComputeErr;
