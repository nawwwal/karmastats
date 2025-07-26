import { normalQuantile } from './utils';

/**
 * Calculates sample size for a case-control study
 * @param alpha Type I error rate (significance level)
 * @param power Statistical power (1 - beta)
 * @param ratio Ratio of controls to cases (n0/n1)
 * @param p0 Proportion of controls with exposure
 * @param p1 Proportion of cases with exposure
 * @returns Object containing sample sizes for cases and controls
 */
export function calculateCaseControlSampleSize(
    alpha: number,
    power: number,
    ratio: number,
    p0: number,
    p1: number
): { n_cases: number; n_controls: number } {
    const k = ratio;
    const zAlpha = normalQuantile(1 - alpha / 2);
    const zBeta = normalQuantile(power);

    const pBar = (p1 + k * p0) / (1 + k);
    const qBar = 1 - pBar;

    const numerator = Math.pow(
        zAlpha * Math.sqrt((1 + 1 / k) * pBar * qBar) +
        zBeta * Math.sqrt(p1 * (1 - p1) + (p0 * (1 - p0)) / k),
        2
    );

    const baseSize = numerator / Math.pow(p1 - p0, 2);

    // Continuity correction used in legacy HTML implementation
    const correctedSize = baseSize * (1 + 2 / (k + 1));

    const n_cases = Math.ceil(correctedSize);
    const n_controls = Math.ceil(correctedSize * k);

    return { n_cases, n_controls };
}

/**
 * Calculates sample size for a cohort study
 * @param alpha Type I error rate (significance level)
 * @param power Statistical power (1 - beta)
 * @param ratio Ratio of unexposed to exposed (n2/n1)
 * @param p1 Proportion of exposed with disease
 * @param p2 Proportion of unexposed with disease
 * @returns Object containing sample sizes for exposed and unexposed groups
 */
export function calculateCohortSampleSize(
    alpha: number,
    power: number,
    ratio: number,
    p1: number,
    p2: number
): { n_exposed: number; n_unexposed: number } {
    const k = ratio;
    const zAlpha = normalQuantile(1 - alpha / 2);
    const zBeta = normalQuantile(power);

    const pBar = (k * p1 + p2) / (k + 1);
    const qBar = 1 - pBar;

    const numerator = Math.pow(
        zAlpha * Math.sqrt((1 + 1 / k) * pBar * qBar) +
        zBeta * Math.sqrt(p1 * (1 - p1) + (p2 * (1 - p2)) / k),
        2
    );

    const baseSize = numerator / Math.pow(p1 - p2, 2);

    const n_exposed = Math.ceil(baseSize);
    const n_unexposed = Math.ceil(baseSize * k);

    return { n_exposed, n_unexposed };
}
