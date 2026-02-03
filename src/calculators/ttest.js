// T-Test Calculator Logic

import { getConfidenceLevel, roundUp } from '../hooks/useCalculator';

// One-sample t-test
export function calculateOneSample(inputs) {
  const { mean, mu0, sd, alpha, power } = inputs;

  // Get Z values
  const zAlpha = getZFromAlpha(alpha);
  const zBeta = getZFromPower(power);

  // Effect size (Cohen's d)
  const effectSize = Math.abs(mean - mu0) / sd;

  // Sample size calculation: n = ((zα + zβ) / d)²
  const n = roundUp(Math.pow((zAlpha + zBeta) / effectSize, 2));

  const interpretation = `To detect a difference of ${Math.abs(mean - mu0).toFixed(2)} units from the null hypothesis mean of ${mu0} (effect size d = ${effectSize.toFixed(3)}), with ${(power * 100).toFixed(0)}% power at a ${(alpha * 100).toFixed(0)}% significance level (two-sided), you need ${n} participants.`;

  return {
    type: 'one-sample',
    studyType: 'T-Test - One Sample',
    method: 'One-sample t-test sample size',
    inputs: {
      'Expected Mean': mean,
      'Null Hypothesis Mean (μ₀)': mu0,
      'Standard Deviation': sd,
      'Significance Level (α)': alpha,
      'Power (1-β)': power
    },
    formula: 'n = ((Zα + Zβ) / d)²',
    formulaExplanation: 'Zα = Z-score for alpha | Zβ = Z-score for power | d = Effect size (Cohen\'s d)',
    steps: [
      { title: 'Calculate effect size (Cohen\'s d)', calc: `d = |${mean} - ${mu0}| / ${sd} = ${effectSize.toFixed(4)}` },
      { title: 'Get Z-score for alpha', calc: `Zα = ${zAlpha.toFixed(4)} (two-sided, α = ${alpha})` },
      { title: 'Get Z-score for power', calc: `Zβ = ${zBeta.toFixed(4)} (power = ${power})` },
      { title: 'Calculate sample size', calc: `n = ((${zAlpha.toFixed(4)} + ${zBeta.toFixed(4)}) / ${effectSize.toFixed(4)})² = ${n}` }
    ],
    results: {
      'Required Sample Size': n,
      "Effect Size (Cohen's d)": effectSize.toFixed(3),
      'Zα (two-sided)': zAlpha.toFixed(3)
    },
    interpretation,
    recommendations: [
      'Ensure the standard deviation estimate is reliable',
      'Consider adding 10-20% for potential dropouts',
      'Verify the expected mean is clinically meaningful',
      'Check assumptions of normality for t-test validity'
    ],
    reference: 'Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.'
  };
}

// Two-sample t-test (independent groups)
export function calculateTwoSample(inputs) {
  const { mean1, mean2, sd1, sd2, alpha, power, ratio } = inputs;

  const zAlpha = getZFromAlpha(alpha);
  const zBeta = getZFromPower(power);

  // Pooled standard deviation (assuming equal variances)
  const pooledSd = Math.sqrt((sd1 * sd1 + sd2 * sd2) / 2);

  // Effect size
  const effectSize = Math.abs(mean1 - mean2) / pooledSd;

  // Sample size per group (with allocation ratio)
  const k = ratio || 1;
  const nPerGroup = roundUp((Math.pow(zAlpha + zBeta, 2) * (1 + 1/k) * pooledSd * pooledSd) / Math.pow(mean1 - mean2, 2));
  const n1 = nPerGroup;
  const n2 = roundUp(nPerGroup * k);
  const totalN = n1 + n2;

  const interpretation = `To detect a difference of ${Math.abs(mean1 - mean2).toFixed(2)} between two groups (effect size d = ${effectSize.toFixed(3)}), with ${(power * 100).toFixed(0)}% power at a ${(alpha * 100).toFixed(0)}% significance level (two-sided), you need ${n1} participants in group 1 and ${n2} in group 2, for a total of ${totalN} participants.`;

  return {
    type: 'two-sample',
    studyType: 'T-Test - Two Independent Samples',
    method: 'Two-sample t-test sample size (equal variances)',
    inputs: {
      'Mean Group 1': mean1,
      'Mean Group 2': mean2,
      'SD Group 1': sd1,
      'SD Group 2': sd2,
      'Significance Level (α)': alpha,
      'Power (1-β)': power,
      'Allocation Ratio': `1:${k}`
    },
    formula: 'n₁ = (Zα + Zβ)² × (1 + 1/k) × σ² / (μ₁ - μ₂)²',
    formulaExplanation: 'Zα = Z-score for alpha | Zβ = Z-score for power | k = allocation ratio | σ = pooled SD',
    steps: [
      { title: 'Calculate pooled standard deviation', calc: `σ = √((${sd1}² + ${sd2}²) / 2) = ${pooledSd.toFixed(4)}` },
      { title: 'Calculate effect size', calc: `d = |${mean1} - ${mean2}| / ${pooledSd.toFixed(4)} = ${effectSize.toFixed(4)}` },
      { title: 'Get Z-scores', calc: `Zα = ${zAlpha.toFixed(4)}, Zβ = ${zBeta.toFixed(4)}` },
      { title: 'Calculate n per group', calc: `n₁ = ${n1}, n₂ = ${n2}` },
      { title: 'Total sample size', calc: `N = ${n1} + ${n2} = ${totalN}` }
    ],
    results: {
      'Group 1 (n₁)': n1,
      'Group 2 (n₂)': n2,
      'Total Sample Size': totalN
    },
    interpretation,
    recommendations: [
      'Consider using Welch\'s t-test if variances are unequal',
      'Plan for balanced groups if possible for maximum power',
      'Add contingency for dropouts (typically 10-20%)',
      'Verify effect size is clinically meaningful'
    ],
    reference: 'Chow, S. C., Shao, J., & Wang, H. (2008). Sample Size Calculations in Clinical Research (2nd ed.). Chapman and Hall/CRC.'
  };
}

// Paired t-test
export function calculatePaired(inputs) {
  const { meanDiff, sdDiff, alpha, power } = inputs;

  const zAlpha = getZFromAlpha(alpha);
  const zBeta = getZFromPower(power);

  // Effect size for paired data
  const effectSize = Math.abs(meanDiff) / sdDiff;

  // Sample size (number of pairs)
  const n = roundUp(Math.pow((zAlpha + zBeta) / effectSize, 2));

  const interpretation = `To detect a mean difference of ${meanDiff} (effect size d = ${effectSize.toFixed(3)}), with ${(power * 100).toFixed(0)}% power at a ${(alpha * 100).toFixed(0)}% significance level (two-sided), you need ${n} pairs of observations.`;

  return {
    type: 'paired',
    studyType: 'T-Test - Paired Samples',
    method: 'Paired t-test sample size',
    inputs: {
      'Expected Mean Difference': meanDiff,
      'SD of Differences': sdDiff,
      'Significance Level (α)': alpha,
      'Power (1-β)': power
    },
    formula: 'n = ((Zα + Zβ) / d)²',
    formulaExplanation: 'd = mean difference / SD of differences',
    steps: [
      { title: 'Calculate effect size', calc: `d = |${meanDiff}| / ${sdDiff} = ${effectSize.toFixed(4)}` },
      { title: 'Get Z-scores', calc: `Zα = ${zAlpha.toFixed(4)}, Zβ = ${zBeta.toFixed(4)}` },
      { title: 'Calculate number of pairs', calc: `n = ((${zAlpha.toFixed(4)} + ${zBeta.toFixed(4)}) / ${effectSize.toFixed(4)})² = ${n}` }
    ],
    results: {
      'Required Pairs': n,
      "Effect Size (Cohen's d)": effectSize.toFixed(3),
      'Total Observations': n * 2
    },
    interpretation,
    recommendations: [
      'SD of differences is typically smaller than SD of individual measurements',
      'Estimate SD from pilot data if available',
      'Consider correlation between paired observations',
      'Account for potential dropouts'
    ],
    reference: 'Rosner, B. (2015). Fundamentals of Biostatistics (8th ed.). Cengage Learning.'
  };
}

// Helper functions
function getZFromAlpha(alpha) {
  // Two-sided Z-score
  const alphaHalf = alpha / 2;
  return jStat.normal.inv(1 - alphaHalf, 0, 1);
}

function getZFromPower(power) {
  return jStat.normal.inv(power, 0, 1);
}

// Simple jStat replacement for normal distribution
const jStat = {
  normal: {
    inv: function(p, mean, sd) {
      // Approximation using rational function
      if (p <= 0) return -Infinity;
      if (p >= 1) return Infinity;
      if (p === 0.5) return mean;

      const a = [
        -3.969683028665376e+01,
        2.209460984245205e+02,
        -2.759285104469687e+02,
        1.383577518672690e+02,
        -3.066479806614716e+01,
        2.506628277459239e+00
      ];
      const b = [
        -5.447609879822406e+01,
        1.615858368580409e+02,
        -1.556989798598866e+02,
        6.680131188771972e+01,
        -1.328068155288572e+01
      ];
      const c = [
        -7.784894002430293e-03,
        -3.223964580411365e-01,
        -2.400758277161838e+00,
        -2.549732539343734e+00,
        4.374664141464968e+00,
        2.938163982698783e+00
      ];
      const d = [
        7.784695709041462e-03,
        3.224671290700398e-01,
        2.445134137142996e+00,
        3.754408661907416e+00
      ];

      const pLow = 0.02425;
      const pHigh = 1 - pLow;
      let q, r;

      if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p));
        return mean + sd * (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
          ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
      } else if (p <= pHigh) {
        q = p - 0.5;
        r = q * q;
        return mean + sd * (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
          (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
      } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return mean + sd * -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
          ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
      }
    }
  }
};

export default {
  calculateOneSample,
  calculateTwoSample,
  calculatePaired
};
