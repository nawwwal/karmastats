import { z } from 'zod';

const zScores: { [key: number]: number } = {
    80: 0.842, 85: 1.036, 90: 1.282, 95: 1.645, 97.5: 1.96, 99: 2.326, 99.5: 2.576
};

function getZScore(confidence: number): number {
    return zScores[confidence] || zScores[95];
}

export interface DiagnosticTestParams {
  // Common parameters
  confidenceLevel: number;
  marginOfError: number;
  dropoutRate: number;

  // Single test parameters
  expectedSensitivity?: number;
  expectedSpecificity?: number;
  diseasePrevalence?: number;

  // Comparative test parameters
  test1Sensitivity?: number;
  test2Sensitivity?: number;
  test1Specificity?: number;
  test2Specificity?: number;
  correlation?: number;
  studyDesign?: 'paired' | 'unpaired';
}

export interface DiagnosticTestResults {
  totalSampleSize: number;
  adjustedSampleSize: number;
  sensitivitySampleSize: number;
  specificitySampleSize: number;
  confidenceLevel: number;
  marginOfError: number;
}

// 1. Single Diagnostic Test
export const SingleTestSchema = z.object({
    expectedSensitivity: z.number().min(0.1).max(99.9),
    expectedSpecificity: z.number().min(0.1).max(99.9),
    diseasePrevalence: z.number().min(0.1).max(99.9),
    marginOfError: z.number().min(0.1).max(50),
    confidenceLevel: z.number().refine(val => [80, 90, 95, 99].includes(val)),
    dropoutRate: z.number().min(0).max(99.9, 'Dropout rate must be less than 100'),
});

export type SingleTestInput = z.infer<typeof SingleTestSchema>;
export type SingleTestOutput = {
    nSensitivity: number;
    nSpecificity: number;
    totalSize: number;
    diseasePositive: number;
    diseaseNegative: number;
};

export function calculateSingleTestSampleSize(params: SingleTestInput): SingleTestOutput {
    const { expectedSensitivity, expectedSpecificity, diseasePrevalence, marginOfError, confidenceLevel, dropoutRate } = params;

    const zScore = getZScore(confidenceLevel);
    const se = expectedSensitivity / 100;
    const sp = expectedSpecificity / 100;
    const p = diseasePrevalence / 100;
    const d = marginOfError / 100;

    const nSensitivity = (Math.pow(zScore, 2) * se * (1 - se)) / (Math.pow(d, 2) * p);
    const nSpecificity = (Math.pow(zScore, 2) * sp * (1 - sp)) / (Math.pow(d, 2) * (1 - p));

    const baseSize = Math.max(nSensitivity, nSpecificity);
    const totalSize = dropoutRate >= 100
        ? Infinity
        : Math.ceil(baseSize / (1 - (dropoutRate / 100)));

    const diseasePositive = isFinite(totalSize) ? Math.ceil(totalSize * p) : Infinity;
    const diseaseNegative = isFinite(totalSize) ? totalSize - diseasePositive : Infinity;

    return {
        nSensitivity: Math.ceil(nSensitivity),
        nSpecificity: Math.ceil(nSpecificity),
        totalSize,
        diseasePositive,
        diseaseNegative
    };
}

// 2. Comparative Diagnostic Test
export const ComparativeTestSchema = z.object({
    studyDesign: z.enum(['paired', 'unpaired']),
    comparisonMetric: z.enum(['sensitivity', 'specificity']),
    test1Performance: z.number().min(0.1).max(99.9),
    test2Performance: z.number().min(0.1).max(99.9),
    diseasePrevalence: z.number().min(0.1).max(99.9),
    testCorrelation: z.number().min(-1).max(1).optional(),
    significanceLevel: z.number().refine(val => [1, 5, 10].includes(val)),
    power: z.number().refine(val => [80, 85, 90, 95].includes(val)),
    dropoutRate: z.number().min(0).max(99.9, 'Dropout rate must be less than 100'),
}).refine(data => data.studyDesign === 'unpaired' || data.testCorrelation !== undefined, {
    message: "Test correlation is required for paired designs",
    path: ["testCorrelation"],
});

export type ComparativeTestInput = z.infer<typeof ComparativeTestSchema>;
export type ComparativeTestOutput = {
    sampleSize: number;
    totalSize: number;
};

export function calculateComparativeTestSampleSize(params: ComparativeTestInput): ComparativeTestOutput {
    const { test1Performance, test2Performance, diseasePrevalence, significanceLevel, power, dropoutRate, studyDesign, testCorrelation } = params;

    const zAlpha = getZScore(100 - significanceLevel / 2);
    const zBeta = getZScore(power);
    const p1 = test1Performance / 100;
    const p2 = test2Performance / 100;
    const prev = diseasePrevalence / 100;

    let sampleSize: number;
    if (studyDesign === 'paired') {
        const rho = testCorrelation!;
        const psi = p1 * (1 - p1) + p2 * (1 - p2) - (2 * rho * Math.sqrt(p1 * (1 - p1) * p2 * (1 - p2)));
        sampleSize = (Math.pow(zAlpha + zBeta, 2) * psi) / Math.pow(p1 - p2, 2);
    } else {
        const p_bar = (p1 + p2) / 2;
        const term1 = zAlpha * Math.sqrt(2 * p_bar * (1 - p_bar));
        const term2 = zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
        sampleSize = Math.pow(term1 + term2, 2) / Math.pow(p1 - p2, 2);
        sampleSize = sampleSize * 2; // For two groups
    }

    const adjustedSampleSize = dropoutRate >= 100
        ? Infinity
        : Math.ceil(sampleSize / (1 - dropoutRate/100));
    const totalSize = isFinite(adjustedSampleSize)
        ? Math.ceil(adjustedSampleSize / prev)
        : Infinity;

    return {
        sampleSize: adjustedSampleSize,
        totalSize: totalSize,
    };
}

// 3. ROC Analysis
export const ROCAnalysisSchema = z.object({
    expectedAUC: z.number().min(0.5).max(1.0),
    nullAUC: z.number().min(0.0).max(1.0),
    negativePositiveRatio: z.number().min(0.1),
    significanceLevel: z.number().refine(val => [1, 5, 10].includes(val)),
    power: z.number().refine(val => [80, 85, 90, 95].includes(val)),
});

export type ROCAnalysisInput = z.infer<typeof ROCAnalysisSchema>;
export type ROCAnalysisOutput = {
    positiveSize: number;
    negativeSize: number;
    totalSize: number;
};

export function calculateROCAnalysisSampleSize(params: ROCAnalysisInput): ROCAnalysisOutput {
    const { expectedAUC, nullAUC, negativePositiveRatio, significanceLevel, power } = params;

    const zAlpha = getZScore(100 - significanceLevel / 2);
    const zBeta = getZScore(power);

    const Q1 = expectedAUC / (2 - expectedAUC);
    const Q2 = (2 * Math.pow(expectedAUC, 2)) / (1 + expectedAUC);

    const numerator = Math.pow(zAlpha * Math.sqrt(nullAUC * (1 - nullAUC)) + zBeta * Math.sqrt(expectedAUC * (1 - expectedAUC) * (1 + (Q1 * (1-expectedAUC) / (2-expectedAUC)) + (Q2 * (1-expectedAUC) / (1+expectedAUC)))), 2);
    const denominator = Math.pow(expectedAUC - nullAUC, 2);

    const positiveSize = Math.ceil(numerator / denominator);
    const negativeSize = Math.ceil(positiveSize * negativePositiveRatio);
    const totalSize = positiveSize + negativeSize;

    return {
        positiveSize,
        negativeSize,
        totalSize
    };
}
