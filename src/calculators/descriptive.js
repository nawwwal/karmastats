// Descriptive Studies Calculator Logic

import { getConfidenceLevel, roundUp, formatNumber } from '../hooks/useCalculator';

// Prevalence Estimation
export function calculatePrevalence(inputs) {
  const { p, d, z, deff, nonResponseRate } = inputs;
  const nr = nonResponseRate / 100;

  // Validation
  if (p <= 0 || p >= 1) {
    throw new Error('Prevalence must be between 0 and 1 (exclusive)');
  }
  if (d <= 0 || d >= 0.5) {
    throw new Error('Precision must be between 0 and 0.5');
  }

  // Step-by-step calculation
  const step1 = z * z;
  const step2 = p * (1 - p);
  const step3 = d * d;
  const step4 = (step1 * step2) / step3;
  const n = roundUp(step4 * deff);
  const nAdj = roundUp(n / (1 - nr));
  const ciWidth = (2 * d * 100).toFixed(1);

  const confLevel = getConfidenceLevel(z);
  const interpretation = `To estimate a population prevalence of ${(p * 100).toFixed(1)}% with a precision of ±${(d * 100).toFixed(1)}% at a ${confLevel} confidence level${deff > 1 ? `, accounting for a design effect of ${deff}` : ''}, you need a minimum sample size of ${n} participants. After adjusting for an expected non-response rate of ${(nr * 100).toFixed(0)}%, the recommended sample size is ${nAdj} participants. This sample size will provide a ${confLevel} confidence interval with a total width of ${ciWidth}% around your point estimate.`;

  return {
    type: 'prevalence',
    studyType: 'Descriptive Study - Prevalence Estimation',
    method: "Cochran's Formula for Proportion",
    inputs: {
      'Expected Prevalence (P)': p,
      'Precision / Margin of Error (d)': d,
      'Confidence Level': confLevel,
      'Z-score': z,
      'Design Effect (DEFF)': deff,
      'Non-response Rate': `${(nr * 100).toFixed(0)}%`
    },
    formula: 'n = (Z² × P × (1-P)) / d² × DEFF',
    formulaExplanation: 'Z = Z-score for confidence level | P = Expected prevalence | d = Precision | DEFF = Design effect',
    steps: [
      { title: 'Calculate Z-squared', calc: `Z² = ${z}² = ${step1.toFixed(4)}` },
      { title: 'Calculate P × (1-P)', calc: `${p} × (1 - ${p}) = ${p} × ${(1-p).toFixed(4)} = ${step2.toFixed(4)}` },
      { title: 'Calculate d-squared (precision squared)', calc: `d² = ${d}² = ${step3.toFixed(6)}` },
      { title: 'Apply the formula: (Z² × P × (1-P)) / d²', calc: `(${step1.toFixed(4)} × ${step2.toFixed(4)}) / ${step3.toFixed(6)} = ${step4.toFixed(2)}` },
      { title: 'Apply Design Effect (DEFF)', calc: `${step4.toFixed(2)} × ${deff} = ${(step4 * deff).toFixed(2)} → Rounded up: ${n}` },
      { title: `Adjust for Non-response (${(nr * 100).toFixed(0)}%)`, calc: `${n} / (1 - ${nr.toFixed(2)}) = ${n} / ${(1-nr).toFixed(2)} = ${(n / (1-nr)).toFixed(2)} → Rounded up: ${nAdj}` }
    ],
    results: {
      'Required Sample Size': n,
      'Adjusted for Non-response': nAdj,
      'Expected CI Width': `±${ciWidth}%`
    },
    interpretation,
    recommendations: [
      'Ensure random sampling methodology to maintain validity',
      'Consider stratification if population is heterogeneous',
      deff > 1 ? 'Design effect > 1 suggests cluster sampling - ensure adequate number of clusters' : 'Simple random sampling assumed with DEFF = 1',
      'Plan for data quality checks and potential exclusions'
    ],
    reference: 'Cochran, W. G. (1977). Sampling Techniques (3rd ed.). John Wiley & Sons.'
  };
}

// Mean Estimation
export function calculateMean(inputs) {
  const { sd, d, z, nonResponseRate } = inputs;
  const nr = nonResponseRate / 100;

  // Validation
  if (sd <= 0) {
    throw new Error('Standard deviation must be greater than 0');
  }
  if (d <= 0) {
    throw new Error('Precision must be greater than 0');
  }

  // Step-by-step calculation
  const step1 = z * sd;
  const step2 = step1 / d;
  const step3 = step2 * step2;
  const n = roundUp(step3);
  const nAdj = roundUp(n / (1 - nr));
  const se = (sd / Math.sqrt(n)).toFixed(3);

  const confLevel = getConfidenceLevel(z);
  const interpretation = `To estimate a population mean with a precision of ±${d} units at a ${confLevel} confidence level, assuming a standard deviation of ${sd}, you need a minimum sample size of ${n} participants. After adjusting for an expected non-response rate of ${(nr * 100).toFixed(0)}%, the recommended sample size is ${nAdj} participants. The expected standard error of the mean will be ${se}, resulting in a ${confLevel} confidence interval of approximately ±${(z * parseFloat(se)).toFixed(3)} units around the sample mean.`;

  return {
    type: 'mean',
    studyType: 'Descriptive Study - Mean Estimation',
    method: 'Sample Size Formula for Continuous Variables',
    inputs: {
      'Population Standard Deviation (σ)': sd,
      'Desired Precision (d)': d,
      'Confidence Level': confLevel,
      'Z-score': z,
      'Non-response Rate': `${(nr * 100).toFixed(0)}%`
    },
    formula: 'n = (Z × σ / d)²',
    formulaExplanation: 'Z = Z-score for confidence level | σ = Population standard deviation | d = Desired precision',
    steps: [
      { title: 'Multiply Z-score by Standard Deviation', calc: `Z × σ = ${z} × ${sd} = ${step1.toFixed(4)}` },
      { title: 'Divide by Desired Precision', calc: `${step1.toFixed(4)} / ${d} = ${step2.toFixed(4)}` },
      { title: 'Square the Result', calc: `(${step2.toFixed(4)})² = ${step3.toFixed(2)} → Rounded up: ${n}` },
      { title: `Adjust for Non-response (${(nr * 100).toFixed(0)}%)`, calc: `${n} / (1 - ${nr.toFixed(2)}) = ${n} / ${(1-nr).toFixed(2)} = ${(n / (1-nr)).toFixed(2)} → Rounded up: ${nAdj}` },
      { title: 'Calculate Expected Standard Error', calc: `SE = σ / √n = ${sd} / √${n} = ${sd} / ${Math.sqrt(n).toFixed(4)} = ${se}` }
    ],
    results: {
      'Required Sample Size': n,
      'Adjusted for Non-response': nAdj,
      'Expected Standard Error': se
    },
    interpretation,
    recommendations: [
      'Verify standard deviation estimate from pilot study or literature',
      'Consider using conservative (larger) SD estimate if uncertain',
      'Ensure measurement instrument has adequate precision',
      'Plan for potential outliers and data cleaning'
    ],
    reference: 'Daniel, W. W. (2009). Biostatistics: A Foundation for Analysis in the Health Sciences (9th ed.). Wiley.'
  };
}

// Finite Population Correction
export function calculateFinite(inputs) {
  const { n0, N } = inputs;

  // Validation
  if (n0 <= 0) {
    throw new Error('Initial sample size must be greater than 0');
  }
  if (N <= 0) {
    throw new Error('Population size must be greater than 0');
  }
  if (n0 > N) {
    throw new Error('Initial sample size cannot exceed population size');
  }

  // Step-by-step calculation
  const step1 = n0 - 1;
  const step2 = step1 / N;
  const step3 = 1 + step2;
  const nExact = n0 / step3;
  const n = roundUp(nExact);
  const frac = ((n / N) * 100).toFixed(1);
  const reduction = n0 - n;
  const reductionPct = ((reduction / n0) * 100).toFixed(1);

  const interpretation = `When sampling from a finite population of ${N.toLocaleString()}, the initial sample size of ${n0.toLocaleString()} (calculated assuming infinite population) can be reduced to ${n.toLocaleString()} participants. This represents a reduction of ${reduction.toLocaleString()} participants (${reductionPct}%). The sampling fraction is ${frac}%, meaning you will be sampling ${frac}% of the total population. ${parseFloat(frac) > 10 ? 'Note: With a sampling fraction > 10%, the finite population correction provides meaningful sample size reduction.' : 'With a sampling fraction ≤ 10%, the finite population correction provides modest reduction.'}`;

  return {
    type: 'finite',
    studyType: 'Descriptive Study - Finite Population Correction',
    method: 'Finite Population Correction Factor',
    inputs: {
      'Initial Sample Size (n₀)': n0,
      'Population Size (N)': N
    },
    formula: 'n = n₀ / (1 + (n₀ - 1) / N)',
    formulaExplanation: 'n₀ = Initial sample size (infinite population) | N = Known population size',
    steps: [
      { title: 'Calculate (n₀ - 1)', calc: `${n0} - 1 = ${step1}` },
      { title: 'Divide by Population Size (N)', calc: `${step1} / ${N} = ${step2.toFixed(6)}` },
      { title: 'Add 1 to get the correction factor', calc: `1 + ${step2.toFixed(6)} = ${step3.toFixed(6)}` },
      { title: 'Divide Initial Sample Size by Correction Factor', calc: `${n0} / ${step3.toFixed(6)} = ${nExact.toFixed(2)} → Rounded up: ${n}` },
      { title: 'Calculate Sampling Fraction', calc: `${n} / ${N} = ${(n/N).toFixed(4)} = ${frac}%` },
      { title: 'Calculate Sample Reduction', calc: `${n0} - ${n} = ${reduction} (${reductionPct}% reduction)` }
    ],
    results: {
      'Adjusted Sample Size': n,
      'Sampling Fraction': `${frac}%`,
      'Sample Reduction': `-${reduction}`
    },
    interpretation,
    recommendations: [
      'Use FPC when sampling fraction exceeds 5-10% of population',
      'Ensure accurate population size estimate',
      'Consider whether population may change during study period',
      'Document the correction in your methodology section'
    ],
    reference: 'Kish, L. (1965). Survey Sampling. John Wiley & Sons.'
  };
}

export default {
  calculatePrevalence,
  calculateMean,
  calculateFinite
};
