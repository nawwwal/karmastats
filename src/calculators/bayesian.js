// Bayesian Sample Size Calculator Logic
// Prior-based, Credible Intervals, Probability of Success

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

// Standard normal CDF
function normalCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

// Beta function approximation
function lnGamma(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function beta(a, b) {
  return Math.exp(lnGamma(a) + lnGamma(b) - lnGamma(a + b));
}

// Bayesian Sample Size for Proportion (Beta-Binomial)
export function calculateBayesianProportion(inputs) {
  const { priorAlpha, priorBeta, targetPrecision, credibleLevel, expectedP } = inputs;

  const alpha = parseFloat(priorAlpha);
  const betaParam = parseFloat(priorBeta);
  const precision = parseFloat(targetPrecision);
  const credLevel = parseFloat(credibleLevel) / 100;
  const pExpected = parseFloat(expectedP);

  // Prior mean and variance
  const priorMean = alpha / (alpha + betaParam);
  const priorVar = (alpha * betaParam) / (Math.pow(alpha + betaParam, 2) * (alpha + betaParam + 1));
  const priorSD = Math.sqrt(priorVar);

  // Prior effective sample size
  const priorESS = alpha + betaParam;

  // Z for credible interval
  const zCred = normalInv((1 + credLevel) / 2);

  // Required posterior variance for target precision
  // Posterior variance ≈ p(1-p)/(n + prior ESS)
  // For CI width = 2 * z * SD = precision
  // SD = precision / (2 * z)
  const targetSD = precision / (2 * zCred);
  const targetVar = targetSD * targetSD;

  // Solve for n: p(1-p)/(n + priorESS) = targetVar
  // n = p(1-p)/targetVar - priorESS
  const nRequired = Math.ceil(pExpected * (1 - pExpected) / targetVar - priorESS);
  const nFinal = Math.max(nRequired, 10);

  // Posterior parameters
  const expectedSuccesses = Math.round(nFinal * pExpected);
  const postAlpha = alpha + expectedSuccesses;
  const postBeta = betaParam + nFinal - expectedSuccesses;
  const postMean = postAlpha / (postAlpha + postBeta);
  const postVar = (postAlpha * postBeta) / (Math.pow(postAlpha + postBeta, 2) * (postAlpha + postBeta + 1));
  const postSD = Math.sqrt(postVar);

  // Credible interval width
  const ciWidth = 2 * zCred * postSD;

  return {
    studyType: 'Bayesian Analysis',
    type: 'bayesian-proportion',
    method: 'Bayesian Sample Size for Proportion',
    inputs: {
      'Prior Alpha': alpha,
      'Prior Beta': betaParam,
      'Prior Mean': roundUp(priorMean, 4),
      'Target Precision': `±${precision}`,
      'Credible Level': `${credibleLevel}%`,
      'Expected Proportion': pExpected
    },
    formula: 'n = p(1-p) / Var_target - ESS_prior',
    formulaExplanation: 'Sample size to achieve target posterior credible interval width',
    steps: [
      { title: 'Calculate Prior Parameters', calc: `Prior mean = ${alpha}/(${alpha}+${betaParam}) = ${roundUp(priorMean, 4)}, Prior ESS = ${priorESS}` },
      { title: 'Calculate Target Variance', calc: `Target SD = ${precision}/(2×${roundUp(zCred, 2)}) = ${roundUp(targetSD, 4)}, Target Var = ${roundUp(targetVar, 6)}` },
      { title: 'Calculate Required n', calc: `n = ${pExpected}×${1-pExpected}/${roundUp(targetVar, 6)} - ${priorESS} = ${nRequired}` },
      { title: 'Expected Posterior', calc: `Post alpha = ${postAlpha}, Post beta = ${postBeta}, Post mean = ${roundUp(postMean, 4)}` },
      { title: 'Expected CI Width', calc: `CI width = 2×${roundUp(zCred, 2)}×${roundUp(postSD, 4)} = ${roundUp(ciWidth, 4)}` }
    ],
    results: {
      'Required Sample Size': nFinal,
      'Prior ESS': priorESS,
      'Posterior Mean (expected)': roundUp(postMean, 4),
      'Posterior SD (expected)': roundUp(postSD, 4),
      [`${credibleLevel}% CI Width`]: roundUp(ciWidth, 4),
      'Prior Influence': `${roundUp(priorESS / (priorESS + nFinal) * 100, 1)}%`
    },
    interpretation: `With a Beta(${alpha}, ${betaParam}) prior and expected proportion of ${pExpected}, you need ${nFinal} observations to achieve a ${credibleLevel}% credible interval width of approximately ${roundUp(ciWidth, 3)}. The prior contributes ${roundUp(priorESS / (priorESS + nFinal) * 100, 1)}% of the information.`,
    recommendations: [
      `Prior ESS = ${priorESS} (equivalent to ${priorESS} prior observations)`,
      priorESS > nFinal / 2 ? 'Strong prior influence - consider sensitivity analysis' : 'Data will dominate inference',
      'Use Beta(1,1) for non-informative prior',
      'Consider prior predictive checks'
    ],
    reference: 'Spiegelhalter, D. J., Abrams, K. R., & Myles, J. P. (2004). Bayesian Approaches to Clinical Trials and Health-Care Evaluation. Wiley.'
  };
}

// Bayesian Sample Size for Mean (Normal-Normal)
export function calculateBayesianMean(inputs) {
  const { priorMean, priorSD, dataSD, targetPrecision, credibleLevel, expectedMean } = inputs;

  const mu0 = parseFloat(priorMean);
  const sigma0 = parseFloat(priorSD);
  const sigmaData = parseFloat(dataSD);
  const precision = parseFloat(targetPrecision);
  const credLevel = parseFloat(credibleLevel) / 100;
  const muExpected = parseFloat(expectedMean);

  // Prior precision (tau = 1/variance)
  const priorPrecision = 1 / (sigma0 * sigma0);

  // Z for credible interval
  const zCred = normalInv((1 + credLevel) / 2);

  // Target posterior SD
  const targetPostSD = precision / (2 * zCred);
  const targetPostVar = targetPostSD * targetPostSD;

  // Posterior variance: 1/tau_post = 1/(tau_prior + n/sigma²)
  // Target: 1/(tau_prior + n/sigma²) = targetPostVar
  // n/sigma² = 1/targetPostVar - tau_prior
  // n = sigma² × (1/targetPostVar - tau_prior)
  const dataPrecisionNeeded = 1 / targetPostVar - priorPrecision;
  const nRequired = Math.ceil(sigmaData * sigmaData * dataPrecisionNeeded);
  const nFinal = Math.max(nRequired, 5);

  // Actual posterior parameters with nFinal
  const postPrecision = priorPrecision + nFinal / (sigmaData * sigmaData);
  const postVar = 1 / postPrecision;
  const postSD = Math.sqrt(postVar);

  // Posterior mean (weighted average of prior and data)
  const postMean = (priorPrecision * mu0 + (nFinal / (sigmaData * sigmaData)) * muExpected) / postPrecision;

  // Credible interval
  const ciLower = postMean - zCred * postSD;
  const ciUpper = postMean + zCred * postSD;
  const ciWidth = ciUpper - ciLower;

  // Weight of prior vs data
  const priorWeight = priorPrecision / postPrecision;
  const dataWeight = 1 - priorWeight;

  return {
    studyType: 'Bayesian Analysis',
    type: 'bayesian-mean',
    method: 'Bayesian Sample Size for Mean (Normal-Normal)',
    inputs: {
      'Prior Mean': mu0,
      'Prior SD': sigma0,
      'Data SD': sigmaData,
      'Target Precision': `±${precision}`,
      'Credible Level': `${credibleLevel}%`,
      'Expected Mean': muExpected
    },
    formula: 'n = sigma² × (1/Var_target - 1/sigma0²)',
    formulaExplanation: 'Sample size for target posterior variance with conjugate normal prior',
    steps: [
      { title: 'Calculate Prior Precision', calc: `tau_prior = 1/${sigma0}² = ${roundUp(priorPrecision, 4)}` },
      { title: 'Calculate Target Posterior SD', calc: `Target SD = ${precision}/(2×${roundUp(zCred, 2)}) = ${roundUp(targetPostSD, 4)}` },
      { title: 'Calculate Required n', calc: `n = ${sigmaData}² × (1/${roundUp(targetPostVar, 6)} - ${roundUp(priorPrecision, 4)}) = ${nRequired}` },
      { title: 'Calculate Posterior Mean', calc: `Post mean = ${roundUp(postMean, 4)}` },
      { title: 'Calculate CI', calc: `${credibleLevel}% CI = [${roundUp(ciLower, 3)}, ${roundUp(ciUpper, 3)}]` }
    ],
    results: {
      'Required Sample Size': nFinal,
      'Posterior Mean': roundUp(postMean, 4),
      'Posterior SD': roundUp(postSD, 4),
      [`${credibleLevel}% CI`]: `[${roundUp(ciLower, 3)}, ${roundUp(ciUpper, 3)}]`,
      'CI Width': roundUp(ciWidth, 4),
      'Prior Weight': `${roundUp(priorWeight * 100, 1)}%`,
      'Data Weight': `${roundUp(dataWeight * 100, 1)}%`
    },
    interpretation: `With a Normal(${mu0}, ${sigma0}) prior and data SD of ${sigmaData}, you need ${nFinal} observations. The expected posterior mean is ${roundUp(postMean, 3)} with ${credibleLevel}% CI of [${roundUp(ciLower, 3)}, ${roundUp(ciUpper, 3)}]. Prior contributes ${roundUp(priorWeight * 100, 1)}% of the precision.`,
    recommendations: [
      priorWeight > 0.3 ? 'Strong prior influence - justify prior carefully' : 'Data-dominated inference',
      'Consider weakly informative priors (large sigma0)',
      'Perform prior sensitivity analysis',
      'Report both prior and posterior distributions'
    ],
    reference: 'Gelman, A., Carlin, J. B., Stern, H. S., et al. (2013). Bayesian Data Analysis (3rd ed.). CRC Press.'
  };
}

// Probability of Success (Assurance)
export function calculateAssurance(inputs) {
  const { priorMean, priorSD, clinicalThreshold, dataSD, sampleSize, alpha } = inputs;

  const mu0 = parseFloat(priorMean);
  const sigma0 = parseFloat(priorSD);
  const threshold = parseFloat(clinicalThreshold);
  const sigmaData = parseFloat(dataSD);
  const n = parseInt(sampleSize);
  const alphaVal = parseFloat(alpha);

  // Frequentist critical value
  const zAlpha = normalInv(1 - alphaVal / 2);

  // SE of sample mean
  const seMean = sigmaData / Math.sqrt(n);

  // For a given true effect theta, probability of significance:
  // P(reject H0 | theta) = P(|X_bar| > z_alpha * SE | theta)
  // = 1 - Phi((z_alpha * SE - theta) / SE) + Phi((-z_alpha * SE - theta) / SE)
  // ≈ Phi((theta - z_alpha * SE) / SE) for theta > 0

  // Assurance = E[P(success)] where expectation is over prior
  // For normal prior: assurance = Phi((mu0 - z_alpha * SE) / sqrt(sigma0² + SE²))

  const combinedSD = Math.sqrt(sigma0 * sigma0 + seMean * seMean);
  const assurance = normalCDF((mu0 - zAlpha * seMean) / combinedSD);
  const assurancePercent = assurance * 100;

  // Traditional power at prior mean
  const powerAtMean = normalCDF((mu0 - zAlpha * seMean) / seMean);
  const powerPercent = powerAtMean * 100;

  // Probability effect is clinically meaningful
  const probMeaningful = normalCDF((mu0 - threshold) / sigma0);

  // Predictive probability of success
  const predictiveSD = Math.sqrt(sigma0 * sigma0 + sigmaData * sigmaData / n);

  return {
    studyType: 'Bayesian Analysis',
    type: 'assurance',
    method: 'Probability of Success (Assurance)',
    inputs: {
      'Prior Mean Effect': mu0,
      'Prior SD': sigma0,
      'Clinical Threshold': threshold,
      'Data SD': sigmaData,
      'Sample Size (per arm)': n,
      'Alpha Level': alphaVal
    },
    formula: 'Assurance = Phi((mu_prior - z_alpha × SE) / sqrt(sigma_prior² + SE²))',
    formulaExplanation: 'Average probability of success weighted by prior uncertainty',
    steps: [
      { title: 'Calculate SE of Mean', calc: `SE = ${sigmaData}/sqrt(${n}) = ${roundUp(seMean, 4)}` },
      { title: 'Calculate Combined SD', calc: `SD_combined = sqrt(${sigma0}² + ${roundUp(seMean, 4)}²) = ${roundUp(combinedSD, 4)}` },
      { title: 'Calculate Assurance', calc: `Assurance = Phi((${mu0} - ${roundUp(zAlpha, 2)}×${roundUp(seMean, 3)}) / ${roundUp(combinedSD, 4)}) = ${roundUp(assurancePercent, 1)}%` },
      { title: 'Frequentist Power at Prior Mean', calc: `Power = ${roundUp(powerPercent, 1)}%` },
      { title: 'Prob Effect > Threshold', calc: `P(theta > ${threshold}) = ${roundUp(probMeaningful * 100, 1)}%` }
    ],
    results: {
      'Assurance (PoS)': `${roundUp(assurancePercent, 1)}%`,
      'Frequentist Power': `${roundUp(powerPercent, 1)}%`,
      'Prob Clinically Meaningful': `${roundUp(probMeaningful * 100, 1)}%`,
      'SE of Estimate': roundUp(seMean, 4),
      'Prior-to-Data Ratio': roundUp(sigma0 / seMean, 2)
    },
    interpretation: `With ${n} subjects per arm and prior uncertainty SD=${sigma0}, the probability of trial success (assurance) is ${roundUp(assurancePercent, 1)}%. This accounts for uncertainty in the true effect. Traditional power at the prior mean is ${roundUp(powerPercent, 1)}%. There is a ${roundUp(probMeaningful * 100, 1)}% prior probability the effect exceeds the clinical threshold of ${threshold}.`,
    recommendations: [
      assurancePercent < powerPercent ? 'Assurance < Power indicates meaningful prior uncertainty' : 'Assurance ≈ Power suggests confident prior',
      assurancePercent < 50 ? 'Consider larger sample size or more favorable prior' : 'Reasonable probability of success',
      'Assurance is more realistic than power for go/no-go decisions',
      'Perform sensitivity analysis on prior assumptions'
    ],
    reference: 'O\'Hagan, A., Stevens, J. W., & Campbell, M. J. (2005). Assurance in clinical trial design. Pharmaceutical Statistics, 4(3), 187-201.'
  };
}

// Bayesian Adaptive Design - Sample Size Re-estimation
export function calculateAdaptiveDesign(inputs) {
  const { interimN, interimSuccesses, priorAlpha, priorBeta, targetSuccess, maxN } = inputs;

  const nInterim = parseInt(interimN);
  const successes = parseInt(interimSuccesses);
  const alpha = parseFloat(priorAlpha);
  const betaParam = parseFloat(priorBeta);
  const targetProb = parseFloat(targetSuccess);
  const nMax = parseInt(maxN);

  // Posterior at interim
  const postAlpha = alpha + successes;
  const postBeta = betaParam + nInterim - successes;
  const postMean = postAlpha / (postAlpha + postBeta);
  const postSD = Math.sqrt((postAlpha * postBeta) / (Math.pow(postAlpha + postBeta, 2) * (postAlpha + postBeta + 1)));

  // Predictive probability of success at max N
  // Using beta-binomial predictive distribution
  const remainingN = nMax - nInterim;

  // Approximate predictive probability using normal approximation
  const predictiveMean = postMean;
  const predictiveVar = postMean * (1 - postMean) * (postAlpha + postBeta + remainingN) / ((postAlpha + postBeta) * remainingN);
  const predictiveSD = Math.sqrt(predictiveVar);

  // Probability of reaching target at final
  const zTarget = (targetProb - predictiveMean) / predictiveSD;
  const probSuccess = 1 - normalCDF(zTarget);

  // Decision rules
  let decision;
  if (probSuccess > 0.9) decision = 'Continue - High probability of success';
  else if (probSuccess > 0.5) decision = 'Continue - Moderate probability of success';
  else if (probSuccess > 0.1) decision = 'Consider stopping - Low probability of success';
  else decision = 'Stop for futility - Very low probability of success';

  return {
    studyType: 'Bayesian Analysis',
    type: 'adaptive-design',
    method: 'Bayesian Adaptive Sample Size Re-estimation',
    inputs: {
      'Interim Sample Size': nInterim,
      'Observed Successes': successes,
      'Prior Alpha': alpha,
      'Prior Beta': betaParam,
      'Target Success Rate': `${targetProb * 100}%`,
      'Maximum Sample Size': nMax
    },
    formula: 'Predictive Prob = P(final success rate >= target | interim data)',
    formulaExplanation: 'Probability of achieving target based on interim results and prior',
    steps: [
      { title: 'Calculate Posterior', calc: `Beta(${postAlpha}, ${postBeta}), Mean = ${roundUp(postMean, 4)}` },
      { title: 'Observed Rate at Interim', calc: `${successes}/${nInterim} = ${roundUp(successes/nInterim, 4)}` },
      { title: 'Remaining Sample', calc: `${nMax} - ${nInterim} = ${remainingN}` },
      { title: 'Predictive Distribution', calc: `Mean = ${roundUp(predictiveMean, 4)}, SD = ${roundUp(predictiveSD, 4)}` },
      { title: 'Predictive Prob of Success', calc: `P(final >= ${targetProb}) = ${roundUp(probSuccess * 100, 1)}%` }
    ],
    results: {
      'Posterior Mean': roundUp(postMean, 4),
      'Posterior SD': roundUp(postSD, 4),
      'Predictive Prob Success': `${roundUp(probSuccess * 100, 1)}%`,
      'Remaining Sample Needed': remainingN,
      'Recommendation': decision
    },
    interpretation: `Based on ${successes}/${nInterim} successes at interim (${roundUp(successes/nInterim*100, 1)}%), the posterior mean is ${roundUp(postMean * 100, 1)}%. The predictive probability of achieving ${targetProb * 100}% success rate with ${nMax} total subjects is ${roundUp(probSuccess * 100, 1)}%. ${decision}.`,
    recommendations: [
      probSuccess < 0.1 ? 'Strong evidence for futility stopping' : 'Continue enrollment',
      'Pre-specify stopping rules in protocol',
      'Consider multiple interim analyses',
      'Adjust for multiplicity in final analysis'
    ],
    reference: 'Berry, S. M., Carlin, B. P., Lee, J. J., & Muller, P. (2010). Bayesian Adaptive Methods for Clinical Trials. CRC Press.'
  };
}
