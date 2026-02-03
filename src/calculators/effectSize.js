// Effect Size Calculator Logic
// Cohen's d, Hedges' g, Glass's delta, Correlation r, Odds Ratio

import { roundUp } from '../hooks/useCalculator';

// Cohen's d - Standardized Mean Difference
export function calculateCohensD(inputs) {
  const { mean1, mean2, sd1, sd2, n1, n2 } = inputs;

  const m1 = parseFloat(mean1);
  const m2 = parseFloat(mean2);
  const s1 = parseFloat(sd1);
  const s2 = parseFloat(sd2);
  const sampleN1 = parseInt(n1);
  const sampleN2 = parseInt(n2);

  // Pooled standard deviation
  const pooledSD = Math.sqrt(((sampleN1 - 1) * s1 * s1 + (sampleN2 - 1) * s2 * s2) / (sampleN1 + sampleN2 - 2));

  // Cohen's d
  const d = (m1 - m2) / pooledSD;
  const absD = Math.abs(d);

  // Effect size interpretation
  let interpretation;
  if (absD < 0.2) interpretation = 'Negligible';
  else if (absD < 0.5) interpretation = 'Small';
  else if (absD < 0.8) interpretation = 'Medium';
  else interpretation = 'Large';

  // Confidence interval for d (approximate)
  const se = Math.sqrt((sampleN1 + sampleN2) / (sampleN1 * sampleN2) + (d * d) / (2 * (sampleN1 + sampleN2)));
  const ciLower = d - 1.96 * se;
  const ciUpper = d + 1.96 * se;

  // Convert to r
  const r = d / Math.sqrt(d * d + 4);

  // Convert to Common Language Effect Size
  const cles = Math.round(100 * (1 / (1 + Math.exp(-d * 1.7))));

  return {
    studyType: 'Effect Size',
    type: 'cohens-d',
    method: "Cohen's d (Standardized Mean Difference)",
    inputs: {
      'Group 1 Mean': m1,
      'Group 2 Mean': m2,
      'Group 1 SD': s1,
      'Group 2 SD': s2,
      'Group 1 N': sampleN1,
      'Group 2 N': sampleN2
    },
    formula: 'd = (M1 - M2) / SD_pooled',
    formulaExplanation: 'Standardized difference between means using pooled standard deviation',
    steps: [
      { title: 'Calculate Pooled SD', calc: `SD_pooled = sqrt(((${sampleN1}-1)×${s1}² + (${sampleN2}-1)×${s2}²) / (${sampleN1}+${sampleN2}-2)) = ${roundUp(pooledSD, 4)}` },
      { title: "Calculate Cohen's d", calc: `d = (${m1} - ${m2}) / ${roundUp(pooledSD, 4)} = ${roundUp(d, 4)}` },
      { title: 'Calculate Standard Error', calc: `SE = sqrt((${sampleN1}+${sampleN2})/(${sampleN1}×${sampleN2}) + d²/(2×(${sampleN1}+${sampleN2}))) = ${roundUp(se, 4)}` },
      { title: 'Calculate 95% CI', calc: `95% CI = ${roundUp(d, 3)} ± 1.96 × ${roundUp(se, 4)} = [${roundUp(ciLower, 3)}, ${roundUp(ciUpper, 3)}]` },
      { title: 'Convert to Correlation r', calc: `r = d / sqrt(d² + 4) = ${roundUp(r, 4)}` }
    ],
    results: {
      "Cohen's d": roundUp(d, 4),
      'Interpretation': interpretation,
      '95% CI Lower': roundUp(ciLower, 3),
      '95% CI Upper': roundUp(ciUpper, 3),
      'Correlation r': roundUp(r, 4),
      'CLES': `${cles}%`
    },
    interpretation: `Cohen's d = ${roundUp(d, 3)}, indicating a ${interpretation.toLowerCase()} effect. The 95% confidence interval ranges from ${roundUp(ciLower, 3)} to ${roundUp(ciUpper, 3)}. The Common Language Effect Size (CLES) suggests that ${cles}% of the time a randomly selected person from group 1 will have a higher score than a randomly selected person from group 2.`,
    recommendations: [
      'd < 0.2 = negligible, 0.2-0.5 = small, 0.5-0.8 = medium, > 0.8 = large',
      'Report effect size with confidence interval',
      'Consider practical significance alongside statistical significance',
      'CLES provides intuitive interpretation'
    ],
    reference: 'Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.'
  };
}

// Hedges' g - Bias-corrected effect size
export function calculateHedgesG(inputs) {
  const { mean1, mean2, sd1, sd2, n1, n2 } = inputs;

  const m1 = parseFloat(mean1);
  const m2 = parseFloat(mean2);
  const s1 = parseFloat(sd1);
  const s2 = parseFloat(sd2);
  const sampleN1 = parseInt(n1);
  const sampleN2 = parseInt(n2);

  // Pooled standard deviation
  const pooledSD = Math.sqrt(((sampleN1 - 1) * s1 * s1 + (sampleN2 - 1) * s2 * s2) / (sampleN1 + sampleN2 - 2));

  // Cohen's d
  const d = (m1 - m2) / pooledSD;

  // Hedges' g correction factor
  const df = sampleN1 + sampleN2 - 2;
  const correctionFactor = 1 - (3 / (4 * df - 1));
  const g = d * correctionFactor;
  const absG = Math.abs(g);

  // Effect size interpretation
  let interpretation;
  if (absG < 0.2) interpretation = 'Negligible';
  else if (absG < 0.5) interpretation = 'Small';
  else if (absG < 0.8) interpretation = 'Medium';
  else interpretation = 'Large';

  // Variance and CI for g
  const varG = ((sampleN1 + sampleN2) / (sampleN1 * sampleN2) + (g * g) / (2 * df)) * correctionFactor * correctionFactor;
  const seG = Math.sqrt(varG);
  const ciLower = g - 1.96 * seG;
  const ciUpper = g + 1.96 * seG;

  return {
    studyType: 'Effect Size',
    type: 'hedges-g',
    method: "Hedges' g (Bias-Corrected Effect Size)",
    inputs: {
      'Group 1 Mean': m1,
      'Group 2 Mean': m2,
      'Group 1 SD': s1,
      'Group 2 SD': s2,
      'Group 1 N': sampleN1,
      'Group 2 N': sampleN2
    },
    formula: 'g = d × (1 - 3/(4df - 1))',
    formulaExplanation: "Cohen's d with small-sample bias correction",
    steps: [
      { title: "Calculate Cohen's d", calc: `d = (${m1} - ${m2}) / ${roundUp(pooledSD, 4)} = ${roundUp(d, 4)}` },
      { title: 'Calculate Correction Factor', calc: `J = 1 - 3/(4×${df} - 1) = ${roundUp(correctionFactor, 4)}` },
      { title: "Calculate Hedges' g", calc: `g = ${roundUp(d, 4)} × ${roundUp(correctionFactor, 4)} = ${roundUp(g, 4)}` },
      { title: 'Calculate Standard Error', calc: `SE(g) = ${roundUp(seG, 4)}` },
      { title: 'Calculate 95% CI', calc: `95% CI = [${roundUp(ciLower, 3)}, ${roundUp(ciUpper, 3)}]` }
    ],
    results: {
      "Hedges' g": roundUp(g, 4),
      "Cohen's d (uncorrected)": roundUp(d, 4),
      'Correction Factor': roundUp(correctionFactor, 4),
      'Interpretation': interpretation,
      '95% CI Lower': roundUp(ciLower, 3),
      '95% CI Upper': roundUp(ciUpper, 3)
    },
    interpretation: `Hedges' g = ${roundUp(g, 3)}, indicating a ${interpretation.toLowerCase()} effect. This is the bias-corrected version of Cohen's d (${roundUp(d, 3)}). For small samples, Hedges' g provides a less biased estimate. The 95% confidence interval is [${roundUp(ciLower, 3)}, ${roundUp(ciUpper, 3)}].`,
    recommendations: [
      "Use Hedges' g for small samples (n < 20 per group)",
      "For large samples, g approximates Cohen's d",
      'Preferred for meta-analysis',
      'Report with confidence interval'
    ],
    reference: 'Hedges, L.V. (1981). Distribution theory for Glass\'s estimator of effect size. JASA, 76(373), 107-112.'
  };
}

// Odds Ratio Effect Size
export function calculateOddsRatioES(inputs) {
  const { a, b, c, d: cellD } = inputs;

  const cellA = parseInt(a); // Exposed + Outcome
  const cellB = parseInt(b); // Exposed + No Outcome
  const cellC = parseInt(c); // Not Exposed + Outcome
  const cellDD = parseInt(cellD); // Not Exposed + No Outcome

  // Odds Ratio
  const or = (cellA * cellDD) / (cellB * cellC);
  const logOR = Math.log(or);

  // Standard Error of log(OR)
  const seLogOR = Math.sqrt(1/cellA + 1/cellB + 1/cellC + 1/cellDD);

  // 95% CI for OR
  const ciLowerLog = logOR - 1.96 * seLogOR;
  const ciUpperLog = logOR + 1.96 * seLogOR;
  const ciLower = Math.exp(ciLowerLog);
  const ciUpper = Math.exp(ciUpperLog);

  // Convert OR to Cohen's d
  const dFromOR = Math.log(or) * Math.sqrt(3) / Math.PI;

  // Interpretation
  let interpretation;
  if (or < 0.5) interpretation = 'Strong protective effect';
  else if (or < 0.8) interpretation = 'Moderate protective effect';
  else if (or <= 1.25) interpretation = 'No meaningful effect';
  else if (or <= 2) interpretation = 'Moderate risk increase';
  else interpretation = 'Strong risk increase';

  return {
    studyType: 'Effect Size',
    type: 'odds-ratio',
    method: 'Odds Ratio Effect Size',
    inputs: {
      'Exposed + Outcome (a)': cellA,
      'Exposed + No Outcome (b)': cellB,
      'Not Exposed + Outcome (c)': cellC,
      'Not Exposed + No Outcome (d)': cellDD
    },
    formula: 'OR = (a × d) / (b × c)',
    formulaExplanation: 'Ratio of odds of outcome in exposed vs unexposed',
    steps: [
      { title: 'Calculate Odds Ratio', calc: `OR = (${cellA} × ${cellDD}) / (${cellB} × ${cellC}) = ${roundUp(or, 4)}` },
      { title: 'Calculate Log(OR)', calc: `ln(OR) = ${roundUp(logOR, 4)}` },
      { title: 'Calculate SE of Log(OR)', calc: `SE = sqrt(1/${cellA} + 1/${cellB} + 1/${cellC} + 1/${cellDD}) = ${roundUp(seLogOR, 4)}` },
      { title: 'Calculate 95% CI', calc: `95% CI = [${roundUp(ciLower, 3)}, ${roundUp(ciUpper, 3)}]` },
      { title: "Convert to Cohen's d", calc: `d = ln(OR) × sqrt(3)/pi = ${roundUp(dFromOR, 4)}` }
    ],
    results: {
      'Odds Ratio': roundUp(or, 4),
      'Log(OR)': roundUp(logOR, 4),
      '95% CI Lower': roundUp(ciLower, 3),
      '95% CI Upper': roundUp(ciUpper, 3),
      "Equivalent Cohen's d": roundUp(dFromOR, 4),
      'Interpretation': interpretation
    },
    interpretation: `The Odds Ratio is ${roundUp(or, 3)} (95% CI: ${roundUp(ciLower, 3)} to ${roundUp(ciUpper, 3)}). ${interpretation}. ${or > 1 ? `Those exposed have ${roundUp(or, 2)} times the odds of the outcome compared to unexposed.` : `Those exposed have ${roundUp(1/or, 2)} times lower odds of the outcome.`} Equivalent Cohen's d = ${roundUp(dFromOR, 3)}.`,
    recommendations: [
      'OR = 1 indicates no association',
      'OR > 1 indicates increased odds with exposure',
      'OR < 1 indicates decreased odds with exposure',
      'CI not crossing 1 indicates statistical significance'
    ],
    reference: 'Chinn, S. (2000). A simple method for converting an odds ratio to effect size. Statistics in Medicine, 19(22), 3127-3131.'
  };
}

// Correlation r from t-statistic
export function calculateRFromT(inputs) {
  const { tValue, df } = inputs;

  const t = parseFloat(tValue);
  const degrees = parseInt(df);

  // r from t
  const r = Math.sqrt((t * t) / (t * t + degrees));
  const rSigned = t >= 0 ? r : -r;

  // r-squared
  const rSquared = r * r;

  // Fisher's z transformation
  const fisherZ = 0.5 * Math.log((1 + rSigned) / (1 - rSigned));

  // SE of Fisher's z
  const seFisherZ = 1 / Math.sqrt(degrees - 1);

  // CI for r via Fisher's z
  const zLower = fisherZ - 1.96 * seFisherZ;
  const zUpper = fisherZ + 1.96 * seFisherZ;
  const rLower = (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1);
  const rUpper = (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1);

  // Interpretation
  let interpretation;
  const absR = Math.abs(rSigned);
  if (absR < 0.1) interpretation = 'Negligible';
  else if (absR < 0.3) interpretation = 'Small';
  else if (absR < 0.5) interpretation = 'Medium';
  else interpretation = 'Large';

  // Convert to Cohen's d
  const dFromR = (2 * rSigned) / Math.sqrt(1 - rSigned * rSigned);

  return {
    studyType: 'Effect Size',
    type: 'r-from-t',
    method: 'Correlation r from t-statistic',
    inputs: {
      't-value': t,
      'Degrees of Freedom': degrees
    },
    formula: 'r = sqrt(t² / (t² + df))',
    formulaExplanation: 'Correlation coefficient derived from t-test statistic',
    steps: [
      { title: 'Calculate r', calc: `r = sqrt(${t}² / (${t}² + ${degrees})) = ${roundUp(r, 4)}` },
      { title: 'Apply Sign', calc: `r (signed) = ${roundUp(rSigned, 4)}` },
      { title: 'Calculate r²', calc: `r² = ${roundUp(rSquared, 4)} (${roundUp(rSquared * 100, 1)}% variance explained)` },
      { title: "Fisher's z Transform", calc: `z = 0.5 × ln((1+r)/(1-r)) = ${roundUp(fisherZ, 4)}` },
      { title: '95% CI for r', calc: `95% CI = [${roundUp(rLower, 3)}, ${roundUp(rUpper, 3)}]` }
    ],
    results: {
      'Correlation r': roundUp(rSigned, 4),
      'r-squared': roundUp(rSquared, 4),
      '% Variance Explained': `${roundUp(rSquared * 100, 1)}%`,
      '95% CI Lower': roundUp(rLower, 3),
      '95% CI Upper': roundUp(rUpper, 3),
      "Equivalent Cohen's d": roundUp(dFromR, 4),
      'Interpretation': interpretation
    },
    interpretation: `The correlation r = ${roundUp(rSigned, 3)}, indicating a ${interpretation.toLowerCase()} effect. This explains ${roundUp(rSquared * 100, 1)}% of the variance. The 95% confidence interval for r is [${roundUp(rLower, 3)}, ${roundUp(rUpper, 3)}]. Equivalent Cohen's d = ${roundUp(dFromR, 3)}.`,
    recommendations: [
      'r < 0.1 negligible, 0.1-0.3 small, 0.3-0.5 medium, > 0.5 large',
      'r² indicates proportion of variance explained',
      'Use Fisher z for comparing correlations',
      'Report with confidence interval'
    ],
    reference: 'Rosenthal, R., & Rosnow, R. L. (1991). Essentials of Behavioral Research (2nd ed.). McGraw-Hill.'
  };
}

// Eta-squared and Partial Eta-squared
export function calculateEtaSquared(inputs) {
  const { ssEffect, ssError, ssTotal, dfEffect, dfError } = inputs;

  const effect = parseFloat(ssEffect);
  const error = parseFloat(ssError);
  const total = parseFloat(ssTotal) || (effect + error);
  const dfEff = parseInt(dfEffect);
  const dfErr = parseInt(dfError);

  // Eta-squared
  const etaSquared = effect / total;

  // Partial Eta-squared
  const partialEtaSquared = effect / (effect + error);

  // Omega-squared (less biased)
  const msEffect = effect / dfEff;
  const msError = error / dfErr;
  const omegaSquared = (effect - dfEff * msError) / (total + msError);

  // Cohen's f from eta-squared
  const cohensF = Math.sqrt(etaSquared / (1 - etaSquared));

  // Interpretation
  let interpretation;
  if (etaSquared < 0.01) interpretation = 'Negligible';
  else if (etaSquared < 0.06) interpretation = 'Small';
  else if (etaSquared < 0.14) interpretation = 'Medium';
  else interpretation = 'Large';

  return {
    studyType: 'Effect Size',
    type: 'eta-squared',
    method: 'Eta-squared and Partial Eta-squared',
    inputs: {
      'SS Effect': effect,
      'SS Error': error,
      'SS Total': total,
      'df Effect': dfEff,
      'df Error': dfErr
    },
    formula: 'eta² = SS_effect / SS_total; partial eta² = SS_effect / (SS_effect + SS_error)',
    formulaExplanation: 'Proportion of variance accounted for by the effect',
    steps: [
      { title: 'Calculate Eta-squared', calc: `eta² = ${effect} / ${total} = ${roundUp(etaSquared, 4)}` },
      { title: 'Calculate Partial Eta-squared', calc: `partial eta² = ${effect} / (${effect} + ${error}) = ${roundUp(partialEtaSquared, 4)}` },
      { title: 'Calculate MS values', calc: `MS_effect = ${roundUp(msEffect, 2)}, MS_error = ${roundUp(msError, 2)}` },
      { title: 'Calculate Omega-squared', calc: `omega² = (${effect} - ${dfEff}×${roundUp(msError, 2)}) / (${total} + ${roundUp(msError, 2)}) = ${roundUp(omegaSquared, 4)}` },
      { title: "Calculate Cohen's f", calc: `f = sqrt(eta² / (1 - eta²)) = ${roundUp(cohensF, 4)}` }
    ],
    results: {
      'Eta-squared': roundUp(etaSquared, 4),
      'Partial Eta-squared': roundUp(partialEtaSquared, 4),
      'Omega-squared': roundUp(Math.max(0, omegaSquared), 4),
      "Cohen's f": roundUp(cohensF, 4),
      'Interpretation': interpretation,
      '% Variance Explained': `${roundUp(etaSquared * 100, 1)}%`
    },
    interpretation: `Eta-squared = ${roundUp(etaSquared, 4)}, indicating a ${interpretation.toLowerCase()} effect. The effect accounts for ${roundUp(etaSquared * 100, 1)}% of total variance. Omega-squared (${roundUp(Math.max(0, omegaSquared), 4)}) provides a less biased population estimate. Equivalent Cohen's f = ${roundUp(cohensF, 3)}.`,
    recommendations: [
      'eta² < 0.01 negligible, 0.01-0.06 small, 0.06-0.14 medium, > 0.14 large',
      'Partial eta² useful for factorial designs',
      'Omega² preferred for population inference',
      'Report the effect size appropriate for your design'
    ],
    reference: 'Richardson, J.T.E. (2011). Eta squared and partial eta squared as measures of effect size. Educational Research Review, 6(2), 135-147.'
  };
}
