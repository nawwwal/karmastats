// Power Analysis Calculator Logic
// Post-hoc power, sample size for power, detectable effect size

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

// Standard normal CDF
function normalCDF(x) {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

// Post-hoc Power Analysis for Two-Sample t-test
export function calculatePostHocPower(inputs) {
  const { n1, n2, effectSize, alpha } = inputs;

  const sampleN1 = parseInt(n1);
  const sampleN2 = parseInt(n2);
  const d = parseFloat(effectSize);
  const alphaVal = parseFloat(alpha);

  const zAlpha = normalInv(1 - alphaVal / 2);

  // Non-centrality parameter
  const ncp = d * Math.sqrt((sampleN1 * sampleN2) / (sampleN1 + sampleN2));

  // Calculate power using normal approximation
  const power = normalCDF(ncp - zAlpha) + normalCDF(-ncp - zAlpha);
  const powerPercent = Math.min(99.9, Math.max(0.1, power * 100));

  // Calculate what effect size could be detected with 80% power
  const zBeta80 = normalInv(0.80);
  const detectableES = (zAlpha + zBeta80) / Math.sqrt((sampleN1 * sampleN2) / (sampleN1 + sampleN2));

  return {
    studyType: 'Power Analysis',
    type: 'post-hoc-power',
    method: 'Post-hoc Power for Two-Sample t-test',
    inputs: {
      'Group 1 Sample Size': sampleN1,
      'Group 2 Sample Size': sampleN2,
      'Effect Size (Cohen\'s d)': d,
      'Significance Level (alpha)': alphaVal
    },
    formula: 'Power = P(Z > Z_alpha - delta) + P(Z < -Z_alpha - delta)',
    formulaExplanation: 'Where delta = d × sqrt(n1×n2/(n1+n2)) is the non-centrality parameter',
    steps: [
      { title: 'Calculate Z for alpha', calc: `Z_alpha = ${roundUp(zAlpha, 3)}` },
      { title: 'Calculate Non-centrality Parameter', calc: `delta = ${d} × sqrt((${sampleN1}×${sampleN2})/(${sampleN1}+${sampleN2})) = ${roundUp(ncp, 3)}` },
      { title: 'Calculate Power', calc: `Power = P(Z > ${roundUp(zAlpha, 2)} - ${roundUp(ncp, 2)}) = ${roundUp(powerPercent, 1)}%` },
      { title: 'Detectable Effect (80% power)', calc: `d_detectable = (${roundUp(zAlpha, 2)} + ${roundUp(zBeta80, 2)}) / ${roundUp(Math.sqrt((sampleN1 * sampleN2) / (sampleN1 + sampleN2)), 2)} = ${roundUp(detectableES, 3)}` }
    ],
    results: {
      'Achieved Power': `${roundUp(powerPercent, 1)}%`,
      'Effect Size': d,
      'Non-centrality Parameter': roundUp(ncp, 3),
      'Detectable ES (80% power)': roundUp(detectableES, 3)
    },
    interpretation: `With ${sampleN1} participants in group 1 and ${sampleN2} in group 2, and an effect size of ${d}, the study has ${roundUp(powerPercent, 1)}% power to detect a significant difference at alpha=${alphaVal}. ${powerPercent >= 80 ? 'This is adequate power (≥80%).' : 'This may be underpowered (<80%). The minimum detectable effect size with 80% power is ' + roundUp(detectableES, 3) + '.'}`,
    recommendations: [
      powerPercent >= 80 ? 'Power is adequate for the specified effect size' : 'Consider increasing sample size for adequate power',
      'Interpret non-significant results with caution if underpowered',
      'd = 0.2 (small), 0.5 (medium), 0.8 (large) per Cohen',
      'Post-hoc power should not be used to interpret p-values'
    ],
    reference: 'Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.'
  };
}

// Sample Size for Desired Power
export function calculateSampleForPower(inputs) {
  const { effectSize, alpha, power, ratio } = inputs;

  const d = parseFloat(effectSize);
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;
  const r = parseFloat(ratio) || 1;

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  // Two-sample t-test sample size formula
  const n1 = Math.ceil(Math.pow((zAlpha + zBeta) / d, 2) * (1 + 1/r));
  const n2 = Math.ceil(n1 * r);
  const totalN = n1 + n2;

  // Calculate actual power achieved
  const ncp = d * Math.sqrt((n1 * n2) / (n1 + n2));
  const actualPower = (normalCDF(ncp - zAlpha) + normalCDF(-ncp - zAlpha)) * 100;

  return {
    studyType: 'Power Analysis',
    type: 'sample-for-power',
    method: 'Sample Size for Two-Sample t-test',
    inputs: {
      'Effect Size (Cohen\'s d)': d,
      'Significance Level (alpha)': alphaVal,
      'Desired Power': `${power}%`,
      'Allocation Ratio': `1:${r}`
    },
    formula: 'n1 = ((Z_alpha + Z_beta) / d)² × (1 + 1/r)',
    formulaExplanation: 'Sample size formula for two-sample t-test with unequal allocation',
    steps: [
      { title: 'Get Z-scores', calc: `Z_alpha = ${roundUp(zAlpha, 3)}, Z_beta = ${roundUp(zBeta, 3)}` },
      { title: 'Calculate Base Sample', calc: `((${roundUp(zAlpha, 2)} + ${roundUp(zBeta, 2)}) / ${d})² = ${roundUp(Math.pow((zAlpha + zBeta) / d, 2), 1)}` },
      { title: 'Adjust for Ratio', calc: `n1 = ${roundUp(Math.pow((zAlpha + zBeta) / d, 2), 1)} × (1 + 1/${r}) = ${n1}` },
      { title: 'Calculate Group 2', calc: `n2 = ${n1} × ${r} = ${n2}` },
      { title: 'Verify Power', calc: `Achieved power = ${roundUp(actualPower, 1)}%` }
    ],
    results: {
      'Group 1 (n1)': n1,
      'Group 2 (n2)': n2,
      'Total Sample': totalN,
      'Achieved Power': `${roundUp(actualPower, 1)}%`
    },
    interpretation: `To detect an effect size of ${d} with ${power}% power at alpha=${alphaVal}, you need ${n1} participants in group 1 and ${n2} in group 2 (total ${totalN}). This provides ${roundUp(actualPower, 1)}% power.`,
    recommendations: [
      'Add 10-20% for anticipated dropout',
      `Effect size ${d} is ${d <= 0.2 ? 'small' : d <= 0.5 ? 'small to medium' : d <= 0.8 ? 'medium to large' : 'large'}`,
      'Consider practical significance alongside statistical power',
      'Equal allocation (1:1) is most efficient'
    ],
    reference: 'Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.'
  };
}

// Minimum Detectable Effect Size
export function calculateDetectableEffect(inputs) {
  const { n1, n2, alpha, power } = inputs;

  const sampleN1 = parseInt(n1);
  const sampleN2 = parseInt(n2);
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  // Minimum detectable effect size
  const mdes = (zAlpha + zBeta) / Math.sqrt((sampleN1 * sampleN2) / (sampleN1 + sampleN2));

  // Classify effect size
  let effectClass;
  if (mdes <= 0.2) effectClass = 'Small';
  else if (mdes <= 0.5) effectClass = 'Small to Medium';
  else if (mdes <= 0.8) effectClass = 'Medium to Large';
  else effectClass = 'Large';

  // Calculate power for common effect sizes
  const powerSmall = (normalCDF(0.2 * Math.sqrt((sampleN1 * sampleN2) / (sampleN1 + sampleN2)) - zAlpha)) * 100;
  const powerMedium = (normalCDF(0.5 * Math.sqrt((sampleN1 * sampleN2) / (sampleN1 + sampleN2)) - zAlpha)) * 100;
  const powerLarge = (normalCDF(0.8 * Math.sqrt((sampleN1 * sampleN2) / (sampleN1 + sampleN2)) - zAlpha)) * 100;

  return {
    studyType: 'Power Analysis',
    type: 'detectable-effect',
    method: 'Minimum Detectable Effect Size',
    inputs: {
      'Group 1 Sample Size': sampleN1,
      'Group 2 Sample Size': sampleN2,
      'Significance Level (alpha)': alphaVal,
      'Desired Power': `${power}%`
    },
    formula: 'MDES = (Z_alpha + Z_beta) / sqrt(n1×n2/(n1+n2))',
    formulaExplanation: 'Minimum effect size detectable with given sample and power',
    steps: [
      { title: 'Get Z-scores', calc: `Z_alpha = ${roundUp(zAlpha, 3)}, Z_beta = ${roundUp(zBeta, 3)}` },
      { title: 'Calculate Pooled N Factor', calc: `sqrt((${sampleN1}×${sampleN2})/(${sampleN1}+${sampleN2})) = ${roundUp(Math.sqrt((sampleN1 * sampleN2) / (sampleN1 + sampleN2)), 2)}` },
      { title: 'Calculate MDES', calc: `MDES = (${roundUp(zAlpha, 2)} + ${roundUp(zBeta, 2)}) / ${roundUp(Math.sqrt((sampleN1 * sampleN2) / (sampleN1 + sampleN2)), 2)} = ${roundUp(mdes, 3)}` },
      { title: 'Power for Small Effect (d=0.2)', calc: `Power = ${roundUp(powerSmall, 1)}%` },
      { title: 'Power for Medium Effect (d=0.5)', calc: `Power = ${roundUp(powerMedium, 1)}%` }
    ],
    results: {
      'Min Detectable Effect': roundUp(mdes, 3),
      'Effect Classification': effectClass,
      'Power for d=0.2': `${roundUp(powerSmall, 1)}%`,
      'Power for d=0.5': `${roundUp(powerMedium, 1)}%`,
      'Power for d=0.8': `${roundUp(powerLarge, 1)}%`
    },
    interpretation: `With ${sampleN1} and ${sampleN2} participants, the study can detect a minimum effect size of ${roundUp(mdes, 3)} (${effectClass}) with ${power}% power at alpha=${alphaVal}. For small effects (d=0.2), power is only ${roundUp(powerSmall, 1)}%. For medium effects (d=0.5), power is ${roundUp(powerMedium, 1)}%.`,
    recommendations: [
      `Your study is powered for ${effectClass.toLowerCase()} effects`,
      mdes > 0.5 ? 'Consider larger sample to detect smaller effects' : 'Good sensitivity for medium and large effects',
      'Report MDES in your study protocol',
      'Consider if MDES is clinically meaningful'
    ],
    reference: 'Bloom, H.S. (1995). Minimum Detectable Effects: A Simple Way to Report the Statistical Power of Experimental Designs. Evaluation Review, 19(5), 547-556.'
  };
}

// ANOVA Power Analysis
export function calculateANOVAPower(inputs) {
  const { groups, nPerGroup, effectSize, alpha } = inputs;

  const k = parseInt(groups);
  const n = parseInt(nPerGroup);
  const f = parseFloat(effectSize); // Cohen's f
  const alphaVal = parseFloat(alpha);

  const totalN = k * n;
  const df1 = k - 1;
  const df2 = totalN - k;

  // Non-centrality parameter for F distribution
  const lambda = totalN * f * f;

  // Approximate power using normal approximation to non-central F
  // This is a simplified approximation
  const zAlpha = normalInv(1 - alphaVal);
  const ncp = Math.sqrt(2 * lambda) - Math.sqrt(2 * df1 - 1);
  const power = normalCDF(ncp - zAlpha) * 100;

  // Cohen's f to eta-squared conversion
  const etaSquared = (f * f) / (1 + f * f);

  return {
    studyType: 'Power Analysis',
    type: 'anova-power',
    method: 'One-way ANOVA Power Analysis',
    inputs: {
      'Number of Groups': k,
      'Sample Size per Group': n,
      'Effect Size (Cohen\'s f)': f,
      'Significance Level (alpha)': alphaVal
    },
    formula: 'lambda = N × f²; Power approx from non-central F',
    formulaExplanation: 'Non-centrality parameter based power calculation',
    steps: [
      { title: 'Calculate Total N', calc: `N = ${k} × ${n} = ${totalN}` },
      { title: 'Calculate Degrees of Freedom', calc: `df1 = ${k} - 1 = ${df1}, df2 = ${totalN} - ${k} = ${df2}` },
      { title: 'Calculate Non-centrality', calc: `lambda = ${totalN} × ${f}² = ${roundUp(lambda, 2)}` },
      { title: 'Convert to Eta-squared', calc: `eta² = ${f}² / (1 + ${f}²) = ${roundUp(etaSquared, 4)}` },
      { title: 'Approximate Power', calc: `Power ≈ ${roundUp(power, 1)}%` }
    ],
    results: {
      'Approximate Power': `${roundUp(Math.min(99, power), 1)}%`,
      'Total Sample Size': totalN,
      'Non-centrality (lambda)': roundUp(lambda, 2),
      'Eta-squared': roundUp(etaSquared, 4)
    },
    interpretation: `A one-way ANOVA with ${k} groups of ${n} participants each (total N=${totalN}) has approximately ${roundUp(Math.min(99, power), 1)}% power to detect an effect size of f=${f} (eta²=${roundUp(etaSquared, 4)}) at alpha=${alphaVal}.`,
    recommendations: [
      `f = 0.10 (small), 0.25 (medium), 0.40 (large) per Cohen`,
      'Consider post-hoc tests and their power implications',
      'Unequal group sizes reduce power',
      'Use exact power calculations for critical decisions'
    ],
    reference: 'Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.'
  };
}
