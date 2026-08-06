// Clinical Trials Calculator Logic
// RCT, Superiority, Non-Inferiority, Equivalence

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

// Superiority Trial - Two Proportions
export function calculateSuperiority(inputs) {
  const { pC, pT, alpha, power, ratio, dropoutRate } = inputs;
  const pCVal = parseFloat(pC);
  const pTVal = parseFloat(pT);
  const k = parseFloat(ratio) || 1;
  const dropout = parseFloat(dropoutRate) || 0;

  const zAlpha = normalInv(1 - parseFloat(alpha) / 2);
  const zBeta = normalInv(parseFloat(power));

  const pBar = (pTVal + k * pCVal) / (1 + k);
  const term1 = zAlpha * Math.sqrt((1 + 1/k) * pBar * (1 - pBar));
  const term2 = zBeta * Math.sqrt((pTVal * (1 - pTVal)) + (pCVal * (1 - pCVal)) / k);

  const nT = roundUp(Math.pow(term1 + term2, 2) / Math.pow(pTVal - pCVal, 2));
  const nC = roundUp(nT * k);
  const nTAdj = roundUp(nT / (1 - dropout / 100));
  const nCAdj = roundUp(nC / (1 - dropout / 100));
  const totalN = nTAdj + nCAdj;

  const diff = ((pTVal - pCVal) * 100).toFixed(1);
  const interpretation = `To demonstrate superiority of treatment (${(pTVal * 100).toFixed(0)}%) over control (${(pCVal * 100).toFixed(0)}%), a difference of ${diff}%, with ${(parseFloat(power) * 100).toFixed(0)}% power at α = ${parseFloat(alpha)}, you need ${nTAdj} treatment and ${nCAdj} control participants (total N = ${totalN}, adjusted for ${dropout}% dropout).`;

  return {
    type: 'superiority',
    studyType: 'Clinical Trial - Superiority',
    method: 'Two-proportion superiority test',
    inputs: {
      'Control Response Rate': `${(pCVal * 100).toFixed(0)}%`,
      'Treatment Response Rate': `${(pTVal * 100).toFixed(0)}%`,
      'Difference to Detect': `${diff}%`,
      'Significance Level (α)': alpha,
      'Power (1-β)': `${(parseFloat(power) * 100).toFixed(0)}%`,
      'Allocation Ratio': `1:${k}`,
      'Dropout Rate': `${dropout}%`
    },
    formula: 'n = [Zα√((1+1/k)P̄Q̄) + Zβ√(P_T×Q_T + P_C×Q_C/k)]² / (P_T - P_C)²',
    formulaExplanation: 'P_T = treatment proportion | P_C = control proportion | k = allocation ratio',
    steps: [
      { title: 'Calculate pooled proportion', calc: `P̄ = (${pTVal} + ${k} × ${pCVal}) / (1 + ${k}) = ${pBar.toFixed(4)}` },
      { title: 'Get Z-scores', calc: `Zα = ${zAlpha.toFixed(4)}, Zβ = ${zBeta.toFixed(4)}` },
      { title: 'Calculate sample sizes', calc: `n_T = ${nT}, n_C = ${nC}` },
      { title: 'Adjust for dropout', calc: `n_T_adj = ${nTAdj}, n_C_adj = ${nCAdj}` },
      { title: 'Total sample size', calc: `N = ${nTAdj} + ${nCAdj} = ${totalN}` }
    ],
    results: {
      'Treatment Group': nTAdj,
      'Control Group': nCAdj,
      'Total Sample Size': totalN
    },
    interpretation,
    recommendations: [
      'Use randomization and blinding to minimize bias',
      'Define primary endpoint clearly in protocol',
      'Plan interim analyses if appropriate',
      'Register trial before enrollment (e.g., ClinicalTrials.gov)'
    ],
    reference: 'Chow, S. C., Shao, J., Wang, H., & Lokhnygina, Y. (2017). Sample Size Calculations in Clinical Research (3rd ed.). Chapman and Hall/CRC.'
  };
}

// Non-Inferiority Trial
export function calculateNonInferiority(inputs) {
  const { pC, pT, delta, alpha, power, ratio, dropoutRate } = inputs;
  const pCVal = parseFloat(pC);
  const pTVal = parseFloat(pT);
  const deltaVal = parseFloat(delta);
  const k = parseFloat(ratio) || 1;
  const dropout = parseFloat(dropoutRate) || 0;

  // One-sided alpha for non-inferiority
  const zAlpha = normalInv(1 - parseFloat(alpha));
  const zBeta = normalInv(parseFloat(power));

  // Non-inferiority uses the UNPOOLED variance (the two proportions differ under
  // both H0 and H1) and the detectable effect is the distance from the NI boundary.
  // Convention: higher response = better; margin δ > 0 means the treatment may be
  // up to δ worse than control and still declared non-inferior, so the effect the
  // study must detect is (pT − pC) + δ, NOT δ alone.
  // Ref: Chow, Shao, Wang & Lokhnygina (2017), Sample Size Calculations in Clinical
  // Research, 3rd ed., §4.2 (verified against the book's worked example: pT=0.85,
  // pC=0.65, δ=0.10, α=0.05, power=0.80 → 25/group).
  const variance = pTVal * (1 - pTVal) + (pCVal * (1 - pCVal)) / k;
  const effect = (pTVal - pCVal) + deltaVal;
  if (effect <= 0) {
    throw new Error('(pT − pC) + δ must be positive. With these inputs the treatment is assumed to be inferior by more than the margin, so non-inferiority cannot be demonstrated. Check the response rates and the margin δ.');
  }
  const nTraw = Math.pow(zAlpha + zBeta, 2) * variance / Math.pow(effect, 2);
  const nT = roundUp(nTraw);
  const nC = roundUp(nTraw * k);
  const nTAdj = roundUp(nT / (1 - dropout / 100));
  const nCAdj = roundUp(nC / (1 - dropout / 100));
  const totalN = nTAdj + nCAdj;

  const interpretation = `To demonstrate non-inferiority with margin δ = ${(deltaVal * 100).toFixed(0)}%, expecting treatment rate of ${(pTVal * 100).toFixed(0)}% vs control ${(pCVal * 100).toFixed(0)}%, with ${(parseFloat(power) * 100).toFixed(0)}% power at one-sided α = ${parseFloat(alpha)}, you need ${nTAdj} treatment and ${nCAdj} control participants (total N = ${totalN}). The study is powered to detect a distance of ${((pTVal - pCVal + deltaVal) * 100).toFixed(1)}% from the non-inferiority boundary.`;

  return {
    type: 'non-inferiority',
    studyType: 'Clinical Trial - Non-Inferiority',
    method: 'Non-inferiority test for two proportions',
    inputs: {
      'Control Response Rate': `${(pCVal * 100).toFixed(0)}%`,
      'Expected Treatment Rate': `${(pTVal * 100).toFixed(0)}%`,
      'Non-inferiority Margin (δ)': `${(deltaVal * 100).toFixed(0)}%`,
      'Significance Level (α, one-sided)': alpha,
      'Power (1-β)': `${(parseFloat(power) * 100).toFixed(0)}%`,
      'Dropout Rate': `${dropout}%`
    },
    formula: 'n_T = (Z₁₋α + Z₁₋β)² × [P_T(1−P_T) + P_C(1−P_C)/k] / (P_T − P_C + δ)²',
    formulaExplanation: 'Unpooled variance | effect = (P_T − P_C) + δ = distance from the non-inferiority boundary | one-sided α | higher response assumed better',
    steps: [
      { title: 'Compute the unpooled variance term', calc: `V = P_T(1−P_T) + P_C(1−P_C)/k = ${(pTVal*(1-pTVal)).toFixed(4)} + ${(pCVal*(1-pCVal)).toFixed(4)}/${k} = ${variance.toFixed(4)}` },
      { title: 'Compute the detectable effect (distance from NI boundary)', calc: `(P_T − P_C) + δ = (${pTVal} − ${pCVal}) + ${deltaVal} = ${effect.toFixed(4)}` },
      { title: 'Get Z-scores (one-sided α)', calc: `Z₁₋α = ${zAlpha.toFixed(4)}, Z₁₋β = ${zBeta.toFixed(4)}` },
      { title: 'Calculate sample sizes', calc: `n_T = (${zAlpha.toFixed(3)}+${zBeta.toFixed(3)})² × ${variance.toFixed(4)} / ${effect.toFixed(4)}² = ${nT}, n_C = ${nC}` },
      { title: 'Adjust for dropout', calc: `n_T_adj = ${nTAdj}, n_C_adj = ${nCAdj}` },
      { title: 'Total sample size', calc: `N = ${totalN}` }
    ],
    results: {
      'Treatment Group': nTAdj,
      'Control Group': nCAdj,
      'Total Sample Size': totalN
    },
    interpretation,
    recommendations: [
      'Justify non-inferiority margin clinically',
      'Consider ITT and per-protocol analyses',
      'Pre-specify margin in protocol',
      'Avoid switching from superiority to non-inferiority post-hoc'
    ],
    reference: 'Chow, S. C., Shao, J., Wang, H., & Lokhnygina, Y. (2017). Sample Size Calculations in Clinical Research (3rd ed.), §4.2. Chapman and Hall/CRC. Conceptual basis: Blackwelder, W. C. (1982), Controlled Clinical Trials, 3(4), 345-353.'
  };
}

// Equivalence Trial
export function calculateEquivalence(inputs) {
  const { pC, pT, delta, alpha, power, ratio, dropoutRate } = inputs;
  const pCVal = parseFloat(pC);
  const pTVal = parseFloat(pT);
  const deltaVal = parseFloat(delta);
  const k = parseFloat(ratio) || 1;
  const dropout = parseFloat(dropoutRate) || 0;

  // Two one-sided tests (TOST). One-sided α, but the power is split across the two
  // bounds, so the β term uses Z_{1−β/2} (not Z_{1−β}). Unpooled variance; the
  // detectable effect is the margin minus the expected true difference: δ − |pT − pC|.
  // The old "× 2" multiplier is an invented factor and is removed.
  // Ref: Chow, Shao, Wang & Lokhnygina (2017), 3rd ed., §4.3 (equivalence, two
  // proportions); matches CRAN TrialSize::TwoSampleProportion.Equivalence.
  const zAlpha = normalInv(1 - parseFloat(alpha));
  const zBeta = normalInv(1 - (1 - parseFloat(power)) / 2); // Z_{1−β/2}

  const variance = pTVal * (1 - pTVal) + (pCVal * (1 - pCVal)) / k;
  const effect = deltaVal - Math.abs(pTVal - pCVal);
  if (effect <= 0) {
    throw new Error('The equivalence margin δ must be larger than the expected absolute difference |pT − pC|; otherwise equivalence cannot be demonstrated. Increase δ or bring the expected rates closer.');
  }
  const nTraw = Math.pow(zAlpha + zBeta, 2) * variance / Math.pow(effect, 2);
  const nT = roundUp(nTraw);
  const nC = roundUp(nTraw * k);
  const nTAdj = roundUp(nT / (1 - dropout / 100));
  const nCAdj = roundUp(nC / (1 - dropout / 100));
  const totalN = nTAdj + nCAdj;

  const interpretation = `To demonstrate equivalence within margin ±${(deltaVal * 100).toFixed(0)}%, expecting both treatments at ~${(pTVal * 100).toFixed(0)}%, with ${(parseFloat(power) * 100).toFixed(0)}% power at α = ${parseFloat(alpha)} (TOST), you need ${nTAdj} treatment and ${nCAdj} control participants (total N = ${totalN}).`;

  return {
    type: 'equivalence',
    studyType: 'Clinical Trial - Equivalence',
    method: 'Two One-Sided Tests (TOST) for equivalence',
    inputs: {
      'Control Response Rate': `${(pCVal * 100).toFixed(0)}%`,
      'Expected Treatment Rate': `${(pTVal * 100).toFixed(0)}%`,
      'Equivalence Margin (±δ)': `±${(deltaVal * 100).toFixed(0)}%`,
      'Significance Level (α)': alpha,
      'Power (1-β)': `${(parseFloat(power) * 100).toFixed(0)}%`,
      'Dropout Rate': `${dropout}%`
    },
    formula: 'n_T = (Z₁₋α + Z₁₋β/₂)² × [P_T(1−P_T) + P_C(1−P_C)/k] / (δ − |P_T − P_C|)²',
    formulaExplanation: 'TOST | one-sided α, power split as β/2 | unpooled variance | effect = δ − |P_T − P_C|',
    steps: [
      { title: 'Compute the unpooled variance term', calc: `V = P_T(1−P_T) + P_C(1−P_C)/k = ${variance.toFixed(4)}` },
      { title: 'Compute the detectable effect', calc: `δ − |P_T − P_C| = ${deltaVal} − ${Math.abs(pTVal-pCVal).toFixed(4)} = ${effect.toFixed(4)}` },
      { title: 'Get Z-scores', calc: `Z₁₋α = ${zAlpha.toFixed(4)} (one-sided), Z₁₋β/₂ = ${zBeta.toFixed(4)}` },
      { title: 'Calculate sample sizes', calc: `n_T = ${nT}, n_C = ${nC}` },
      { title: 'Adjust for dropout', calc: `n_T_adj = ${nTAdj}, n_C_adj = ${nCAdj}` },
      { title: 'Total sample size', calc: `N = ${totalN}` }
    ],
    results: {
      'Treatment Group': nTAdj,
      'Control Group': nCAdj,
      'Total Sample Size': totalN
    },
    interpretation,
    recommendations: [
      'Equivalence margin must be clinically justified',
      'Bioequivalence studies typically use 80-125% for AUC/Cmax',
      'Both confidence bounds must fall within margin',
      'Consider crossover design for reduced sample size'
    ],
    reference: 'Schuirmann, D. J. (1987). A comparison of the two one-sided tests procedure and the power approach for assessing the equivalence of average bioavailability. J Pharmacokinet Biopharm, 15(6), 657-680.'
  };
}

export default {
  calculateSuperiority,
  calculateNonInferiority,
  calculateEquivalence
};
