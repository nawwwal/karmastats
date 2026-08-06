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

// Standard normal CDF (erf approximation)
function normalCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741,
        a4 = -1.453152027, a5 = 1.061405429, pp = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + pp * z);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return 0.5 * (1 + sign * y);
}

// Lanczos log-gamma, incomplete beta, Student-t CDF and its inverse — used for an
// exact t_{k-2} prediction interval (replacing the hard-coded 2.365 that was only
// valid for k = 9 studies).
function logGamma(x) {
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function betacf(a, b, x) {
  const FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-13) break;
  }
  return h;
}
function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
  return 1 - bt * betacf(b, a, 1 - x) / b;
}
function tCDF(t, df) {
  const x = df / (df + t * t);
  const ib = 0.5 * betai(df / 2, 0.5, x);
  return t > 0 ? 1 - ib : ib;
}
function tInv(p, df) {
  let lo = -1e4, hi = 1e4;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCDF(mid, df) < p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// Parse and validate the comma-separated study inputs.
// Returns { error } on bad input, else { effectsArr, variancesArr, names, k }.
// Trailing commas are tolerated, but an INTERIOR empty token is a hard error:
// silently dropping it would re-pair every later effect with the wrong
// variance and pool a wrong estimate without any warning.
function splitTokens(str) {
  const tokens = String(str).split(',').map(s => s.trim());
  while (tokens.length && tokens[tokens.length - 1] === '') tokens.pop();
  return tokens;
}

function parseStudyInputs(effects, variances, studyNames) {
  const effTokens = splitTokens(effects);
  const varTokens = splitTokens(variances);
  const effGap = effTokens.indexOf('');
  if (effGap !== -1) return { error: `Effect size #${effGap + 1} is missing (double comma) — give every study a value.` };
  const varGap = varTokens.indexOf('');
  if (varGap !== -1) return { error: `Variance #${varGap + 1} is missing (double comma) — give every study a value.` };
  const effectsArr = effTokens.map(Number);
  const variancesArr = varTokens.map(Number);
  if (effectsArr.length < 2) return { error: 'Enter at least 2 studies (comma-separated effect sizes).' };
  if (effectsArr.length !== variancesArr.length) {
    return { error: `Counts differ: ${effectsArr.length} effect size(s) but ${variancesArr.length} variance(s) — every study needs both.` };
  }
  if (effectsArr.some(v => !Number.isFinite(v))) return { error: 'All effect sizes must be numeric.' };
  if (variancesArr.some(v => !Number.isFinite(v) || v <= 0)) return { error: 'All variances must be positive numbers (a variance of 0 or less is not valid).' };
  if (variancesArr.some(v => !Number.isFinite(1 / v))) return { error: 'A variance is too small to compute weights — check the units.' };
  // names: split on semicolons when present, so citation-style names
  // ("Smith et al., 2020; Jones et al., 2021") keep their internal commas
  const nameStr = studyNames ? String(studyNames).trim() : '';
  const raw = nameStr
    ? (nameStr.includes(';') ? nameStr.split(';') : nameStr.split(',')).map(n => n.trim())
    : [];
  const names = effectsArr.map((_, i) => raw[i] || `Study ${i + 1}`);
  return { effectsArr, variancesArr, names, k: effectsArr.length };
}

// Per-study rows + pooled diamond for the forest plot; weights as % of total.
// Weights must be the MODEL's weights (1/v for FE, 1/(v+tau²) for RE).
function buildForest(names, effectsArr, variancesArr, weights, pooled, pooledLo, pooledHi, label) {
  const totalW = weights.reduce((s, w) => s + w, 0);
  return {
    studies: names.map((name, i) => ({
      name,
      effect: effectsArr[i],
      lower: effectsArr[i] - 1.96 * Math.sqrt(variancesArr[i]),
      upper: effectsArr[i] + 1.96 * Math.sqrt(variancesArr[i]),
      weightPct: (weights[i] / totalW) * 100,
    })),
    pooled: { effect: pooled, lower: pooledLo, upper: pooledHi, label },
  };
}

// Fixed Effects Meta-Analysis
export function calculateFixedEffects(inputs) {
  const { effects, variances, studyNames } = inputs;

  const parsed = parseStudyInputs(effects, variances, studyNames);
  if (parsed.error) return { error: parsed.error };
  const { effectsArr, variancesArr, names, k } = parsed;

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

  // Z-test (two-sided p-value from the standard normal CDF)
  const zStat = pooledEffect / pooledSE;
  const pValue = 2 * (1 - normalCDF(Math.abs(zStat)));

  // Q statistic for heterogeneity (I² guarded: Q = 0 → 0%, not NaN)
  const Q = effectsArr.reduce((sum, e, i) => sum + weights[i] * Math.pow(e - pooledEffect, 2), 0);
  const dfQ = k - 1;
  const I2 = Q > 0 ? Math.max(0, (Q - dfQ) / Q * 100) : 0;

  const forest = buildForest(names, effectsArr, variancesArr, weights, pooledEffect, ciLower, ciUpper, 'Pooled (Fixed effects)');

  return {
    studyType: 'Meta-Analysis',
    type: 'fixed-effects',
    forest,
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
      { title: 'Q Statistic', calc: `Q = ${roundUp(Q, 3)}, df = ${dfQ}, I² = ${roundUp(I2, 1)}%` },
      { title: 'Per-study 95% CI & weight', calc: forest.studies.map((s) => `${s.name}: ${roundUp(s.effect, 3)} [${roundUp(s.lower, 3)}, ${roundUp(s.upper, 3)}], w = ${roundUp(s.weightPct, 1)}%`).join(' | ') }
    ],
    results: {
      'Pooled Effect': roundUp(pooledEffect, 4),
      'Standard Error': roundUp(pooledSE, 4),
      '95% CI Lower': roundUp(ciLower, 4),
      '95% CI Upper': roundUp(ciUpper, 4),
      'Z-statistic': roundUp(zStat, 3),
      'P-value': pValue < 0.0001 ? '<0.0001' : roundUp(pValue, 4),
      'Q Statistic': roundUp(Q, 3),
      'I² (%)': roundUp(I2, 1)
    },
    interpretation: `The fixed effects pooled estimate is ${roundUp(pooledEffect, 4)} (95% CI: ${roundUp(ciLower, 4)} to ${roundUp(ciUpper, 4)}). ${I2 < 25 ? 'Heterogeneity is low (I² < 25%).' : I2 < 50 ? 'Moderate heterogeneity (25% ≤ I² < 50%). Consider a random effects model.' : I2 < 75 ? 'Substantial heterogeneity (50% ≤ I² < 75%). Random effects model recommended.' : 'Considerable heterogeneity (I² ≥ 75%). Use random effects and explore sources of heterogeneity.'}`,
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

  const parsed = parseStudyInputs(effects, variances, studyNames);
  if (parsed.error) return { error: parsed.error };
  const { effectsArr, variancesArr, names, k } = parsed;

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

  // I² (guarded: Q = 0 → 0%, not NaN)
  const I2 = Q > 0 ? Math.max(0, (Q - dfQ) / Q * 100) : 0;

  // 95% prediction interval (Higgins, Thompson & Spiegelhalter 2009): uses t_{k-2},
  // not a fixed constant. Requires k ≥ 3 studies (df = k−2 ≥ 1).
  const piDf = k - 2;
  const hasPI = piDf >= 1;
  const tCrit = hasPI ? tInv(0.975, piDf) : NaN;
  const piLower = hasPI ? thetaRE - tCrit * Math.sqrt(varRE + tau2) : NaN;
  const piUpper = hasPI ? thetaRE + tCrit * Math.sqrt(varRE + tau2) : NaN;

  const forest = buildForest(names, effectsArr, variancesArr, wRE, thetaRE, ciLower, ciUpper, 'Pooled (Random effects)');

  return {
    studyType: 'Meta-Analysis',
    type: 'random-effects',
    forest,
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
      { title: 'Standard Error', calc: `SE = ${roundUp(seRE, 4)}` },
      { title: 'Per-study 95% CI & weight', calc: forest.studies.map((s) => `${s.name}: ${roundUp(s.effect, 3)} [${roundUp(s.lower, 3)}, ${roundUp(s.upper, 3)}], w = ${roundUp(s.weightPct, 1)}%`).join(' | ') }
    ],
    results: {
      'Pooled Effect': roundUp(thetaRE, 4),
      'Standard Error': roundUp(seRE, 4),
      '95% CI Lower': roundUp(ciLower, 4),
      '95% CI Upper': roundUp(ciUpper, 4),
      'tau² (Between-study Var)': roundUp(tau2, 4),
      'tau': roundUp(tau, 4),
      'I² (%)': roundUp(I2, 1),
      'Q Statistic': roundUp(Q, 3),
      '95% Prediction Interval': hasPI ? `[${roundUp(piLower, 4)}, ${roundUp(piUpper, 4)}]` : 'n/a (needs ≥3 studies)'
    },
    interpretation: `The random effects pooled estimate is ${roundUp(thetaRE, 4)} (95% CI: ${roundUp(ciLower, 4)} to ${roundUp(ciUpper, 4)}). Between-study heterogeneity tau² = ${roundUp(tau2, 4)}. I² = ${roundUp(I2, 1)}%, indicating ${I2 < 25 ? 'low' : I2 < 50 ? 'moderate' : I2 < 75 ? 'substantial' : 'considerable'} heterogeneity.`,
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

  if (!Number.isFinite(theta) || theta === 0) return { error: 'Expected effect size must be a non-zero number.' };
  if (!Number.isFinite(tau2) || tau2 < 0) return { error: 'Expected tau² must be 0 or a positive number.' };
  if (!Number.isFinite(sigmaW2) || sigmaW2 <= 0) return { error: 'Within-study variance must be a positive number.' };
  if (!Number.isFinite(d) || d <= 0) return { error: 'Desired precision must be a positive number.' };

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

  if (kPrecision > 1e6 || kPower > 1e6) {
    return { error: 'These inputs imply more than 1,000,000 studies — check the units of the effect size, variances and precision.' };
  }

  const kRecommended = Math.max(kPrecision, kPower, 3);

  // Expected standard error with recommended k; CI width at the SAME alpha the
  // precision criterion used (a hard-coded 1.96 disagreed with alpha ≠ 0.05)
  const ciPct = Math.round((1 - alphaVal) * 100);
  const expectedSE = Math.sqrt((sigmaW2 + tau2) / kRecommended);
  const expectedCI = zAlpha * expectedSE;

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
      [`Expected ${ciPct}% CI Width`]: `±${roundUp(expectedCI, 4)}`
    },
    interpretation: `To achieve ${power}% power to detect an effect of ${theta} with alpha=${alphaVal} and desired precision of ±${d}, you need at least ${kRecommended} studies. With ${kRecommended} studies, the expected standard error is ${roundUp(expectedSE, 4)} and the ${ciPct}% CI width is ±${roundUp(expectedCI, 4)}.`,
    recommendations: [
      'This is a planning estimate; actual power depends on realized heterogeneity',
      'Include all relevant studies, not just a target number',
      'Consider cumulative meta-analysis for sequential updates',
      'More studies improve precision and power to detect heterogeneity'
    ],
    reference: 'Valentine, J. C., Pigott, T. D., & Rothstein, H. R. (2010). How many studies do you need? A primer on statistical power for meta-analysis. Journal of Educational and Behavioral Statistics, 35(2), 215-247.'
  };
}
