import { z } from 'zod';

const zScores: { [key: number]: number } = {
    80: 0.842, 85: 1.036, 90: 1.282, 95: 1.645, 97.5: 1.96, 99: 2.326, 99.5: 2.576
};

function getZScore(confidence: number): number {
    return zScores[confidence] || zScores[95];
}

// --- Schemas and Types ---

// 1. Superiority Trial - Binary Outcome
export const SuperiorityBinarySchema = z.object({
    controlRate: z.number().min(0.1).max(99.9),
    treatmentRate: z.number().min(0.1).max(99.9),
    alpha: z.enum(['1', '5', '10']).transform(val => Number(val)),
    power: z.enum(['80', '85', '90', '95']).transform(val => Number(val)),
    allocationRatio: z.number().positive(),
    dropoutRate: z.number().min(0).max(99.9, 'Dropout rate must be less than 100'),
}).refine((data: { treatmentRate: number; controlRate: number; }) => data.treatmentRate > data.controlRate, {
    message: "Treatment rate must be greater than control rate.",
    path: ["treatmentRate"],
});

export type SuperiorityBinaryInput = z.infer<typeof SuperiorityBinarySchema>;
export type SuperiorityBinaryOutput = {
    treatmentSize: number;
    controlSize: number;
    totalSize: number;
    nnt: number;
};

// 2. Superiority Trial - Continuous Outcome
export const SuperiorityContinuousSchema = z.object({
    meanDifference: z.number().positive(),
    stdDev: z.number().positive(),
    alpha: z.enum(['1', '5', '10']).transform(val => Number(val)),
    power: z.enum(['80', '85', '90', '95']).transform(val => Number(val)),
    allocationRatio: z.number().positive(),
    dropoutRate: z.number().min(0).max(99.9, 'Dropout rate must be less than 100'),
});

export type SuperiorityContinuousInput = z.infer<typeof SuperiorityContinuousSchema>;
export type SuperiorityContinuousOutput = {
    treatmentSize: number;
    controlSize: number;
    totalSize: number;
    effectSize: number;
};

// 3. Non-Inferiority Trial
export const NonInferioritySchema = z.object({
    controlRate: z.number().min(0.1).max(99.9),
    treatmentRate: z.number().min(0.1).max(99.9),
    margin: z.number().positive(),
    alpha: z.enum(['1', '5', '10']).transform(val => Number(val)),
    power: z.enum(['80', '85', '90', '95']).transform(val => Number(val)),
    allocationRatio: z.number().positive(),
    dropoutRate: z.number().min(0).max(99.9, 'Dropout rate must be less than 100'),
});

export type NonInferiorityInput = z.infer<typeof NonInferioritySchema>;
export type NonInferiorityOutput = {
    treatmentSize: number;
    controlSize: number;
    totalSize: number;
};

// 4. Equivalence Trial
export const EquivalenceSchema = z.object({
    referenceRate: z.number().min(0.1).max(99.9),
    testRate: z.number().min(0.1).max(99.9),
    margin: z.number().positive(),
    alpha: z.enum(['1', '5', '10']).transform(val => Number(val)),
    power: z.enum(['80', '85', '90', '95']).transform(val => Number(val)),
    allocationRatio: z.number().positive(),
    dropoutRate: z.number().min(0).max(99.9, 'Dropout rate must be less than 100'),
}).refine((data: { margin: number; testRate: number; referenceRate: number; }) => data.margin > Math.abs(data.testRate - data.referenceRate), {
    message: "Equivalence margin must be larger than the expected difference.",
    path: ["margin"],
});

export type EquivalenceInput = z.infer<typeof EquivalenceSchema>;
export type EquivalenceOutput = {
    testSize: number;
    referenceSize: number;
    totalSize: number;
};


// --- Calculation Functions ---

export function calculateSuperiorityBinary(params: SuperiorityBinaryInput): SuperiorityBinaryOutput {
    const { controlRate, treatmentRate, alpha, power, allocationRatio, dropoutRate } = params;
    const zAlpha = getZScore(100 - alpha / 2);
    const zBeta = getZScore(power);
    const p1 = treatmentRate / 100;
    const p0 = controlRate / 100;
    const r = allocationRatio;

    const term1 = Math.sqrt(((r + 1) / r) * ((p0 + r * p1) / (1 + r)) * (1 - ((p0 + r * p1) / (1 + r))));
    const term2 = Math.sqrt((p1 * (1 - p1)) / r + p0 * (1 - p0));
    const n0 = Math.pow((zAlpha * term1 + zBeta * term2) / (p1 - p0), 2);
    const n1 = r * n0;

    const controlSize = Math.ceil(n0 / (1 - dropoutRate / 100));
    const treatmentSize = Math.ceil(n1 / (1 - dropoutRate / 100));
    const nnt = 1 / (p1 - p0);

    return { controlSize, treatmentSize, totalSize: controlSize + treatmentSize, nnt };
}

export function calculateSuperiorityContinuous(params: SuperiorityContinuousInput): SuperiorityContinuousOutput {
    const { meanDifference, stdDev, alpha, power, allocationRatio, dropoutRate } = params;
    const zAlpha = getZScore(100 - alpha / 2);
    const zBeta = getZScore(power);
    const r = allocationRatio;

    const n0 = ((r + 1) / r) * Math.pow(stdDev * (zAlpha + zBeta) / meanDifference, 2);
    const n1 = r * n0;

    const controlSize = Math.ceil(n0 / (1 - dropoutRate / 100));
    const treatmentSize = Math.ceil(n1 / (1 - dropoutRate / 100));
    const effectSize = meanDifference / stdDev;

    return { controlSize, treatmentSize, totalSize: controlSize + treatmentSize, effectSize };
}

export function calculateNonInferiority(params: NonInferiorityInput): NonInferiorityOutput {
    const { controlRate, treatmentRate, margin, alpha, power, allocationRatio, dropoutRate } = params;
    const zAlpha = getZScore(100 - alpha); // One-sided
    const zBeta = getZScore(power);
    const p_c = controlRate / 100;
    const p_t = treatmentRate / 100;
    const m = margin / 100;
    const r = allocationRatio;

    const term1 = zAlpha * Math.sqrt(p_t * (1 - p_t) / r + p_c * (1 - p_c));
    const term2 = zBeta * Math.sqrt(p_t * (1 - p_t) / r + p_c * (1 - p_c));
    const n_c = Math.pow((term1 + term2) / (Math.abs(p_t - p_c) - m), 2);
    const n_t = r * n_c;

    const controlSize = Math.ceil(n_c / (1 - dropoutRate / 100));
    const treatmentSize = Math.ceil(n_t / (1 - dropoutRate / 100));

    return { controlSize, treatmentSize, totalSize: controlSize + treatmentSize };
}

export function calculateEquivalence(params: EquivalenceInput): EquivalenceOutput {
    const { referenceRate, testRate, margin, alpha, power, allocationRatio, dropoutRate } = params;
    const zAlpha = getZScore(100 - alpha); // One-sided alpha for two-sided test
    const zBeta = getZScore(power);
    const p_r = referenceRate / 100;
    const p_t = testRate / 100;
    const m = margin / 100;
    const r = allocationRatio;

    const term1 = zAlpha * Math.sqrt((p_t * (1 - p_t)) / r + p_r * (1 - p_r));
    const term2 = zBeta * Math.sqrt((p_t * (1 - p_t)) / r + p_r * (1 - p_r));
    const n_r = Math.pow((term1 + term2) / (Math.abs(p_t - p_r) - m), 2);
    const n_t = r * n_r;

    const referenceSize = Math.ceil(n_r / (1 - dropoutRate / 100));
    const testSize = Math.ceil(n_t / (1 - dropoutRate / 100));

    return { referenceSize, testSize, totalSize: referenceSize + testSize };
}
