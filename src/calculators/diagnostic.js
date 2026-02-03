// Diagnostic Accuracy Calculator Logic
// Sensitivity, Specificity, and Predictive Values

import { roundUp } from '../hooks/useCalculator';

// Inverse normal CDF
function normalInv(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

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

// Sample Size for Sensitivity Estimation
export function calculateSensitivity(inputs) {
  const { sens, precision, alpha, prevalence } = inputs;

  const sensVal = parseFloat(sens);
  const precVal = parseFloat(precision);
  const prevVal = parseFloat(prevalence);

  // Z-score for confidence level
  const zAlpha = normalInv(1 - parseFloat(alpha) / 2);

  // Number of diseased subjects needed
  const nDiseased = roundUp((zAlpha * zAlpha * sensVal * (1 - sensVal)) / (precVal * precVal));

  // Total sample size based on prevalence
  const totalN = roundUp(nDiseased / prevVal);

  const confLevel = parseFloat(alpha) === 0.05 ? '95%' : parseFloat(alpha) === 0.01 ? '99%' : '90%';

  const interpretation = `To estimate sensitivity of ${(sensVal * 100).toFixed(0)}% with precision of ±${(precVal * 100).toFixed(0)}% at ${confLevel} confidence, you need ${nDiseased} diseased subjects. Given an expected prevalence of ${(prevVal * 100).toFixed(0)}%, the total sample size required is ${totalN} subjects.`;

  return {
    type: 'sensitivity',
    studyType: 'Diagnostic Study - Sensitivity',
    method: 'Precision-based sample size for sensitivity',
    inputs: {
      'Expected Sensitivity': `${(sensVal * 100).toFixed(0)}%`,
      'Desired Precision': `±${(precVal * 100).toFixed(0)}%`,
      'Confidence Level': confLevel,
      'Disease Prevalence': `${(prevVal * 100).toFixed(0)}%`
    },
    formula: 'n = Z² × Sens × (1-Sens) / d²',
    formulaExplanation: 'Z = Z-score for confidence | Sens = expected sensitivity | d = desired precision',
    steps: [
      { title: 'Get Z-score for confidence level', calc: `Z = ${zAlpha.toFixed(4)}` },
      { title: 'Calculate variance term', calc: `Sens × (1-Sens) = ${sensVal} × ${(1-sensVal).toFixed(4)} = ${(sensVal * (1-sensVal)).toFixed(4)}` },
      { title: 'Calculate diseased subjects needed', calc: `n_diseased = (${zAlpha.toFixed(4)}² × ${(sensVal * (1-sensVal)).toFixed(4)}) / ${precVal}² = ${nDiseased}` },
      { title: 'Calculate total sample (based on prevalence)', calc: `N_total = ${nDiseased} / ${prevVal} = ${totalN}` }
    ],
    results: {
      'Diseased Subjects': nDiseased,
      'Total Sample Size': totalN,
      'Expected Non-diseased': totalN - nDiseased
    },
    interpretation,
    recommendations: [
      'Use consecutive sampling to minimize selection bias',
      'Include patients with spectrum of disease severity',
      'Consider STARD guidelines for reporting',
      'Plan for indeterminate test results'
    ],
    reference: 'Flahault, A., Cadilhac, M., & Thomas, G. (2005). Sample size calculation should be performed for design accuracy in diagnostic test studies. J Clin Epidemiol, 58(8), 859-862.'
  };
}

// Sample Size for Specificity Estimation
export function calculateSpecificity(inputs) {
  const { spec, precision, alpha, prevalence } = inputs;

  const specVal = parseFloat(spec);
  const precVal = parseFloat(precision);
  const prevVal = parseFloat(prevalence);

  const zAlpha = normalInv(1 - parseFloat(alpha) / 2);

  // Number of non-diseased subjects needed
  const nNonDiseased = roundUp((zAlpha * zAlpha * specVal * (1 - specVal)) / (precVal * precVal));

  // Total sample size based on prevalence
  const totalN = roundUp(nNonDiseased / (1 - prevVal));

  const confLevel = parseFloat(alpha) === 0.05 ? '95%' : parseFloat(alpha) === 0.01 ? '99%' : '90%';

  const interpretation = `To estimate specificity of ${(specVal * 100).toFixed(0)}% with precision of ±${(precVal * 100).toFixed(0)}% at ${confLevel} confidence, you need ${nNonDiseased} non-diseased subjects. Given an expected prevalence of ${(prevVal * 100).toFixed(0)}%, the total sample size required is ${totalN} subjects.`;

  return {
    type: 'specificity',
    studyType: 'Diagnostic Study - Specificity',
    method: 'Precision-based sample size for specificity',
    inputs: {
      'Expected Specificity': `${(specVal * 100).toFixed(0)}%`,
      'Desired Precision': `±${(precVal * 100).toFixed(0)}%`,
      'Confidence Level': confLevel,
      'Disease Prevalence': `${(prevVal * 100).toFixed(0)}%`
    },
    formula: 'n = Z² × Spec × (1-Spec) / d²',
    formulaExplanation: 'Z = Z-score for confidence | Spec = expected specificity | d = desired precision',
    steps: [
      { title: 'Get Z-score for confidence level', calc: `Z = ${zAlpha.toFixed(4)}` },
      { title: 'Calculate variance term', calc: `Spec × (1-Spec) = ${specVal} × ${(1-specVal).toFixed(4)} = ${(specVal * (1-specVal)).toFixed(4)}` },
      { title: 'Calculate non-diseased subjects needed', calc: `n_non-diseased = (${zAlpha.toFixed(4)}² × ${(specVal * (1-specVal)).toFixed(4)}) / ${precVal}² = ${nNonDiseased}` },
      { title: 'Calculate total sample (based on prevalence)', calc: `N_total = ${nNonDiseased} / (1 - ${prevVal}) = ${totalN}` }
    ],
    results: {
      'Non-diseased Subjects': nNonDiseased,
      'Total Sample Size': totalN,
      'Expected Diseased': totalN - nNonDiseased
    },
    interpretation,
    recommendations: [
      'Ensure reference standard is applied to all subjects',
      'Include spectrum of non-disease conditions',
      'Document blinding procedures',
      'Report confidence intervals for all metrics'
    ],
    reference: 'Buderer, N. M. (1996). Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity. Acad Emerg Med, 3(9), 895-900.'
  };
}

// Sample Size for AUC (Area Under ROC Curve)
export function calculateAUC(inputs) {
  const { auc0, auc1, alpha, power, ratio } = inputs;

  const auc0Val = parseFloat(auc0); // Null hypothesis AUC
  const auc1Val = parseFloat(auc1); // Alternative hypothesis AUC

  const zAlpha = normalInv(1 - parseFloat(alpha) / 2);
  const zBeta = normalInv(parseFloat(power));

  const k = parseFloat(ratio) || 1;

  // Hanley & McNeil variance approximation
  const q0 = auc0Val / (2 - auc0Val);
  const q1 = auc1Val / (2 - auc1Val);
  const q2_0 = 2 * auc0Val * auc0Val / (1 + auc0Val);
  const q2_1 = 2 * auc1Val * auc1Val / (1 + auc1Val);

  const var0 = (auc0Val * (1 - auc0Val) + (1 - 1) * (q0 - auc0Val * auc0Val) + (k - 1) * (q2_0 - auc0Val * auc0Val)) / k;
  const var1 = (auc1Val * (1 - auc1Val) + (1 - 1) * (q1 - auc1Val * auc1Val) + (k - 1) * (q2_1 - auc1Val * auc1Val)) / k;

  // Simplified Obuchowski formula
  const se0 = Math.sqrt(auc0Val * (1 - auc0Val) * (1 + (k - 1) / 2));
  const se1 = Math.sqrt(auc1Val * (1 - auc1Val) * (1 + (k - 1) / 2));

  const nDiseased = roundUp(Math.pow((zAlpha * se0 + zBeta * se1) / (auc1Val - auc0Val), 2));
  const nNonDiseased = roundUp(nDiseased * k);
  const totalN = nDiseased + nNonDiseased;

  const interpretation = `To detect a difference in AUC from ${auc0Val.toFixed(2)} to ${auc1Val.toFixed(2)} with ${(parseFloat(power) * 100).toFixed(0)}% power at α = ${parseFloat(alpha)}, you need ${nDiseased} diseased and ${nNonDiseased} non-diseased subjects (total N = ${totalN}).`;

  return {
    type: 'auc',
    studyType: 'Diagnostic Study - ROC Analysis',
    method: 'Obuchowski formula for AUC comparison',
    inputs: {
      'Null AUC': auc0Val.toFixed(2),
      'Alternative AUC': auc1Val.toFixed(2),
      'AUC Difference': (auc1Val - auc0Val).toFixed(3),
      'Significance Level (α)': alpha,
      'Power (1-β)': `${(parseFloat(power) * 100).toFixed(0)}%`,
      'Non-diseased:Diseased Ratio': `${k}:1`
    },
    formula: 'n = [(Zα × SE₀ + Zβ × SE₁) / (AUC₁ - AUC₀)]²',
    formulaExplanation: 'AUC₀ = null hypothesis AUC | AUC₁ = alternative AUC | SE = standard error',
    steps: [
      { title: 'Calculate AUC difference', calc: `ΔAUC = ${auc1Val} - ${auc0Val} = ${(auc1Val - auc0Val).toFixed(4)}` },
      { title: 'Get Z-scores', calc: `Zα = ${zAlpha.toFixed(4)}, Zβ = ${zBeta.toFixed(4)}` },
      { title: 'Calculate standard errors', calc: `SE₀ = ${se0.toFixed(4)}, SE₁ = ${se1.toFixed(4)}` },
      { title: 'Calculate diseased subjects', calc: `n_diseased = ${nDiseased}` },
      { title: 'Calculate total sample', calc: `N = ${nDiseased} + ${nNonDiseased} = ${totalN}` }
    ],
    results: {
      'Diseased Subjects': nDiseased,
      'Non-diseased Subjects': nNonDiseased,
      'Total Sample Size': totalN
    },
    interpretation,
    recommendations: [
      'Use appropriate reference standard for disease classification',
      'Consider partial AUC if clinical focus is specific region',
      'Report AUC with confidence intervals',
      'Consider DeLong method for comparing correlated AUCs'
    ],
    reference: 'Obuchowski, N. A. (1998). Sample size calculations in studies of test accuracy. Stat Methods Med Res, 7(4), 371-392.'
  };
}

export default {
  calculateSensitivity,
  calculateSpecificity,
  calculateAUC
};
