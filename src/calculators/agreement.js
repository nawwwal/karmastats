// Agreement Studies Calculator Logic
// Kappa, ICC, Bland-Altman

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

// Cohen's Kappa Sample Size
export function calculateKappaSampleSize(inputs) {
  const { kappa0, kappa1, alpha, power, prevalence, numCategories } = inputs;

  const k0 = parseFloat(kappa0);
  const k1 = parseFloat(kappa1);
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;
  const p = parseFloat(prevalence);
  const c = parseInt(numCategories) || 2;

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  // Expected proportion of agreement under null
  const pE0 = p * p + (1 - p) * (1 - p);
  const pO0 = pE0 + k0 * (1 - pE0);

  // Expected proportion of agreement under alternative
  const pE1 = pE0;
  const pO1 = pE1 + k1 * (1 - pE1);

  // Variance under null and alternative (Fleiss formula approximation)
  const var0 = (pO0 * (1 - pO0)) / Math.pow(1 - pE0, 2);
  const var1 = (pO1 * (1 - pO1)) / Math.pow(1 - pE1, 2);

  // Sample size
  const n = Math.ceil(Math.pow(zAlpha * Math.sqrt(var0) + zBeta * Math.sqrt(var1), 2) / Math.pow(k1 - k0, 2));

  // Interpretation of kappa
  let kappaInterp;
  if (k1 < 0.20) kappaInterp = 'Poor';
  else if (k1 < 0.40) kappaInterp = 'Fair';
  else if (k1 < 0.60) kappaInterp = 'Moderate';
  else if (k1 < 0.80) kappaInterp = 'Substantial';
  else kappaInterp = 'Almost Perfect';

  return {
    studyType: 'Agreement Study',
    type: 'kappa-sample-size',
    method: "Cohen's Kappa Sample Size",
    inputs: {
      'Null Kappa (kappa0)': k0,
      'Alternative Kappa (kappa1)': k1,
      'Significance Level (alpha)': alphaVal,
      'Power': `${power}%`,
      'Prevalence': p,
      'Number of Categories': c
    },
    formula: 'n = (Z_alpha × sqrt(Var0) + Z_beta × sqrt(Var1))² / (kappa1 - kappa0)²',
    formulaExplanation: "Sample size to test Cohen's Kappa against a null value",
    steps: [
      { title: 'Get Z-scores', calc: `Z_alpha = ${roundUp(zAlpha, 3)}, Z_beta = ${roundUp(zBeta, 3)}` },
      { title: 'Calculate Expected Agreement', calc: `P_e = ${roundUp(pE0, 4)}` },
      { title: 'Calculate Observed Agreement (H0)', calc: `P_o0 = ${roundUp(pO0, 4)}` },
      { title: 'Calculate Observed Agreement (H1)', calc: `P_o1 = ${roundUp(pO1, 4)}` },
      { title: 'Calculate Sample Size', calc: `n = ${n}` }
    ],
    results: {
      'Required Sample Size': n,
      'Expected Kappa': k1,
      'Kappa Interpretation': kappaInterp,
      'Variance (H0)': roundUp(var0, 4),
      'Variance (H1)': roundUp(var1, 4)
    },
    interpretation: `To detect a kappa of ${k1} (${kappaInterp} agreement) against a null of ${k0} with ${power}% power at alpha=${alphaVal}, you need ${n} subjects rated by both raters. Each subject should be rated independently by both raters.`,
    recommendations: [
      'Ensure raters are blinded to each other\'s ratings',
      'Use standardized rating criteria',
      `Kappa ${k1} indicates ${kappaInterp.toLowerCase()} inter-rater agreement`,
      'Consider weighted kappa for ordinal categories'
    ],
    reference: 'Sim, J., & Wright, C. C. (2005). The kappa statistic in reliability studies. Physical Therapy, 85(3), 257-268.'
  };
}

// ICC Sample Size
export function calculateICCSampleSize(inputs) {
  const { icc0, icc1, alpha, power, numRaters } = inputs;

  const rho0 = parseFloat(icc0);
  const rho1 = parseFloat(icc1);
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;
  const k = parseInt(numRaters);

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  // Fisher's z transformation
  const z0 = 0.5 * Math.log((1 + rho0) / (1 - rho0));
  const z1 = 0.5 * Math.log((1 + rho1) / (1 - rho1));

  // Sample size for ICC
  const n = Math.ceil(Math.pow((zAlpha + zBeta) / (z1 - z0), 2) + 3);

  // Adjust for number of raters
  const nAdjusted = Math.ceil(n / Math.sqrt(k));

  // ICC interpretation
  let iccInterp;
  if (rho1 < 0.50) iccInterp = 'Poor';
  else if (rho1 < 0.75) iccInterp = 'Moderate';
  else if (rho1 < 0.90) iccInterp = 'Good';
  else iccInterp = 'Excellent';

  return {
    studyType: 'Agreement Study',
    type: 'icc-sample-size',
    method: 'Intraclass Correlation Coefficient Sample Size',
    inputs: {
      'Null ICC (rho0)': rho0,
      'Alternative ICC (rho1)': rho1,
      'Significance Level (alpha)': alphaVal,
      'Power': `${power}%`,
      'Number of Raters': k
    },
    formula: 'n = ((Z_alpha + Z_beta) / (Fisher_z1 - Fisher_z0))² + 3',
    formulaExplanation: "Sample size using Fisher's z transformation for ICC",
    steps: [
      { title: 'Get Z-scores', calc: `Z_alpha = ${roundUp(zAlpha, 3)}, Z_beta = ${roundUp(zBeta, 3)}` },
      { title: "Fisher's z (H0)", calc: `z0 = 0.5 × ln((1+${rho0})/(1-${rho0})) = ${roundUp(z0, 4)}` },
      { title: "Fisher's z (H1)", calc: `z1 = 0.5 × ln((1+${rho1})/(1-${rho1})) = ${roundUp(z1, 4)}` },
      { title: 'Calculate Base Sample Size', calc: `n = ((${roundUp(zAlpha, 2)} + ${roundUp(zBeta, 2)}) / (${roundUp(z1, 3)} - ${roundUp(z0, 3)}))² + 3 = ${n}` },
      { title: 'Adjust for Raters', calc: `n_adj = ${n} / sqrt(${k}) = ${nAdjusted}` }
    ],
    results: {
      'Required Subjects': nAdjusted,
      'Number of Raters': k,
      'Total Ratings': nAdjusted * k,
      'Expected ICC': rho1,
      'ICC Interpretation': iccInterp
    },
    interpretation: `To detect an ICC of ${rho1} (${iccInterp} reliability) against a null of ${rho0} with ${power}% power at alpha=${alphaVal}, you need ${nAdjusted} subjects each rated by ${k} raters (total ${nAdjusted * k} ratings).`,
    recommendations: [
      'ICC < 0.50 = poor, 0.50-0.75 = moderate, 0.75-0.90 = good, > 0.90 = excellent',
      'Use ICC(2,1) or ICC(2,k) for inter-rater reliability',
      'Use ICC(3,1) or ICC(3,k) for intra-rater reliability',
      'Report the specific ICC form used (Shrout & Fleiss notation)'
    ],
    reference: 'Walter, S. D., Eliasziw, M., & Donner, A. (1998). Sample size and optimal designs for reliability studies. Statistics in Medicine, 17(1), 101-110.'
  };
}

// Bland-Altman Analysis Sample Size
export function calculateBlandAltmanSampleSize(inputs) {
  const { expectedBias, loaWidth, precision, alpha } = inputs;

  const bias = parseFloat(expectedBias);
  const loaW = parseFloat(loaWidth);
  const prec = parseFloat(precision);
  const alphaVal = parseFloat(alpha);

  const zAlpha = normalInv(1 - alphaVal / 2);

  // SD of differences (from LOA width: LOA = bias ± 1.96*SD)
  const sdDiff = loaW / (2 * 1.96);

  // Sample size for precision of LOA
  // SE of LOA ≈ sqrt(3) × SD / sqrt(n)
  // For desired precision: sqrt(3) × SD / sqrt(n) ≤ precision
  // n ≥ 3 × SD² / precision²
  const nLOA = Math.ceil(3 * Math.pow(sdDiff / prec, 2));

  // Sample size for precision of bias
  // SE of bias = SD / sqrt(n)
  // n ≥ (z × SD / precision)²
  const nBias = Math.ceil(Math.pow(zAlpha * sdDiff / prec, 2));

  const nRecommended = Math.max(nLOA, nBias, 30);

  // Expected CI width for bias
  const ciBiasWidth = 2 * zAlpha * sdDiff / Math.sqrt(nRecommended);

  return {
    studyType: 'Agreement Study',
    type: 'bland-altman',
    method: 'Bland-Altman Analysis Sample Size',
    inputs: {
      'Expected Bias (Mean Difference)': bias,
      'Expected LOA Width': loaWidth,
      'Desired Precision': prec,
      'Confidence Level': `${(1 - alphaVal) * 100}%`
    },
    formula: 'n >= 3 × (SD_diff / precision)²',
    formulaExplanation: 'Sample size for adequate precision of limits of agreement',
    steps: [
      { title: 'Estimate SD of Differences', calc: `SD = LOA_width / (2 × 1.96) = ${loaW} / 3.92 = ${roundUp(sdDiff, 4)}` },
      { title: 'Sample Size for LOA Precision', calc: `n = 3 × (${roundUp(sdDiff, 3)} / ${prec})² = ${nLOA}` },
      { title: 'Sample Size for Bias Precision', calc: `n = (${roundUp(zAlpha, 2)} × ${roundUp(sdDiff, 3)} / ${prec})² = ${nBias}` },
      { title: 'Recommended Sample Size', calc: `n = max(${nLOA}, ${nBias}, 30) = ${nRecommended}` },
      { title: 'Expected CI Width for Bias', calc: `CI = ± ${roundUp(ciBiasWidth / 2, 4)}` }
    ],
    results: {
      'Recommended Sample Size': nRecommended,
      'SD of Differences': roundUp(sdDiff, 4),
      'Expected LOA': `${bias} ± ${roundUp(1.96 * sdDiff, 2)}`,
      'CI Width for Bias': roundUp(ciBiasWidth, 4)
    },
    interpretation: `For a Bland-Altman analysis with expected bias of ${bias} and LOA width of ${loaWidth}, you need ${nRecommended} paired measurements to achieve precision of ±${prec}. This assumes the differences are approximately normally distributed.`,
    recommendations: [
      'Minimum 30 subjects recommended for Bland-Altman',
      'Check normality of differences',
      'Look for proportional bias (correlation with mean)',
      'Report bias, LOA, and their confidence intervals'
    ],
    reference: 'Bland, J. M., & Altman, D. G. (1986). Statistical methods for assessing agreement between two methods of clinical measurement. The Lancet, 327(8476), 307-310.'
  };
}

// Kappa from 2x2 Table
export function calculateKappaFromTable(inputs) {
  const { a, b, c, d } = inputs;

  const cellA = parseInt(a);
  const cellB = parseInt(b);
  const cellC = parseInt(c);
  const cellD = parseInt(d);

  const n = cellA + cellB + cellC + cellD;

  // Observed agreement
  const pO = (cellA + cellD) / n;

  // Expected agreement by chance
  const p1Plus = (cellA + cellB) / n;
  const pPlus1 = (cellA + cellC) / n;
  const p2Plus = (cellC + cellD) / n;
  const pPlus2 = (cellB + cellD) / n;
  const pE = p1Plus * pPlus1 + p2Plus * pPlus2;

  // Cohen's Kappa
  const kappa = (pO - pE) / (1 - pE);

  // Standard error (Fleiss)
  const seKappa = Math.sqrt((pO * (1 - pO)) / (n * Math.pow(1 - pE, 2)));

  // 95% CI
  const ciLower = kappa - 1.96 * seKappa;
  const ciUpper = kappa + 1.96 * seKappa;

  // Z-test against 0
  const zStat = kappa / seKappa;

  // Interpretation
  let interpretation;
  if (kappa < 0) interpretation = 'Less than chance';
  else if (kappa < 0.20) interpretation = 'Slight';
  else if (kappa < 0.40) interpretation = 'Fair';
  else if (kappa < 0.60) interpretation = 'Moderate';
  else if (kappa < 0.80) interpretation = 'Substantial';
  else interpretation = 'Almost Perfect';

  return {
    studyType: 'Agreement Study',
    type: 'kappa-from-table',
    method: "Cohen's Kappa from 2×2 Table",
    inputs: {
      'Both Positive (a)': cellA,
      'Rater 1 Pos, Rater 2 Neg (b)': cellB,
      'Rater 1 Neg, Rater 2 Pos (c)': cellC,
      'Both Negative (d)': cellD,
      'Total N': n
    },
    formula: 'kappa = (P_o - P_e) / (1 - P_e)',
    formulaExplanation: 'Agreement beyond chance / maximum possible agreement beyond chance',
    steps: [
      { title: 'Calculate Observed Agreement', calc: `P_o = (${cellA} + ${cellD}) / ${n} = ${roundUp(pO, 4)}` },
      { title: 'Calculate Marginal Proportions', calc: `p1+ = ${roundUp(p1Plus, 3)}, p+1 = ${roundUp(pPlus1, 3)}, p2+ = ${roundUp(p2Plus, 3)}, p+2 = ${roundUp(pPlus2, 3)}` },
      { title: 'Calculate Expected Agreement', calc: `P_e = ${roundUp(p1Plus, 3)}×${roundUp(pPlus1, 3)} + ${roundUp(p2Plus, 3)}×${roundUp(pPlus2, 3)} = ${roundUp(pE, 4)}` },
      { title: 'Calculate Kappa', calc: `kappa = (${roundUp(pO, 3)} - ${roundUp(pE, 3)}) / (1 - ${roundUp(pE, 3)}) = ${roundUp(kappa, 4)}` },
      { title: 'Calculate 95% CI', calc: `95% CI = [${roundUp(ciLower, 3)}, ${roundUp(ciUpper, 3)}]` }
    ],
    results: {
      "Cohen's Kappa": roundUp(kappa, 4),
      'Standard Error': roundUp(seKappa, 4),
      '95% CI Lower': roundUp(ciLower, 4),
      '95% CI Upper': roundUp(ciUpper, 4),
      'Z-statistic': roundUp(zStat, 3),
      'Interpretation': interpretation,
      'Observed Agreement': `${roundUp(pO * 100, 1)}%`,
      'Expected Agreement': `${roundUp(pE * 100, 1)}%`
    },
    interpretation: `Cohen's Kappa = ${roundUp(kappa, 3)} (95% CI: ${roundUp(ciLower, 3)} to ${roundUp(ciUpper, 3)}), indicating ${interpretation.toLowerCase()} agreement beyond chance. Observed agreement was ${roundUp(pO * 100, 1)}%, while ${roundUp(pE * 100, 1)}% would be expected by chance alone.`,
    recommendations: [
      'kappa < 0.20 = slight, 0.21-0.40 = fair, 0.41-0.60 = moderate',
      '0.61-0.80 = substantial, > 0.80 = almost perfect',
      'Consider prevalence and bias effects on kappa',
      'Report both kappa and observed agreement'
    ],
    reference: 'Landis, J. R., & Koch, G. G. (1977). The measurement of observer agreement for categorical data. Biometrics, 33(1), 159-174.'
  };
}
