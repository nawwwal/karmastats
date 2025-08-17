import { z } from 'zod';

// Zod validation schemas
export const CaseControlParamsSchema = z.object({
  controlExposure: z.number().min(0.1).max(99.9, 'Control exposure must be between 0.1% and 99.9%'),
  oddsRatio: z.number().min(0.1).max(100, 'Odds ratio must be between 0.1 and 100'),
  caseControlRatio: z.number().positive('Case-control ratio must be positive'),
  significanceLevel: z.number().refine(val => [0.01, 0.05, 0.10].includes(val), {
    message: 'Significance level must be 0.01, 0.05, or 0.10'
  }).optional(),
  power: z.number().refine(val => [0.80, 0.85, 0.90, 0.95].includes(val), {
    message: 'Power must be 0.80, 0.85, 0.90, or 0.95'
  }).optional(),
  nonResponseRate: z.number().min(0).max(99.9, 'Non-response rate must be less than 100').optional(),
});

export const CohortParamsSchema = z.object({
  unexposedIncidence: z.number().min(0.1).max(99.9, 'Unexposed incidence must be between 0.1% and 99.9%'),
  relativeRisk: z.number().min(0.1).max(100, 'Relative risk must be between 0.1 and 100'),
  exposedUnexposedRatio: z.number().positive('Exposed-unexposed ratio must be positive'),
  significanceLevel: z.number().refine(val => [0.01, 0.05, 0.10].includes(val), {
    message: 'Significance level must be 0.01, 0.05, or 0.10'
  }).optional(),
  power: z.number().refine(val => [0.80, 0.85, 0.90, 0.95].includes(val), {
    message: 'Power must be 0.80, 0.85, 0.90, or 0.95'
  }).optional(),
  lossToFollowUp: z.number().min(0).max(99.9, 'Loss to follow-up must be less than 100').optional(),
});

export const ComparativeStudyParamsSchema = z.object({
  significanceLevel: z.number().refine(val => [0.01, 0.05, 0.10].includes(val), {
    message: 'Significance level must be 0.01, 0.05, or 0.10'
  }),
  statisticalPower: z.number().refine(val => [0.80, 0.85, 0.90, 0.95].includes(val), {
    message: 'Statistical power must be 0.80, 0.85, 0.90, or 0.95'
  }),
  nonResponseRate: z.number().min(0).max(99.9, 'Non-response rate must be less than 100'),
  allocationRatio: z.number().positive('Allocation ratio must be positive'),
  // Case-Control specific
  controlExposure: z.number().min(0.1).max(99.9).optional(),
  expectedOddsRatio: z.number().min(0.1).max(100).optional(),
  // Cohort specific
  unexposedIncidence: z.number().min(0.1).max(99.9).optional(),
  expectedRelativeRisk: z.number().min(0.1).max(100).optional(),
});

export type CaseControlInput = z.infer<typeof CaseControlParamsSchema>;
export type CohortInput = z.infer<typeof CohortParamsSchema>;
export type ComparativeStudyInput = z.infer<typeof ComparativeStudyParamsSchema>;

export interface ComparativeStudyParams {
  // Common parameters
  significanceLevel: number;
  statisticalPower: number;
  nonResponseRate: number;
  allocationRatio: number;

  // Case-Control specific
  controlExposure?: number;
  expectedOddsRatio?: number;

  // Cohort specific
  unexposedIncidence?: number;
  expectedRelativeRisk?: number;
}

export interface ComparativeStudyResults {
  totalSampleSize: number;
  group1SampleSize: number;
  group2SampleSize: number;
  adjustedSampleSize: number;
  power: number;
  effectSize: number;
}

export interface CaseControlParams {
    controlExposure: number;
    oddsRatio: number;
    caseControlRatio: number;
    significanceLevel?: number;
    power?: number;
    nonResponseRate?: number;
}

export interface CohortParams {
    unexposedIncidence: number;
    relativeRisk: number;
    exposedUnexposedRatio: number;
    significanceLevel?: number;
    power?: number;
    lossToFollowUp?: number;
}

import { Z_SCORES_ALPHA, Z_SCORES_BETA } from './statistical-constants';

const z_alpha = Z_SCORES_ALPHA;
const z_beta = Z_SCORES_BETA;

export function calculateCaseControl(params: CaseControlParams) {
    const {
        controlExposure,
        oddsRatio,
        caseControlRatio,
        significanceLevel = 0.05,
        power = 0.8,
        nonResponseRate = 0
    } = params;

    const p0 = controlExposure / 100;
    const p1 = (oddsRatio * p0) / (1 - p0 + (oddsRatio * p0));
    const p_bar = (p1 + caseControlRatio * p0) / (1 + caseControlRatio);

    const za = z_alpha[significanceLevel as keyof typeof z_alpha];
    const zb = z_beta[power as keyof typeof z_beta];

    if (!za || !zb) {
        throw new Error(`Invalid significance level (${significanceLevel}) or power (${power})`);
    }

    const n_cases = Math.pow(za * Math.sqrt((1 + 1/caseControlRatio) * p_bar * (1 - p_bar)) + zb * Math.sqrt(p1*(1-p1) + (p0*(1-p0))/caseControlRatio), 2) / Math.pow(p1 - p0, 2);
    const n_controls = caseControlRatio * n_cases;

    const total_n_cases = nonResponseRate >= 100 ? Infinity : Math.ceil(n_cases / (1 - nonResponseRate/100));
    const total_n_controls = nonResponseRate >= 100 ? Infinity : Math.ceil(n_controls / (1 - nonResponseRate/100));

    return {
        cases: total_n_cases,
        controls: total_n_controls,
        totalSampleSize: total_n_cases + total_n_controls
    };
}


export function calculateCohort(params: CohortParams) {
    const {
        unexposedIncidence,
        relativeRisk,
        exposedUnexposedRatio,
        significanceLevel = 0.05,
        power = 0.8,
        lossToFollowUp = 0
    } = params;

    const p0 = unexposedIncidence / 100;
    const p1 = p0 * relativeRisk;
    const p_bar = (exposedUnexposedRatio * p1 + p0) / (exposedUnexposedRatio + 1);

    const za = z_alpha[significanceLevel as keyof typeof z_alpha];
    const zb = z_beta[power as keyof typeof z_beta];

    if (!za || !zb) {
        throw new Error(`Invalid significance level (${significanceLevel}) or power (${power})`);
    }

    const n_unexposed = Math.pow(za * Math.sqrt((1 + 1/exposedUnexposedRatio) * p_bar * (1 - p_bar)) + zb * Math.sqrt(p1*(1-p1)/exposedUnexposedRatio + p0*(1-p0)), 2) / Math.pow(p1 - p0, 2);
    const n_exposed = exposedUnexposedRatio * n_unexposed;

    const total_n_unexposed = lossToFollowUp >= 100 ? Infinity : Math.ceil(n_unexposed / (1 - lossToFollowUp/100));
    const total_n_exposed = lossToFollowUp >= 100 ? Infinity : Math.ceil(n_exposed / (1 - lossToFollowUp/100));

    return {
        exposed: total_n_exposed,
        unexposed: total_n_unexposed,
        totalSampleSize: total_n_exposed + total_n_unexposed
    };
}

export class ComparativeStudy {
  private static getZScore(probability: number): number {
    // Use centralized constants first
    if (Z_SCORES_BETA[probability as keyof typeof Z_SCORES_BETA]) {
      return Z_SCORES_BETA[probability as keyof typeof Z_SCORES_BETA];
    }

    // Fallback for additional values not in centralized constants
    const additionalZScores: { [key: number]: number } = {
      0.99: 2.326,
      0.999: 3.090
    };
    return additionalZScores[probability] || 0;
  }

  static calculateCaseControl(params: ComparativeStudyParams): ComparativeStudyResults {
    const {
      controlExposure = 20,
      expectedOddsRatio = 2.0,
      allocationRatio = 1,
      significanceLevel = 0.05,
      statisticalPower = 0.80,
      nonResponseRate = 10
    } = params;

    // Convert percentages to proportions
    const p0 = controlExposure / 100;
    const OR = expectedOddsRatio;
    const k = allocationRatio;

    // Calculate exposure proportion in cases using OR
    const p1 = (OR * p0) / (1 - p0 + OR * p0);

    // Calculate pooled proportions
    const pBar = (p1 + k * p0) / (1 + k);
    const qBar = 1 - pBar;

    // Get Z-scores
    const zAlpha = this.getZScore(1 - significanceLevel / 2);
    const zBeta = this.getZScore(statisticalPower);

    // Calculate sample size per case group
    const numerator = zAlpha * Math.sqrt((1 + 1 / k) * pBar * qBar) +
                     zBeta * Math.sqrt(p1 * (1 - p1) + p0 * (1 - p0) / k);
    const denominator = Math.pow(p1 - p0, 2);
    const n = Math.ceil(Math.pow(numerator / denominator, 2));

    // Calculate total sample size
    const totalSampleSize = n * (1 + k);
    const group1SampleSize = n;
    const group2SampleSize = n * k;

    // Adjust for non-response
    const adjustedSampleSize = Math.ceil(totalSampleSize / Math.pow(1 - nonResponseRate / 100, 2));

    return {
      totalSampleSize,
      group1SampleSize,
      group2SampleSize,
      adjustedSampleSize,
      power: statisticalPower,
      effectSize: OR
    };
  }

  static calculateCohort(params: ComparativeStudyParams): ComparativeStudyResults {
    const {
      unexposedIncidence = 10,
      expectedRelativeRisk = 2.0,
      allocationRatio = 1,
      significanceLevel = 0.05,
      statisticalPower = 0.80,
      nonResponseRate = 10
    } = params;

    // Convert percentages to proportions
    const p0 = unexposedIncidence / 100;
    const RR = expectedRelativeRisk;
    const k = allocationRatio;

    // Calculate incidence in exposed group
    const p1 = RR * p0;

    // Calculate pooled proportions
    const pBar = (k * p1 + p0) / (k + 1);
    const qBar = 1 - pBar;

    // Get Z-scores
    const zAlpha = this.getZScore(1 - significanceLevel / 2);
    const zBeta = this.getZScore(statisticalPower);

    // Calculate sample size per unexposed group
    const numerator = zAlpha * Math.sqrt((1 + 1 / k) * pBar * qBar) +
                     zBeta * Math.sqrt(p1 * (1 - p1) + p0 * (1 - p0) / k);
    const denominator = Math.pow(p1 - p0, 2);
    const n = Math.ceil(Math.pow(numerator / denominator, 2));

    // Calculate total sample size
    const totalSampleSize = n * (1 + k);
    const group1SampleSize = n;
    const group2SampleSize = n * k;

    // Adjust for non-response
    const adjustedSampleSize = Math.ceil(totalSampleSize / Math.pow(1 - nonResponseRate / 100, 2));

    return {
      totalSampleSize,
      group1SampleSize,
      group2SampleSize,
      adjustedSampleSize,
      power: statisticalPower,
      effectSize: RR
    };
  }
}
