// Survival Analysis Calculator Logic
// Log-rank test, Kaplan-Meier, Cox Proportional Hazards

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

// Log-rank Test Sample Size
export function calculateLogRank(inputs) {
  const { survivalControl, survivalTreatment, alpha, power, ratio, accrualTime, followUpTime } = inputs;

  const s1 = parseFloat(survivalControl) / 100;
  const s2 = parseFloat(survivalTreatment) / 100;
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;
  const r = parseFloat(ratio) || 1;
  const ta = parseFloat(accrualTime) || 12;
  const tf = parseFloat(followUpTime) || 12;

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  // Calculate hazard rates
  const lambda1 = -Math.log(s1) / (ta + tf);
  const lambda2 = -Math.log(s2) / (ta + tf);
  const hr = lambda2 / lambda1;

  // Schoenfeld formula for log-rank test
  const logHR = Math.log(hr);
  const d = Math.pow((zAlpha + zBeta) / logHR, 2) * Math.pow(1 + r, 2) / r;
  const events = Math.ceil(d);

  // Estimate total sample size based on expected events
  const avgSurvival = (s1 + s2) / 2;
  const eventRate = 1 - avgSurvival;
  const totalN = Math.ceil(events / eventRate);
  const n1 = Math.ceil(totalN / (1 + r));
  const n2 = Math.ceil(totalN - n1);

  return {
    studyType: 'Survival Analysis',
    type: 'log-rank',
    method: 'Log-rank Test (Schoenfeld Formula)',
    inputs: {
      'Control Group Survival Rate': `${survivalControl}%`,
      'Treatment Group Survival Rate': `${survivalTreatment}%`,
      'Significance Level (alpha)': alphaVal,
      'Power': `${power}%`,
      'Allocation Ratio': `1:${r}`,
      'Accrual Time': `${ta} months`,
      'Follow-up Time': `${tf} months`
    },
    formula: 'd = ((Z_alpha + Z_beta) / ln(HR))^2 × (1+r)^2 / r',
    formulaExplanation: 'Schoenfeld formula for required number of events in log-rank test',
    steps: [
      { title: 'Calculate Hazard Rates', calc: `lambda1 = -ln(${s1})/${ta+tf} = ${roundUp(lambda1, 4)}, lambda2 = -ln(${s2})/${ta+tf} = ${roundUp(lambda2, 4)}` },
      { title: 'Calculate Hazard Ratio', calc: `HR = lambda2/lambda1 = ${roundUp(hr, 3)}` },
      { title: 'Get Z-scores', calc: `Z_alpha = ${roundUp(zAlpha, 3)}, Z_beta = ${roundUp(zBeta, 3)}` },
      { title: 'Calculate Required Events', calc: `d = ((${roundUp(zAlpha, 2)} + ${roundUp(zBeta, 2)}) / ln(${roundUp(hr, 3)}))^2 × (1+${r})^2 / ${r} = ${events}` },
      { title: 'Estimate Total Sample', calc: `N = ${events} / ${roundUp(eventRate, 3)} = ${totalN}` }
    ],
    results: {
      'Required Events': events,
      'Total Sample Size': totalN,
      'Control Group (n1)': n1,
      'Treatment Group (n2)': n2,
      'Hazard Ratio': roundUp(hr, 3)
    },
    interpretation: `To detect a hazard ratio of ${roundUp(hr, 3)} (survival ${survivalControl}% vs ${survivalTreatment}%) with ${power}% power at alpha=${alphaVal}, you need ${events} events. This requires approximately ${totalN} total participants (${n1} in control, ${n2} in treatment) assuming ${roundUp(eventRate*100, 1)}% event rate over the study period.`,
    recommendations: [
      `Plan for ${events} events minimum`,
      'Consider interim analyses for early stopping',
      'Account for dropout and lost to follow-up',
      'Verify proportional hazards assumption'
    ],
    reference: 'Schoenfeld, D. (1983). Sample-size formula for the proportional-hazards regression model. Biometrics, 39(2), 499-503.'
  };
}

// Kaplan-Meier Survival Estimate
export function calculateKaplanMeier(inputs) {
  const { events, totalAtRisk, timePoints, precision, confidence } = inputs;

  const d = parseInt(events);
  const n = parseInt(totalAtRisk);
  const t = parseFloat(timePoints) || 12;
  const e = parseFloat(precision) || 0.05;
  const confLevel = parseFloat(confidence) || 0.95;

  const zAlpha = normalInv(1 - (1 - confLevel) / 2);

  // Point estimate of survival
  const survivalEst = (n - d) / n;

  // Greenwood's formula for variance
  const variance = (survivalEst * (1 - survivalEst)) / n;
  const se = Math.sqrt(variance);

  // Confidence interval
  const ciLower = Math.max(0, survivalEst - zAlpha * se);
  const ciUpper = Math.min(1, survivalEst + zAlpha * se);

  // Sample size for desired precision
  const requiredN = Math.ceil(Math.pow(zAlpha, 2) * survivalEst * (1 - survivalEst) / Math.pow(e, 2));

  return {
    studyType: 'Survival Analysis',
    type: 'kaplan-meier',
    method: 'Kaplan-Meier Survival Estimate',
    inputs: {
      'Number of Events': d,
      'Total at Risk': n,
      'Time Point': `${t} months`,
      'Desired Precision': `±${e * 100}%`,
      'Confidence Level': `${confLevel * 100}%`
    },
    formula: 'S(t) = (n - d) / n; SE = sqrt(S(t)(1-S(t))/n)',
    formulaExplanation: 'Kaplan-Meier estimator with Greenwood variance formula',
    steps: [
      { title: 'Calculate Survival Estimate', calc: `S(t) = (${n} - ${d}) / ${n} = ${roundUp(survivalEst, 4)}` },
      { title: 'Calculate Standard Error', calc: `SE = sqrt(${roundUp(survivalEst, 3)} × ${roundUp(1-survivalEst, 3)} / ${n}) = ${roundUp(se, 4)}` },
      { title: 'Calculate Confidence Interval', calc: `${confLevel*100}% CI = ${roundUp(survivalEst, 3)} ± ${roundUp(zAlpha, 2)} × ${roundUp(se, 4)} = [${roundUp(ciLower, 3)}, ${roundUp(ciUpper, 3)}]` },
      { title: 'Required Sample for Precision', calc: `n = ${roundUp(zAlpha, 2)}^2 × ${roundUp(survivalEst, 3)} × ${roundUp(1-survivalEst, 3)} / ${e}^2 = ${requiredN}` }
    ],
    results: {
      'Survival Estimate': `${roundUp(survivalEst * 100, 1)}%`,
      'Standard Error': roundUp(se, 4),
      [`${confLevel*100}% CI Lower`]: `${roundUp(ciLower * 100, 1)}%`,
      [`${confLevel*100}% CI Upper`]: `${roundUp(ciUpper * 100, 1)}%`,
      'Required N for Precision': requiredN
    },
    interpretation: `At ${t} months, the estimated survival probability is ${roundUp(survivalEst * 100, 1)}% (${confLevel*100}% CI: ${roundUp(ciLower * 100, 1)}% to ${roundUp(ciUpper * 100, 1)}%). To achieve a precision of ±${e * 100}%, you would need ${requiredN} participants at risk.`,
    recommendations: [
      'Report median survival time if calculable',
      'Consider competing risks if applicable',
      'Present survival curves graphically',
      'Check for informative censoring'
    ],
    reference: 'Kaplan, E. L., & Meier, P. (1958). Nonparametric estimation from incomplete observations. JASA, 53(282), 457-481.'
  };
}

// Cox Proportional Hazards Sample Size
export function calculateCoxPH(inputs) {
  const { hazardRatio, eventProbability, alpha, power, r2, numCovariates } = inputs;

  const hr = parseFloat(hazardRatio);
  const pEvent = parseFloat(eventProbability) / 100;
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;
  const r2Val = parseFloat(r2) || 0;
  const k = parseInt(numCovariates) || 1;

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  const logHR = Math.log(hr);

  // Hsieh & Lavori formula for Cox regression
  const d = Math.pow((zAlpha + zBeta) / logHR, 2) * 4 / (1 - r2Val);
  const events = Math.ceil(d);

  // Total sample size
  const totalN = Math.ceil(events / pEvent);

  // Events per variable rule (EPV)
  const epv = events / k;
  const epvAdequate = epv >= 10;

  return {
    studyType: 'Survival Analysis',
    type: 'cox-ph',
    method: 'Cox Proportional Hazards Model',
    inputs: {
      'Hazard Ratio to Detect': hr,
      'Event Probability': `${eventProbability}%`,
      'Significance Level (alpha)': alphaVal,
      'Power': `${power}%`,
      'R² with Other Covariates': r2Val,
      'Number of Covariates': k
    },
    formula: 'd = 4(Z_alpha + Z_beta)² / (ln(HR))² / (1-R²)',
    formulaExplanation: 'Hsieh & Lavori formula for Cox regression sample size',
    steps: [
      { title: 'Get Z-scores', calc: `Z_alpha = ${roundUp(zAlpha, 3)}, Z_beta = ${roundUp(zBeta, 3)}` },
      { title: 'Calculate Log Hazard Ratio', calc: `ln(HR) = ln(${hr}) = ${roundUp(logHR, 4)}` },
      { title: 'Calculate Required Events', calc: `d = 4 × (${roundUp(zAlpha, 2)} + ${roundUp(zBeta, 2)})² / (${roundUp(logHR, 3)})² / (1 - ${r2Val}) = ${events}` },
      { title: 'Calculate Total Sample', calc: `N = ${events} / ${pEvent} = ${totalN}` },
      { title: 'Check Events per Variable', calc: `EPV = ${events} / ${k} = ${roundUp(epv, 1)} (${epvAdequate ? 'adequate ≥10' : 'may be insufficient <10'})` }
    ],
    results: {
      'Required Events': events,
      'Total Sample Size': totalN,
      'Events per Variable': roundUp(epv, 1),
      'EPV Adequate': epvAdequate ? 'Yes' : 'No'
    },
    interpretation: `To detect a hazard ratio of ${hr} with ${power}% power at alpha=${alphaVal}, you need ${events} events. With an expected event rate of ${eventProbability}%, this requires ${totalN} total participants. Events per variable ratio is ${roundUp(epv, 1)}, which is ${epvAdequate ? 'adequate (≥10)' : 'potentially insufficient (<10, consider reducing covariates)'}.`,
    recommendations: [
      epvAdequate ? 'EPV is adequate for stable estimates' : 'Consider reducing number of covariates for EPV ≥10',
      'Verify proportional hazards assumption',
      'Consider time-varying covariates if needed',
      'Plan for sensitivity analyses'
    ],
    reference: 'Hsieh, F. Y., & Lavori, P. W. (2000). Sample-size calculations for the Cox proportional hazards regression model. Controlled Clinical Trials, 21(6), 552-560.'
  };
}
