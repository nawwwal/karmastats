export interface SurvivalAnalysisParams {
  medianSurvival1: number;
  medianSurvival2: number;
  hazardRatio: number;
  accrualPeriod: number;
  followupPeriod: number;
  allocationRatio: number;
  significanceLevel: number;
  statisticalPower: number;
  dropoutRate: number;
}

export interface SurvivalAnalysisResults {
  totalEvents: number;
  totalSampleSize: number;
  group1SampleSize: number;
  group2SampleSize: number;
  studyDuration: number;
  expectedEvents: {
    group1: number;
    group2: number;
  };
  power: number;
}

export interface LogRankParams {
    medianSurvival1: number;
    medianSurvival2: number;
    accrualPeriod: number;
    followupPeriod: number;
    allocationRatio?: number;
    significanceLevel?: number;
    power?: number;
    dropoutRate?: number;
}

export interface CoxParams {
    hazardRatio: number;
    rSquared: number;
    overallEventRate: number;
    significanceLevel?: number;
    power?: number;
    dropoutRate?: number;
    allocationRatio?: number;
    accrualPeriod: number;
    followupPeriod: number;
}

export interface OneArmParams {
    historicalMedianSurvival: number;
    targetMedianSurvival: number;
    analysisTimePoint: number;
    significanceLevel?: number;
    power?: number;
    dropoutRate?: number;
}

// Z-scores for common significance levels and powers
const z_alpha = {
    '0.05': 1.96,
    '0.01': 2.576,
    '0.10': 1.645
};

const z_beta = {
    '0.80': 0.842,
    '0.85': 1.036,
    '0.90': 1.282,
    '0.95': 1.645
};

export class SurvivalAnalysis {
  private static readonly LN2 = Math.log(2);

  public static calculateLogRank(params: LogRankParams): SurvivalAnalysisResults {
    const {
        medianSurvival1,
        medianSurvival2,
        accrualPeriod,
        followupPeriod,
        allocationRatio = 1,
        significanceLevel = 0.05,
        power = 0.8,
        dropoutRate = 0
    } = params;

    const za = z_alpha[significanceLevel.toString() as keyof typeof z_alpha];
    const zb = z_beta[power.toString() as keyof typeof z_beta];

    const lambda1 = this.LN2 / medianSurvival1;
    const lambda2 = this.LN2 / medianSurvival2;
    const hazardRatio = lambda2 / lambda1;

    const T = accrualPeriod + followupPeriod;
    const probEvent1 = 1 - ( (Math.exp(-lambda1 * followupPeriod) - Math.exp(-lambda1 * T)) / (lambda1 * accrualPeriod) );
    const probEvent2 = 1 - ( (Math.exp(-lambda2 * followupPeriod) - Math.exp(-lambda2 * T)) / (lambda2 * accrualPeriod) );

    const totalEvents = Math.pow(za + zb, 2) * Math.pow(1 + allocationRatio, 2) / (Math.pow(Math.log(hazardRatio), 2) * allocationRatio);

    const n1 = totalEvents / (probEvent1 + allocationRatio * probEvent2);
    const n2 = allocationRatio * n1;

    const totalSampleSize = Math.ceil(n1 + n2) / (1 - dropoutRate/100);

    // Calculate group sizes
    const group1SampleSize = Math.ceil(totalSampleSize / (1 + allocationRatio));
    const group2SampleSize = totalSampleSize - group1SampleSize;

    // Calculate expected events in each group
    const expectedEventsGroup1 = Math.ceil(group1SampleSize * probEvent1);
    const expectedEventsGroup2 = Math.ceil(group2SampleSize * probEvent2);

    return {
        totalEvents: Math.ceil(totalEvents),
        totalSampleSize: Math.ceil(totalSampleSize),
        group1SampleSize,
        group2SampleSize,
        studyDuration: T,
        expectedEvents: {
            group1: expectedEventsGroup1,
            group2: expectedEventsGroup2
        },
        power: power
    };
  }

  public static calculateCoxRegression(params: CoxParams): SurvivalAnalysisResults {
    const {
        hazardRatio,
        rSquared,
        overallEventRate,
        significanceLevel = 0.05,
        power = 0.8,
        dropoutRate = 0,
        allocationRatio = 1,
        accrualPeriod,
        followupPeriod,
    } = params;

    const za = z_alpha[significanceLevel.toString() as keyof typeof z_alpha];
    const zb = z_beta[power.toString() as keyof typeof z_beta];

    const totalEvents = Math.pow(za + zb, 2) / (Math.pow(Math.log(hazardRatio), 2) * (1 - rSquared));
    const totalSampleSize = Math.ceil(totalEvents / overallEventRate / (1 - dropoutRate/100));

    // Calculate group sizes
    const group1SampleSize = Math.round(totalSampleSize / (1 + allocationRatio));
    const group2SampleSize = totalSampleSize - group1SampleSize;

    // Calculate expected events in each group
    const totalSampleSizeBeforeDropout = totalEvents / overallEventRate;
    const n1_no_dropout = totalSampleSizeBeforeDropout / (1 + allocationRatio);
    const probEvent1 = overallEventRate * (1 + allocationRatio) / (1 + allocationRatio * hazardRatio);
    const expectedEventsGroup1 = Math.round(n1_no_dropout * probEvent1);
    const expectedEventsGroup2 = Math.ceil(totalEvents) - expectedEventsGroup1;

    return {
        totalEvents: Math.ceil(totalEvents),
        totalSampleSize: totalSampleSize,
        group1SampleSize,
        group2SampleSize,
        studyDuration: accrualPeriod + followupPeriod,
        expectedEvents: {
            group1: expectedEventsGroup1,
            group2: expectedEventsGroup2
        },
        power: power
    };
  }

  public static calculateOneArm(params: OneArmParams): SurvivalAnalysisResults {
    const {
        historicalMedianSurvival,
        targetMedianSurvival,
        analysisTimePoint,
        significanceLevel = 0.05,
        power = 0.8,
        dropoutRate = 0
    } = params;

    const za = z_alpha[significanceLevel.toString() as keyof typeof z_alpha];
    const zb = z_beta[power.toString() as keyof typeof z_beta];

    const lambda0 = this.LN2 / historicalMedianSurvival;
    const lambda1 = this.LN2 / targetMedianSurvival;

    const p0 = Math.exp(-lambda0 * analysisTimePoint);
    const p1 = Math.exp(-lambda1 * analysisTimePoint);

    const numerator = Math.pow(za * Math.sqrt(p0 * (1 - p0)) + zb * Math.sqrt(p1 * (1 - p1)), 2);
    const denominator = Math.pow(p1 - p0, 2);

    const totalSampleSize = numerator / denominator / (1 - dropoutRate/100);

    // Calculate group sizes
    const group1SampleSize = Math.ceil(totalSampleSize / (1 + targetMedianSurvival / historicalMedianSurvival));
    const group2SampleSize = totalSampleSize - group1SampleSize;

    // Calculate expected events in each group
    const expectedEventsGroup1 = Math.ceil(group1SampleSize * p0);
    const expectedEventsGroup2 = Math.ceil(group2SampleSize * p1);

    return {
        totalEvents: Math.ceil(totalSampleSize),
        totalSampleSize: Math.ceil(totalSampleSize),
        group1SampleSize,
        group2SampleSize,
        studyDuration: analysisTimePoint,
        expectedEvents: {
            group1: expectedEventsGroup1,
            group2: expectedEventsGroup2
        },
        power: power
    };
  }

  private static getZScore(probability: number): number {
    // Standard normal distribution Z-score lookup
    const zScores: Record<number, number> = {
      0.80: 0.8416,
      0.85: 1.0364,
      0.90: 1.2816,
      0.95: 1.6449,
      0.975: 1.9600,
      0.99: 2.3263,
      0.995: 2.5758
    };

    return zScores[probability] || 0;
  }
}
