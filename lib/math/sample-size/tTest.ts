import { z } from 'zod';

const zScores: { [key: number]: number } = {
    50: 0.000, 55: 0.126, 60: 0.253, 65: 0.385, 70: 0.524,
    75: 0.674, 80: 0.842, 85: 1.036, 90: 1.282, 91: 1.341,
    92: 1.405, 93: 1.476, 94: 1.555, 95: 1.645, 96: 1.751,
    97: 1.881, 97.5: 1.960, 98: 2.054, 99: 2.326, 99.5: 2.576,
    99.9: 3.090, 99.95: 3.291, 99.99: 3.719
};

/**
 * Gets the Z-score for a given confidence level.
 * @param confidence The confidence level (e.g., 95 for 95%).
 * @returns The corresponding Z-score.
 */
function getZScore(confidence: number): number {
    return zScores[confidence] || zScores[95];
}

/**
 * Interprets the effect size (Cohen's d).
 * @param d The Cohen's d value.
 * @returns A string interpretation of the effect size.
 */
function interpretEffectSize(d: number): string {
    const absD = Math.abs(d);
    if (absD < 0.2) return 'Negligible';
    if (absD < 0.5) return 'Small';
    if (absD < 0.8) return 'Medium';
    return 'Large';
}

export const IndependentSampleSizeSchema = z.object({
    group1Mean: z.number(),
    group2Mean: z.number(),
    pooledSD: z.number().positive('Pooled standard deviation must be positive'),
    allocationRatio: z.number().positive('Allocation ratio must be positive'),
    significanceLevel: z.number().min(0).max(100),
    power: z.number().min(0).max(100),
    dropoutRate: z.number().min(0).max(100),
});

export type IndependentSampleSizeInput = z.infer<typeof IndependentSampleSizeSchema>;
export type IndependentSampleSizeOutput = {
    group1Size: number;
    group2Size: number;
    totalSize: number;
    cohensD: number;
    effectSizeInterpretation: string;
};

/**
 * Calculates sample size for an independent samples t-test.
 * @param params - The input parameters for the calculation.
 * @returns The calculated sample sizes and effect size.
 */
export function calculateIndependentSampleSize(params: IndependentSampleSizeInput): IndependentSampleSizeOutput {
    const { group1Mean, group2Mean, pooledSD, allocationRatio, significanceLevel, power, dropoutRate } = params;

    const meanDifference = Math.abs(group1Mean - group2Mean);
    const cohensD = meanDifference / pooledSD;

    const zAlpha = getZScore(100 - significanceLevel / 2);
    const zBeta = getZScore(power);

    // Fleiss, J. L., Levin, B., & Paik, M. C. (2003). Statistical Methods for Rates and Proportions. John Wiley & Sons.
    const n1 = ( (1 + 1/allocationRatio) * Math.pow(pooledSD, 2) * Math.pow(zAlpha + zBeta, 2) ) / Math.pow(meanDifference, 2)
    const n2 = n1 * allocationRatio;

    const n1_adjusted = Math.ceil(n1 / (1 - dropoutRate / 100));
    const n2_adjusted = Math.ceil(n2 / (1 - dropoutRate / 100));

    return {
        group1Size: n1_adjusted,
        group2Size: n2_adjusted,
        totalSize: n1_adjusted + n2_adjusted,
        cohensD,
        effectSizeInterpretation: interpretEffectSize(cohensD)
    };
}


export const PairedSampleSizeSchema = z.object({
    meanDifference: z.number(),
    sdDifference: z.number().positive('Standard deviation of differences must be positive'),
    correlation: z.number().min(-1).max(1),
    significanceLevel: z.number().min(0).max(100),
    power: z.number().min(0).max(100),
    dropoutRate: z.number().min(0).max(100),
});

export type PairedSampleSizeInput = z.infer<typeof PairedSampleSizeSchema>;
export type PairedSampleSizeOutput = {
    pairsSize: number;
    totalObservations: number;
    cohensD: number;
    effectSizeInterpretation: string;
};

/**
 * Calculates sample size for a paired samples t-test.
 * @param params - The input parameters for the calculation.
 * @returns The calculated sample size and effect size.
 */
export function calculatePairedSampleSize(params: PairedSampleSizeInput): PairedSampleSizeOutput {
    const { meanDifference, sdDifference, correlation, significanceLevel, power, dropoutRate } = params;

    const cohensD = Math.abs(meanDifference) / sdDifference;

    const zAlpha = getZScore(100 - significanceLevel / 2);
    const zBeta = getZScore(power);

    // Chow, S. C., Wang, H., & Shao, J. (2008). Sample Size Calculations in Clinical Research. Chapman and Hall/CRC.
    const n = Math.pow(zAlpha + zBeta, 2) / Math.pow(cohensD, 2);
    const n_adjusted = Math.ceil(n / (1 - dropoutRate / 100));

    return {
        pairsSize: n_adjusted,
        totalObservations: n_adjusted * 2,
        cohensD,
        effectSizeInterpretation: interpretEffectSize(cohensD)
    };
}


export const OneSampleSampleSizeSchema = z.object({
    sampleMean: z.number(),
    populationMean: z.number(),
    populationSD: z.number().positive('Population standard deviation must be positive'),
    significanceLevel: z.number().min(0).max(100),
    power: z.number().min(0).max(100),
    dropoutRate: z.number().min(0).max(100),
});

export type OneSampleSampleSizeInput = z.infer<typeof OneSampleSampleSizeSchema>;
export type OneSampleSampleSizeOutput = {
    sampleSize: number;
    cohensD: number;
    effectSizeInterpretation: string;
};

/**
 * Calculates sample size for a one-sample t-test.
 * @param params - The input parameters for the calculation.
 * @returns The calculated sample size and effect size.
 */
export function calculateOneSampleSampleSize(params: OneSampleSampleSizeInput): OneSampleSampleSizeOutput {
    const { sampleMean, populationMean, populationSD, significanceLevel, power, dropoutRate } = params;

    const meanDifference = Math.abs(sampleMean - populationMean);
    const cohensD = meanDifference / populationSD;

    const zAlpha = getZScore(100 - significanceLevel / 2);
    const zBeta = getZScore(power);

    const n = Math.pow(zAlpha + zBeta, 2) / Math.pow(cohensD, 2);
    const n_adjusted = Math.ceil(n / (1 - dropoutRate / 100));

    return {
        sampleSize: n_adjusted,
        cohensD,
        effectSizeInterpretation: interpretEffectSize(cohensD)
    };
}
