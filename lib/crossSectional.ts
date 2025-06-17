import { z } from 'zod';

const zScores: { [key: number]: number } = {
    80: 1.282, 85: 1.440, 90: 1.645, 95: 1.960, 99: 2.576, 99.9: 3.291
};

function getZScore(confidence: number): number {
    return zScores[confidence] || zScores[95];
}


// --- Schemas and Types ---

export const CrossSectionalSchema = z.object({
    prevalence: z.number().min(0.1).max(99.9),
    marginOfError: z.number().min(0.1).max(50),
    confidenceLevel: z.number().refine(val => [80, 90, 95, 99, 99.9].includes(val), {
        message: "Confidence level must be 80, 90, 95, 99, or 99.9"
    }),
    populationSize: z.number().positive().optional(),
    designEffect: z.number().min(1).default(1),
    nonResponseRate: z.number().min(0).max(100).default(10),
    clusteringEffect: z.number().min(0).max(1).default(0),
});

export type CrossSectionalInput = z.infer<typeof CrossSectionalSchema>;

export type CrossSectionalOutput = {
    baseSize: number;
    designAdjustedSize: number;
    populationAdjustedSize: number;
    clusterAdjustedSize: number;
    finalSize: number;
};


// --- Calculation Function ---

export function calculateCrossSectionalSampleSize(params: CrossSectionalInput): CrossSectionalOutput {
    const {
        prevalence,
        marginOfError,
        confidenceLevel,
        populationSize,
        designEffect,
        nonResponseRate,
        clusteringEffect
    } = params;

    const p = prevalence / 100;
    const e = marginOfError / 100;
    const z = getZScore(confidenceLevel);

    // 1. Base Sample Size (Cochran's formula)
    const baseSize = (Math.pow(z, 2) * p * (1 - p)) / Math.pow(e, 2);

    // 2. Adjust for Design Effect
    const designAdjustedSize = baseSize * designEffect;

    // 3. Adjust for Finite Population Correction
    let populationAdjustedSize = designAdjustedSize;
    if (populationSize) {
        populationAdjustedSize = (designAdjustedSize) / (1 + (designAdjustedSize - 1) / populationSize);
    }

    // 4. Adjust for Clustering Effect
    let clusterAdjustedSize = populationAdjustedSize;
    if (clusteringEffect > 0) {
        // Assuming average cluster size of 10 for demonstration as in legacy
        const avgClusterSize = 10;
        clusterAdjustedSize = populationAdjustedSize * (1 + (avgClusterSize - 1) * clusteringEffect);
    }

    // 5. Adjust for Non-Response Rate
    const finalSize = clusterAdjustedSize / (1 - (nonResponseRate / 100));

    return {
        baseSize: Math.ceil(baseSize),
        designAdjustedSize: Math.ceil(designAdjustedSize),
        populationAdjustedSize: Math.ceil(populationAdjustedSize),
        clusterAdjustedSize: Math.ceil(clusterAdjustedSize),
        finalSize: Math.ceil(finalSize)
    };
}
