// Comparative Studies Calculator Logic
// Case-Control and Cohort Studies

import { roundUp } from '../hooks/useCalculator';

// Inverse normal CDF for Z-score calculations
function normalInv(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
    1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00
  ];
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
    6.680131188771972e+01, -1.328068155288572e+01
  ];
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
    -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00
  ];
  const d = [
    7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
    3.754408661907416e+00
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q, r;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

// Case-Control Study - Odds Ratio
export function calculateCaseControl(inputs) {
  const { p0, or, alpha, power, ratio } = inputs;

  // Exposure proportion in controls
  const p0Val = parseFloat(p0);
  // Expected odds ratio
  const orVal = parseFloat(or);
  // Calculate exposure proportion in cases from OR
  const p1 = (p0Val * orVal) / (1 - p0Val + p0Val * orVal);

  // Z-scores
  const zAlpha = normalInv(1 - parseFloat(alpha) / 2);
  const zBeta = normalInv(parseFloat(power));

  // Pooled proportion
  const k = parseFloat(ratio) || 1;
  const pBar = (p1 + k * p0Val) / (1 + k);

  // Fleiss formula for case-control
  const term1 = zAlpha * Math.sqrt((1 + 1/k) * pBar * (1 - pBar));
  const term2 = zBeta * Math.sqrt((p1 * (1 - p1)) + (p0Val * (1 - p0Val)) / k);
  const nCases = roundUp(Math.pow(term1 + term2, 2) / Math.pow(p1 - p0Val, 2));
  const nControls = roundUp(nCases * k);
  const totalN = nCases + nControls;

  const interpretation = `To detect an odds ratio of ${orVal.toFixed(2)} with ${(parseFloat(power) * 100).toFixed(0)}% power at α = ${parseFloat(alpha)}, comparing exposure proportions of ${(p1 * 100).toFixed(1)}% in cases vs ${(p0Val * 100).toFixed(1)}% in controls, you need ${nCases} cases and ${nControls} controls (total N = ${totalN}). The case-to-control ratio is 1:${k}.`;

  return {
    type: 'case-control',
    studyType: 'Case-Control Study',
    method: 'Fleiss formula for unmatched case-control',
    inputs: {
      'Exposure in Controls (P₀)': `${(p0Val * 100).toFixed(1)}%`,
      'Expected Odds Ratio': orVal.toFixed(2),
      'Exposure in Cases (P₁)': `${(p1 * 100).toFixed(1)}%`,
      'Significance Level (α)': alpha,
      'Power (1-β)': `${(parseFloat(power) * 100).toFixed(0)}%`,
      'Case:Control Ratio': `1:${k}`
    },
    formula: 'n = [Zα√((1+1/k)P̄Q̄) + Zβ√(P₁Q₁+P₀Q₀/k)]² / (P₁-P₀)²',
    formulaExplanation: 'P₀ = exposure in controls | P₁ = exposure in cases | OR = odds ratio | k = control:case ratio',
    steps: [
      { title: 'Calculate exposure in cases from OR', calc: `P₁ = (${p0Val} × ${orVal}) / (1 - ${p0Val} + ${p0Val} × ${orVal}) = ${p1.toFixed(4)}` },
      { title: 'Calculate pooled proportion', calc: `P̄ = (${p1.toFixed(4)} + ${k} × ${p0Val}) / (1 + ${k}) = ${pBar.toFixed(4)}` },
      { title: 'Get Z-scores', calc: `Zα = ${zAlpha.toFixed(4)}, Zβ = ${zBeta.toFixed(4)}` },
      { title: 'Calculate sample size', calc: `n (cases) = ${nCases}, n (controls) = ${nControls}` },
      { title: 'Total sample size', calc: `N = ${nCases} + ${nControls} = ${totalN}` }
    ],
    results: {
      'Cases Required': nCases,
      'Controls Required': nControls,
      'Total Sample Size': totalN
    },
    interpretation,
    recommendations: [
      'Verify exposure prevalence in controls from literature or pilot data',
      'Consider matched case-control design for better confounding control',
      'Plan for response rate and data quality issues',
      'Document case definition criteria clearly'
    ],
    reference: 'Fleiss, J. L., Levin, B., & Paik, M. C. (2003). Statistical Methods for Rates and Proportions (3rd ed.). Wiley.'
  };
}

// Cohort Study - Relative Risk
export function calculateCohort(inputs) {
  const { p0, rr, alpha, power, ratio } = inputs;

  const p0Val = parseFloat(p0);
  const rrVal = parseFloat(rr);
  const p1 = p0Val * rrVal; // Incidence in exposed group

  if (p1 > 1) {
    throw new Error('Calculated incidence in exposed group exceeds 100%. Please check your inputs.');
  }

  const zAlpha = normalInv(1 - parseFloat(alpha) / 2);
  const zBeta = normalInv(parseFloat(power));

  const k = parseFloat(ratio) || 1;
  const pBar = (p1 + k * p0Val) / (1 + k);

  // Kelsey formula for cohort study
  const term1 = zAlpha * Math.sqrt((1 + 1/k) * pBar * (1 - pBar));
  const term2 = zBeta * Math.sqrt((p1 * (1 - p1)) + (p0Val * (1 - p0Val)) / k);
  const nExposed = roundUp(Math.pow(term1 + term2, 2) / Math.pow(p1 - p0Val, 2));
  const nUnexposed = roundUp(nExposed * k);
  const totalN = nExposed + nUnexposed;

  const interpretation = `To detect a relative risk of ${rrVal.toFixed(2)} with ${(parseFloat(power) * 100).toFixed(0)}% power at α = ${parseFloat(alpha)}, comparing incidence of ${(p1 * 100).toFixed(1)}% in exposed vs ${(p0Val * 100).toFixed(1)}% in unexposed, you need ${nExposed} exposed and ${nUnexposed} unexposed participants (total N = ${totalN}).`;

  return {
    type: 'cohort',
    studyType: 'Cohort Study',
    method: 'Kelsey formula for cohort study',
    inputs: {
      'Incidence in Unexposed (P₀)': `${(p0Val * 100).toFixed(1)}%`,
      'Expected Relative Risk': rrVal.toFixed(2),
      'Incidence in Exposed (P₁)': `${(p1 * 100).toFixed(1)}%`,
      'Significance Level (α)': alpha,
      'Power (1-β)': `${(parseFloat(power) * 100).toFixed(0)}%`,
      'Unexposed:Exposed Ratio': `${k}:1`
    },
    formula: 'n = [Zα√((1+1/k)P̄Q̄) + Zβ√(P₁Q₁+P₀Q₀/k)]² / (P₁-P₀)²',
    formulaExplanation: 'P₀ = incidence in unexposed | P₁ = incidence in exposed | RR = relative risk | k = ratio',
    steps: [
      { title: 'Calculate incidence in exposed from RR', calc: `P₁ = ${p0Val} × ${rrVal} = ${p1.toFixed(4)}` },
      { title: 'Calculate pooled proportion', calc: `P̄ = (${p1.toFixed(4)} + ${k} × ${p0Val}) / (1 + ${k}) = ${pBar.toFixed(4)}` },
      { title: 'Get Z-scores', calc: `Zα = ${zAlpha.toFixed(4)}, Zβ = ${zBeta.toFixed(4)}` },
      { title: 'Calculate sample size', calc: `n (exposed) = ${nExposed}, n (unexposed) = ${nUnexposed}` },
      { title: 'Total sample size', calc: `N = ${nExposed} + ${nUnexposed} = ${totalN}` }
    ],
    results: {
      'Exposed Group': nExposed,
      'Unexposed Group': nUnexposed,
      'Total Sample Size': totalN
    },
    interpretation,
    recommendations: [
      'Ensure adequate follow-up time to observe outcomes',
      'Plan for loss to follow-up (add 10-20% to sample)',
      'Consider competing risks in survival analysis',
      'Document exposure measurement methods'
    ],
    reference: 'Kelsey, J. L., Whittemore, A. S., Evans, A. S., & Thompson, W. D. (1996). Methods in Observational Epidemiology (2nd ed.). Oxford University Press.'
  };
}

// Cross-sectional Comparison (Two Proportions)
export function calculateCrossSectional(inputs) {
  const { p1, p2, alpha, power, ratio } = inputs;

  const p1Val = parseFloat(p1);
  const p2Val = parseFloat(p2);

  const zAlpha = normalInv(1 - parseFloat(alpha) / 2);
  const zBeta = normalInv(parseFloat(power));

  const k = parseFloat(ratio) || 1;
  const pBar = (p1Val + k * p2Val) / (1 + k);

  // Sample size formula for two proportions
  const term1 = zAlpha * Math.sqrt((1 + 1/k) * pBar * (1 - pBar));
  const term2 = zBeta * Math.sqrt((p1Val * (1 - p1Val)) + (p2Val * (1 - p2Val)) / k);
  const n1 = roundUp(Math.pow(term1 + term2, 2) / Math.pow(p1Val - p2Val, 2));
  const n2 = roundUp(n1 * k);
  const totalN = n1 + n2;

  const diffPct = Math.abs((p1Val - p2Val) * 100).toFixed(1);
  const interpretation = `To detect a difference of ${diffPct}% between proportions (${(p1Val * 100).toFixed(1)}% vs ${(p2Val * 100).toFixed(1)}%) with ${(parseFloat(power) * 100).toFixed(0)}% power at α = ${parseFloat(alpha)}, you need ${n1} participants in group 1 and ${n2} in group 2 (total N = ${totalN}).`;

  return {
    type: 'cross-sectional',
    studyType: 'Cross-sectional Comparison',
    method: 'Two-proportion comparison',
    inputs: {
      'Proportion Group 1 (P₁)': `${(p1Val * 100).toFixed(1)}%`,
      'Proportion Group 2 (P₂)': `${(p2Val * 100).toFixed(1)}%`,
      'Difference': `${diffPct}%`,
      'Significance Level (α)': alpha,
      'Power (1-β)': `${(parseFloat(power) * 100).toFixed(0)}%`,
      'Allocation Ratio': `1:${k}`
    },
    formula: 'n = [Zα√((1+1/k)P̄Q̄) + Zβ√(P₁Q₁+P₂Q₂/k)]² / (P₁-P₂)²',
    formulaExplanation: 'P₁, P₂ = proportions in each group | k = allocation ratio',
    steps: [
      { title: 'Calculate difference in proportions', calc: `|P₁ - P₂| = |${p1Val} - ${p2Val}| = ${Math.abs(p1Val - p2Val).toFixed(4)}` },
      { title: 'Calculate pooled proportion', calc: `P̄ = (${p1Val} + ${k} × ${p2Val}) / (1 + ${k}) = ${pBar.toFixed(4)}` },
      { title: 'Get Z-scores', calc: `Zα = ${zAlpha.toFixed(4)}, Zβ = ${zBeta.toFixed(4)}` },
      { title: 'Calculate sample sizes', calc: `n₁ = ${n1}, n₂ = ${n2}` },
      { title: 'Total sample size', calc: `N = ${n1} + ${n2} = ${totalN}` }
    ],
    results: {
      'Group 1': n1,
      'Group 2': n2,
      'Total Sample Size': totalN
    },
    interpretation,
    recommendations: [
      'Use stratified random sampling if population is heterogeneous',
      'Consider design effect if cluster sampling is used',
      'Plan for non-response adjustment',
      'Ensure consistent measurement across groups'
    ],
    reference: 'Fleiss, J. L., Levin, B., & Paik, M. C. (2003). Statistical Methods for Rates and Proportions (3rd ed.). Wiley.'
  };
}

export default {
  calculateCaseControl,
  calculateCohort,
  calculateCrossSectional
};
