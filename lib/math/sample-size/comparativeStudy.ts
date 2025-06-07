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
    // Calculate odds ratio
    const oddsRatio = (p1 * (1 - p0)) / (p0 * (1 - p1));

    // Calculate average proportion of exposure
    const p_bar = (p0 + ratio * p1) / (1 + ratio);

    // Calculate standard error
    const se = Math.sqrt(
        (1 / (p0 * (1 - p0))) + (1 / (p1 * (1 - p1)))
    );

    // Calculate z-scores
    const z_alpha = normalQuantile(1 - alpha / 2);
    const z_beta = normalQuantile(power);

    // Calculate sample size for cases
    const n_cases = Math.ceil(
        (Math.pow(z_alpha + z_beta, 2) * p_bar * (1 - p_bar) * (1 + ratio)) /
        (ratio * Math.pow(p1 - p0, 2))
    );

    // Calculate sample size for controls
    const n_controls = Math.ceil(n_cases * ratio);

    return {
        n_cases,
        n_controls
    };
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
    // Calculate risk ratio
    const riskRatio = p1 / p2;

    // Calculate average proportion of disease
    const p_bar = (p1 + ratio * p2) / (1 + ratio);

    // Calculate standard error
    const se = Math.sqrt(
        (1 / (p1 * (1 - p1))) + (1 / (p2 * (1 - p2)))
    );

    // Calculate z-scores
    const z_alpha = normalQuantile(1 - alpha / 2);
    const z_beta = normalQuantile(power);

    // Calculate sample size for exposed group
    const n_exposed = Math.ceil(
        (Math.pow(z_alpha + z_beta, 2) * p_bar * (1 - p_bar) * (1 + ratio)) /
        (ratio * Math.pow(p1 - p2, 2))
    );

    // Calculate sample size for unexposed group
    const n_unexposed = Math.ceil(n_exposed * ratio);

    return {
        n_exposed,
        n_unexposed
    };
}
