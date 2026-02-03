// Meta-Analysis Calculator Logic
// Fixed Effects, Random Effects, Heterogeneity

import { roundUp } from '../hooks/useCalculator';

function normalInv(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q, r;
  if (p < pLow) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  else if (p <= pHigh) { q = p - 0.5; r = q * q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
  else { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
}

// Fixed Effects Meta-Analysis
export function calculateFixedEffects(inputs) {
  const { effects, variances, studyNames } = inputs;

  const effectsArr = effects.split(',').map(e => parseFloat(e.trim()));
  const variancesArr = variances.split(',').map(v => parseFloat(v.trim()));
  const names = studyNames ? studyNames.split(',').map(n => n.trim()) : effectsArr.map((_, i) => `Study ${i + 1}`);

  const k = effectsArr.length;

  // Weights (inverse variance)
  const weights = variancesArr.map(v => 1 / v);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Fixed effect pooled estimate
  const pooledEffect = effectsArr.reduce((sum, e, i) => sum + e * weights[i], 0) / totalWeight;

  // Variance of pooled estimate
  const pooledVariance = 1 / totalWeight;
  const pooledSE = Math.sqrt(pooledVariance);

  // 95% CI
  const ciLower = pooledEffect - 1.96 * pooledSE;
  const ciUpper = pooledEffect + 1.96 * pooledSE;

  // Z-test
  const zStat = pooledEffect / pooledSE;
  const pValue = 2 * (1 - 0.5 * (1 + Math.sign(zStat) * (1 - Math.exp(-2 * zStat * zStat / Math.PI))));

  // Q statistic for heterogeneity
  const Q = effectsArr.reduce((sum, e, i) => sum + weights[i] * Math.pow(e - pooledEffect, 2), 0);
  const dfQ = k - 1;
  const I2 = Math.max(0, (Q - dfQ) / Q * 100);

  return {
    studyType: 'Meta-Analysis',
    type: 'fixed-effects',
    method: 'Fixed Effects (Inverse Variance)',
    inputs: {
      'Number of Studies': k,
      'Effect Sizes': effects,
      'Variances': variances
    },
    formula: 'theta_FE = Sum(w_i × theta_i) / Sum(w_i), where w_i = 1/Var_i',
    formulaExplanation: 'Weighted average of effect sizes using inverse variance weights',
    steps: [
      { title: 'Calculate Weights', calc: `w_i = 1/Var: [${weights.map(w => roundUp(w, 3)).join(', ')}]` },
      { title: 'Sum of Weights', calc: `Sum(w) = ${roundUp(totalWeight, 4)}` },
      { title: 'Pooled Effect Size', calc: `theta = ${effectsArr.map((e, i) => `${e}×${roundUp(weights[i], 2)}`).join(' + ')} / ${roundUp(totalWeight, 2)} = ${roundUp(pooledEffect, 4)}` },
      { title: 'Standard Error', calc: `SE = sqrt(1/${roundUp(totalWeight, 2)}) = ${roundUp(pooledSE, 4)}` },
      { title: 'Q Statistic', calc: `Q = ${roundUp(Q, 3)}, df = ${dfQ}, I² = ${roundUp(I2, 1)}%` }
    ],
    results: {
      'Pooled Effect': roundUp(pooledEffect, 4),
      'Standard Error': roundUp(pooledSE, 4),
      '95% CI Lower': roundUp(ciLower, 4),
      '95% CI Upper': roundUp(ciUpper, 4),
      'Z-statistic': roundUp(zStat, 3),
      'Q Statistic': roundUp(Q, 3),
      'I² (%)': roundUp(I2, 1)
    },
    interpretation: `The fixed effects pooled estimate is ${roundUp(pooledEffect, 4)} (95% CI: ${roundUp(ciLower, 4)} to ${roundUp(ciUpper, 4)}). ${I2 < 25 ? 'Heterogeneity is low (I² < 25%).' : I2 < 75 ? 'Moderate heterogeneity present (25% ≤ I² < 75%). Consider random effects model.' : 'Substantial heterogeneity (I² ≥ 75%). Random effects model recommended.'}`,
    recommendations: [
      I2 >= 25 ? 'Consider using random effects model due to heterogeneity' : 'Fixed effects appropriate given low heterogeneity',
      'Check for publication bias (funnel plot, Egger\'s test)',
      'Perform sensitivity analysis excluding outliers',
      'Report both fixed and random effects if heterogeneity present'
    ],
    reference: 'Borenstein, M., Hedges, L. V., Higgins, J. P., & Rothstein, H. R. (2009). Introduction to Meta-Analysis. Wiley.'
  };
}

// Random Effects Meta-Analysis (DerSimonian-Laird)
export function calculateRandomEffects(inputs) {
  const { effects, variances, studyNames } = inputs;

  const effectsArr = effects.split(',').map(e => parseFloat(e.trim()));
  const variancesArr = variances.split(',').map(v => parseFloat(v.trim()));
  const names = studyNames ? studyNames.split(',').map(n => n.trim()) : effectsArr.map((_, i) => `Study ${i + 1}`);

  const k = effectsArr.length;

  // Fixed effects weights
  const wFE = variancesArr.map(v => 1 / v);
  const sumWFE = wFE.reduce((sum, w) => sum + w, 0);

  // Fixed effects estimate (needed for Q)
  const thetaFE = effectsArr.reduce((sum, e, i) => sum + e * wFE[i], 0) / sumWFE;

  // Q statistic
  const Q = effectsArr.reduce((sum, e, i) => sum + wFE[i] * Math.pow(e - thetaFE, 2), 0);
  const dfQ = k - 1;

  // DerSimonian-Laird tau² estimate
  const C = sumWFE - wFE.reduce((sum, w) => sum + w * w, 0) / sumWFE;
  const tau2 = Math.max(0, (Q - dfQ) / C);
  const tau = Math.sqrt(tau2);

  // Random effects weights
  const wRE = variancesArr.map(v => 1 / (v + tau2));
  const sumWRE = wRE.reduce((sum, w) => sum + w, 0);

  // Random effects pooled estimate
  const thetaRE = effectsArr.reduce((sum, e, i) => sum + e * wRE[i], 0) / sumWRE;

  // Variance and CI
  const varRE = 1 / sumWRE;
  const seRE = Math.sqrt(varRE);
  const ciLower = thetaRE - 1.96 * seRE;
  const ciUpper = thetaRE + 1.96 * seRE;

  // I²
  const I2 = Math.max(0, (Q - dfQ) / Q * 100);

  // Prediction interval
  const tCrit = 2.365; // approx for df=7
  const piLower = thetaRE - tCrit * Math.sqrt(varRE + tau2);
  const piUpper = thetaRE + tCrit * Math.sqrt(varRE + tau2);

  return {
    studyType: 'Meta-Analysis',
    type: 'random-effects',
    method: 'Random Effects (DerSimonian-Laird)',
    inputs: {
      'Number of Studies': k,
      'Effect Sizes': effects,
      'Variances': variances
    },
    formula: 'theta_RE = Sum(w*_i × theta_i) / Sum(w*_i), where w*_i = 1/(Var_i + tau²)',
    formulaExplanation: 'DerSimonian-Laird random effects model accounting for between-study variance (tau²)',
    steps: [
      { title: 'Calculate Q Statistic', calc: `Q = ${roundUp(Q, 3)}` },
      { title: 'Estimate tau²', calc: `tau² = max(0, (Q - df)/C) = max(0, (${roundUp(Q, 2)} - ${dfQ})/${roundUp(C, 2)}) = ${roundUp(tau2, 4)}` },
      { title: 'Random Effects Weights', calc: `w*_i = 1/(Var + ${roundUp(tau2, 4)}): [${wRE.map(w => roundUp(w, 3)).join(', ')}]` },
      { title: 'Pooled Estimate', calc: `theta_RE = ${roundUp(thetaRE, 4)}` },
      { title: 'Standard Error', calc: `SE = ${roundUp(seRE, 4)}` }
    ],
    results: {
      'Pooled Effect': roundUp(thetaRE, 4),
      'Standard Error': roundUp(seRE, 4),
      '95% CI Lower': roundUp(ciLower, 4),
      '95% CI Upper': roundUp(ciUpper, 4),
      'tau² (Between-study Var)': roundUp(tau2, 4),
      'tau': roundUp(tau, 4),
      'I² (%)': roundUp(I2, 1),
      'Q Statistic': roundUp(Q, 3)
    },
    interpretation: `The random effects pooled estimate is ${roundUp(thetaRE, 4)} (95% CI: ${roundUp(ciLower, 4)} to ${roundUp(ciUpper, 4)}). Between-study heterogeneity tau² = ${roundUp(tau2, 4)}. I² = ${roundUp(I2, 1)}%, indicating ${I2 < 25 ? 'low' : I2 < 75 ? 'moderate' : 'substantial'} heterogeneity.`,
    recommendations: [
      tau2 > 0 ? 'Between-study variance present; random effects appropriate' : 'No between-study variance; fixed effects may suffice',
      'Investigate sources of heterogeneity with subgroup or meta-regression',
      'Consider REML estimator for tau² as alternative to DerSimonian-Laird',
      'Report prediction interval for clinical interpretation'
    ],
    reference: 'DerSimonian, R., & Laird, N. (1986). Meta-analysis in clinical trials. Controlled Clinical Trials, 7(3), 177-188.'
  };
}

// Sample Size for Meta-Analysis
export function calculateMetaAnalysisSampleSize(inputs) {
  const { expectedEffect, expectedTau2, withinStudyVar, alpha, power, precision } = inputs;

  const theta = parseFloat(expectedEffect);
  const tau2 = parseFloat(expectedTau2);
  const sigmaW2 = parseFloat(withinStudyVar);
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;
  const d = parseFloat(precision);

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  // Number of studies needed
  // Based on precision: Var(theta_RE) = 1/sum(1/(sigma_i² + tau²)) ≈ (sigma² + tau²)/k
  // For precision d: (sigma² + tau²)/k ≤ (d/z_alpha)²
  const kPrecision = Math.ceil((sigmaW2 + tau2) / Math.pow(d / zAlpha, 2));

  // Based on power to detect effect theta
  // Power requires: theta / SE(theta) ≥ z_alpha + z_beta
  // SE² ≈ (sigma² + tau²)/k
  // k ≥ (z_alpha + z_beta)² × (sigma² + tau²) / theta²
  const kPower = Math.ceil(Math.pow(zAlpha + zBeta, 2) * (sigmaW2 + tau2) / Math.pow(theta, 2));

  const kRecommended = Math.max(kPrecision, kPower, 3);

  // Expected standard error with recommended k
  const expectedSE = Math.sqrt((sigmaW2 + tau2) / kRecommended);
  const expectedCI = 1.96 * expectedSE;

  return {
    studyType: 'Meta-Analysis',
    type: 'meta-sample-size',
    method: 'Sample Size for Meta-Analysis',
    inputs: {
      'Expected Effect Size': theta,
      'Expected Between-study Var (tau²)': tau2,
      'Typical Within-study Var': sigmaW2,
      'Significance Level (alpha)': alphaVal,
      'Power': `${power}%`,
      'Desired Precision': `±${d}`
    },
    formula: 'k ≥ (Z_alpha + Z_beta)² × (sigma² + tau²) / theta²',
    formulaExplanation: 'Minimum number of studies for adequate power in meta-analysis',
    steps: [
      { title: 'Get Z-scores', calc: `Z_alpha = ${roundUp(zAlpha, 3)}, Z_beta = ${roundUp(zBeta, 3)}` },
      { title: 'Studies for Precision', calc: `k = (${sigmaW2} + ${tau2}) / (${d}/${roundUp(zAlpha, 2)})² = ${kPrecision}` },
      { title: 'Studies for Power', calc: `k = (${roundUp(zAlpha, 2)} + ${roundUp(zBeta, 2)})² × (${sigmaW2} + ${tau2}) / ${theta}² = ${kPower}` },
      { title: 'Recommended Studies', calc: `k = max(${kPrecision}, ${kPower}, 3) = ${kRecommended}` },
      { title: 'Expected SE with k Studies', calc: `SE = sqrt((${sigmaW2} + ${tau2})/${kRecommended}) = ${roundUp(expectedSE, 4)}` }
    ],
    results: {
      'Studies for Precision': kPrecision,
      'Studies for Power': kPower,
      'Recommended Minimum': kRecommended,
      'Expected SE': roundUp(expectedSE, 4),
      'Expected 95% CI Width': `±${roundUp(expectedCI, 4)}`
    },
    interpretation: `To achieve ${power}% power to detect an effect of ${theta} with alpha=${alphaVal} and desired precision of ±${d}, you need at least ${kRecommended} studies. With ${kRecommended} studies, the expected standard error is ${roundUp(expectedSE, 4)} and 95% CI width of ±${roundUp(expectedCI, 4)}.`,
    recommendations: [
      'This is a planning estimate; actual power depends on realized heterogeneity',
      'Include all relevant studies, not just a target number',
      'Consider cumulative meta-analysis for sequential updates',
      'More studies improve precision and power to detect heterogeneity'
    ],
    reference: 'Valentine, J. C., Pigott, T. D., & Rothstein, H. R. (2010). How many studies do you need? A primer on statistical power for meta-analysis. Journal of Educational and Behavioral Statistics, 35(2), 215-247.'
  };
}
