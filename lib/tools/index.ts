export type ToolHandler = (data: any) => any | Promise<any>;

type ToolLoader = () => Promise<ToolHandler>;

// Lazy-loaded tool registry to keep cold starts fast
const loaders: Record<string, ToolLoader> = {
  'linear-regression': async () => {
    const { linearRegression } = await import('../regression');
    return ({ xValues, yValues }: { xValues: number[]; yValues: number[] }) =>
      linearRegression(xValues, yValues);
  },
  'multiple-regression': async () => {
    const { multipleRegression } = await import('../regression');
    return ({ y, X }: { y: number[]; X: number[][] }) =>
      multipleRegression(y, X);
  },
  'polynomial-regression': async () => {
    const { polynomialRegression } = await import('../regression');
    return ({ xValues, yValues, degree }: { xValues: number[]; yValues: number[]; degree: number }) =>
      polynomialRegression(xValues, yValues, degree);
  },
  'logistic-regression': async () => {
    const { logisticRegression } = await import('../regression');
    return ({ y, X, options }: { y: number[]; X: number[][]; options?: any }) =>
      logisticRegression(y, X, options);
  },
  'case-control-sample-size': async () => {
    const { calculateCaseControlSampleSize } = await import('../math/sample-size/comparativeStudy');
    return ({ alpha, power, ratio, p0, p1 }: { alpha: number; power: number; ratio: number; p0: number; p1: number }) =>
      calculateCaseControlSampleSize(alpha, power, ratio, p0, p1);
  },
  'cohort-sample-size': async () => {
    const { calculateCohortSampleSize } = await import('../math/sample-size/comparativeStudy');
    return ({ alpha, power, ratio, p1, p2 }: { alpha: number; power: number; ratio: number; p1: number; p2: number }) =>
      calculateCohortSampleSize(alpha, power, ratio, p1, p2);
  },
  'independent-ttest-sample-size': async () => {
    const { calculateIndependentSampleSize } = await import('../math/sample-size/tTest');
    return (params: any) => calculateIndependentSampleSize(params);
  },
  'paired-ttest-sample-size': async () => {
    const { calculatePairedSampleSize } = await import('../math/sample-size/tTest');
    return (params: any) => calculatePairedSampleSize(params);
  },
  'one-sample-ttest-sample-size': async () => {
    const { calculateOneSampleSampleSize } = await import('../math/sample-size/tTest');
    return (params: any) => calculateOneSampleSampleSize(params);
  },
  'cox-regression': async () => {
    const { calculateCox } = await import('../survivalAnalysis');
    return (params: any) => calculateCox(params);
  },
  'log-rank': async () => {
    const { calculateLogRank } = await import('../survivalAnalysis');
    return (params: any) => calculateLogRank(params);
  },
  'one-arm-survival': async () => {
    const { calculateOneArm } = await import('../survivalAnalysis');
    return (params: any) => calculateOneArm(params);
  },
  'study-detector': async () => {
    const { analyzeStudy } = await import('../studyDetector');
    return ({ text }: { text: string }) => analyzeStudy(text);
  }
};

const cache: Record<string, ToolHandler> = {};

export async function getTool(name: string): Promise<ToolHandler | undefined> {
  if (cache[name]) return cache[name];
  const loader = loaders[name];
  if (!loader) return undefined;
  const handler = await loader();
  cache[name] = handler;
  return handler;
}

export function registerTool(name: string, loader: ToolLoader) {
  loaders[name] = loader;
}
