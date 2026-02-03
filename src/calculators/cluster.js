// Cluster Randomized Trials Calculator Logic
// Design Effect, ICC-based calculations

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

// Cluster RCT Sample Size - Continuous Outcome
export function calculateClusterContinuous(inputs) {
  const { mean1, mean2, sd, icc, clusterSize, alpha, power, numArms } = inputs;

  const m1 = parseFloat(mean1);
  const m2 = parseFloat(mean2);
  const sigma = parseFloat(sd);
  const rho = parseFloat(icc);
  const m = parseInt(clusterSize);
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;
  const k = parseInt(numArms) || 2;

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  // Design effect
  const DEFF = 1 + (m - 1) * rho;

  // Effect size
  const effectSize = Math.abs(m1 - m2) / sigma;

  // Sample size for individual RCT (per arm)
  const nIndiv = Math.ceil(2 * Math.pow((zAlpha + zBeta) / effectSize, 2));

  // Total individuals per arm for cluster RCT
  const nCluster = Math.ceil(nIndiv * DEFF);

  // Number of clusters per arm
  const clustersPerArm = Math.ceil(nCluster / m);

  // Total clusters
  const totalClusters = clustersPerArm * k;

  // Total individuals
  const totalIndividuals = totalClusters * m;

  return {
    studyType: 'Cluster Randomized Trial',
    type: 'cluster-continuous',
    method: 'Cluster RCT - Continuous Outcome',
    inputs: {
      'Mean Group 1': m1,
      'Mean Group 2': m2,
      'Standard Deviation': sigma,
      'ICC': rho,
      'Cluster Size': m,
      'Significance Level (alpha)': alphaVal,
      'Power': `${power}%`,
      'Number of Arms': k
    },
    formula: 'n_cluster = n_individual × DEFF; DEFF = 1 + (m-1) × ICC',
    formulaExplanation: 'Individual RCT sample size inflated by design effect',
    steps: [
      { title: 'Calculate Effect Size', calc: `d = |${m1} - ${m2}| / ${sigma} = ${roundUp(effectSize, 4)}` },
      { title: 'Calculate Design Effect', calc: `DEFF = 1 + (${m} - 1) × ${rho} = ${roundUp(DEFF, 3)}` },
      { title: 'Individual RCT Sample Size (per arm)', calc: `n = 2 × ((${roundUp(zAlpha, 2)} + ${roundUp(zBeta, 2)}) / ${roundUp(effectSize, 3)})² = ${nIndiv}` },
      { title: 'Cluster RCT Individuals (per arm)', calc: `n_cluster = ${nIndiv} × ${roundUp(DEFF, 2)} = ${nCluster}` },
      { title: 'Clusters per Arm', calc: `clusters = ${nCluster} / ${m} = ${clustersPerArm}` }
    ],
    results: {
      'Design Effect (DEFF)': roundUp(DEFF, 3),
      'Clusters per Arm': clustersPerArm,
      'Total Clusters': totalClusters,
      'Individuals per Arm': nCluster,
      'Total Individuals': totalIndividuals,
      'Individual RCT Equivalent': nIndiv * k
    },
    interpretation: `For a ${k}-arm cluster RCT with ICC=${rho} and ${m} individuals per cluster, you need ${clustersPerArm} clusters per arm (${totalClusters} total) with ${totalIndividuals} total individuals. The design effect of ${roundUp(DEFF, 2)} means you need ${roundUp(DEFF, 2)} times more participants than an individual RCT.`,
    recommendations: [
      `Design effect = ${roundUp(DEFF, 2)} increases sample size ${roundUp((DEFF - 1) * 100, 0)}%`,
      'ICC typically 0.01-0.05 for health outcomes',
      'Larger clusters increase DEFF substantially',
      'Consider varying cluster sizes in analysis'
    ],
    reference: 'Donner, A., & Klar, N. (2000). Design and Analysis of Cluster Randomization Trials in Health Research. Arnold Publishers.'
  };
}

// Cluster RCT Sample Size - Binary Outcome
export function calculateClusterBinary(inputs) {
  const { p1, p2, icc, clusterSize, alpha, power } = inputs;

  const pControl = parseFloat(p1);
  const pTreatment = parseFloat(p2);
  const rho = parseFloat(icc);
  const m = parseInt(clusterSize);
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  // Design effect
  const DEFF = 1 + (m - 1) * rho;

  // Pooled proportion
  const pBar = (pControl + pTreatment) / 2;

  // Sample size for individual RCT (per arm)
  const nIndiv = Math.ceil(
    2 * pBar * (1 - pBar) * Math.pow(zAlpha + zBeta, 2) / Math.pow(pTreatment - pControl, 2)
  );

  // Cluster RCT sample size
  const nCluster = Math.ceil(nIndiv * DEFF);

  // Number of clusters per arm
  const clustersPerArm = Math.ceil(nCluster / m);

  // Total
  const totalClusters = clustersPerArm * 2;
  const totalIndividuals = totalClusters * m;

  // Risk difference
  const riskDiff = (pTreatment - pControl) * 100;

  return {
    studyType: 'Cluster Randomized Trial',
    type: 'cluster-binary',
    method: 'Cluster RCT - Binary Outcome',
    inputs: {
      'Control Proportion': `${(pControl * 100).toFixed(1)}%`,
      'Treatment Proportion': `${(pTreatment * 100).toFixed(1)}%`,
      'ICC': rho,
      'Cluster Size': m,
      'Significance Level (alpha)': alphaVal,
      'Power': `${power}%`
    },
    formula: 'n = 2 × p(1-p) × (Zα + Zβ)² / (p1-p2)² × DEFF',
    formulaExplanation: 'Sample size for proportion difference inflated by design effect',
    steps: [
      { title: 'Calculate Design Effect', calc: `DEFF = 1 + (${m} - 1) × ${rho} = ${roundUp(DEFF, 3)}` },
      { title: 'Calculate Pooled Proportion', calc: `p = (${pControl} + ${pTreatment}) / 2 = ${roundUp(pBar, 3)}` },
      { title: 'Individual RCT Sample (per arm)', calc: `n = 2 × ${roundUp(pBar, 3)} × ${roundUp(1-pBar, 3)} × (${roundUp(zAlpha, 2)} + ${roundUp(zBeta, 2)})² / ${roundUp(Math.pow(pTreatment - pControl, 2), 4)} = ${nIndiv}` },
      { title: 'Apply Design Effect', calc: `n_cluster = ${nIndiv} × ${roundUp(DEFF, 2)} = ${nCluster}` },
      { title: 'Calculate Clusters', calc: `clusters/arm = ceil(${nCluster} / ${m}) = ${clustersPerArm}` }
    ],
    results: {
      'Design Effect (DEFF)': roundUp(DEFF, 3),
      'Clusters per Arm': clustersPerArm,
      'Total Clusters': totalClusters,
      'Individuals per Arm': nCluster,
      'Total Individuals': totalIndividuals,
      'Risk Difference': `${roundUp(riskDiff, 1)}%`
    },
    interpretation: `To detect a ${roundUp(Math.abs(riskDiff), 1)}% difference (${(pControl*100).toFixed(0)}% vs ${(pTreatment*100).toFixed(0)}%) with ${power}% power, you need ${clustersPerArm} clusters per arm (${totalClusters} total, ${totalIndividuals} individuals). Design effect = ${roundUp(DEFF, 2)}.`,
    recommendations: [
      'Use GEE or mixed models for analysis',
      'Account for cluster size variation (coefficient of variation)',
      'Consider stratified randomization by cluster characteristics',
      'Report ICC in results for future studies'
    ],
    reference: 'Hayes, R. J., & Moulton, L. H. (2017). Cluster Randomised Trials (2nd ed.). CRC Press.'
  };
}

// Calculate Number of Clusters with Fixed Cluster Size
export function calculateNumberOfClusters(inputs) {
  const { effectSize, icc, clusterSize, alpha, power, cv } = inputs;

  const d = parseFloat(effectSize);
  const rho = parseFloat(icc);
  const m = parseInt(clusterSize);
  const alphaVal = parseFloat(alpha);
  const powerVal = parseFloat(power) / 100;
  const cvVal = parseFloat(cv) || 0;

  const zAlpha = normalInv(1 - alphaVal / 2);
  const zBeta = normalInv(powerVal);

  // Design effect
  const DEFF = 1 + (m - 1) * rho;

  // Adjustment for varying cluster sizes
  const DEFFadj = DEFF * (1 + cvVal * cvVal);

  // Number of clusters per arm
  // k = (Zα + Zβ)² × 2 × (1 + (m-1)ρ) / (m × d²)
  const kPerArm = Math.ceil(
    Math.pow(zAlpha + zBeta, 2) * 2 * DEFFadj / (m * d * d)
  );

  const totalClusters = kPerArm * 2;
  const totalIndividuals = totalClusters * m;

  // Power achieved with this number of clusters
  const achievedVar = 2 * DEFFadj / (kPerArm * m);
  const achievedSE = Math.sqrt(achievedVar);
  const achievedPower = 100; // Already calculated for target power

  return {
    studyType: 'Cluster Randomized Trial',
    type: 'number-of-clusters',
    method: 'Number of Clusters Calculation',
    inputs: {
      'Effect Size (Cohen\'s d)': d,
      'ICC': rho,
      'Average Cluster Size': m,
      'Significance Level (alpha)': alphaVal,
      'Power': `${power}%`,
      'CV of Cluster Size': cvVal
    },
    formula: 'k = (Zα + Zβ)² × 2 × DEFF / (m × d²)',
    formulaExplanation: 'Number of clusters per arm for standardized effect size',
    steps: [
      { title: 'Calculate Base DEFF', calc: `DEFF = 1 + (${m} - 1) × ${rho} = ${roundUp(DEFF, 3)}` },
      { title: 'Adjust for Varying Sizes', calc: `DEFF_adj = ${roundUp(DEFF, 3)} × (1 + ${cvVal}²) = ${roundUp(DEFFadj, 3)}` },
      { title: 'Calculate Clusters per Arm', calc: `k = (${roundUp(zAlpha, 2)} + ${roundUp(zBeta, 2)})² × 2 × ${roundUp(DEFFadj, 2)} / (${m} × ${d}²) = ${kPerArm}` },
      { title: 'Total Clusters', calc: `total = ${kPerArm} × 2 = ${totalClusters}` },
      { title: 'Total Individuals', calc: `N = ${totalClusters} × ${m} = ${totalIndividuals}` }
    ],
    results: {
      'Clusters per Arm': kPerArm,
      'Total Clusters': totalClusters,
      'Total Individuals': totalIndividuals,
      'Design Effect': roundUp(DEFFadj, 3),
      'Effective Sample Size': Math.round(totalIndividuals / DEFFadj)
    },
    interpretation: `To detect an effect size of ${d} with ${power}% power at alpha=${alphaVal}, you need ${kPerArm} clusters per arm (${totalClusters} total). With average cluster size of ${m}, this means ${totalIndividuals} total individuals. The effective sample size is approximately ${Math.round(totalIndividuals / DEFFadj)} after accounting for clustering.`,
    recommendations: [
      'Minimum 4-6 clusters per arm recommended',
      kPerArm < 6 ? 'Consider increasing cluster size or accepting lower power' : 'Adequate number of clusters',
      'Report CV of cluster sizes in results',
      'Use small-sample corrections (Kenward-Roger) if clusters < 30'
    ],
    reference: 'Eldridge, S. M., Ashby, D., & Kerry, S. (2006). Sample size for cluster randomized trials. International Journal of Epidemiology, 35(5), 1292-1300.'
  };
}

// Design Effect Calculator
export function calculateDesignEffect(inputs) {
  const { icc, clusterSize, cv, numClusters } = inputs;

  const rho = parseFloat(icc);
  const m = parseInt(clusterSize);
  const cvVal = parseFloat(cv) || 0;
  const k = parseInt(numClusters) || 10;

  // Basic design effect
  const DEFF = 1 + (m - 1) * rho;

  // Adjusted for varying cluster sizes
  const DEFFadj = DEFF * (1 + cvVal * cvVal);

  // Effective sample size
  const totalN = k * m;
  const effectiveN = totalN / DEFF;
  const effectiveNadj = totalN / DEFFadj;

  // Inflation factor (percentage increase needed)
  const inflation = (DEFF - 1) * 100;
  const inflationAdj = (DEFFadj - 1) * 100;

  // Variance inflation factor
  const VIF = DEFF;

  return {
    studyType: 'Cluster Randomized Trial',
    type: 'design-effect',
    method: 'Design Effect Calculator',
    inputs: {
      'ICC': rho,
      'Average Cluster Size': m,
      'CV of Cluster Size': cvVal,
      'Number of Clusters': k
    },
    formula: 'DEFF = 1 + (m - 1) × ICC',
    formulaExplanation: 'Design effect measures variance inflation due to clustering',
    steps: [
      { title: 'Calculate Basic DEFF', calc: `DEFF = 1 + (${m} - 1) × ${rho} = ${roundUp(DEFF, 4)}` },
      { title: 'Adjust for Varying Sizes', calc: `DEFF_adj = ${roundUp(DEFF, 3)} × (1 + ${cvVal}²) = ${roundUp(DEFFadj, 4)}` },
      { title: 'Calculate Total N', calc: `N = ${k} × ${m} = ${totalN}` },
      { title: 'Calculate Effective N', calc: `N_eff = ${totalN} / ${roundUp(DEFF, 2)} = ${roundUp(effectiveN, 1)}` },
      { title: 'Sample Size Inflation', calc: `Inflation = (${roundUp(DEFF, 2)} - 1) × 100 = ${roundUp(inflation, 1)}%` }
    ],
    results: {
      'Design Effect': roundUp(DEFF, 4),
      'Adjusted DEFF (with CV)': roundUp(DEFFadj, 4),
      'Total Sample Size': totalN,
      'Effective Sample Size': Math.round(effectiveN),
      'Sample Size Inflation': `${roundUp(inflation, 1)}%`,
      'Variance Inflation Factor': roundUp(VIF, 3)
    },
    interpretation: `With ICC=${rho} and cluster size=${m}, the design effect is ${roundUp(DEFF, 3)}. This means you need ${roundUp(inflation, 0)}% more participants compared to an individual RCT. Of ${totalN} total participants, only ${Math.round(effectiveN)} are "effective" independent observations.`,
    recommendations: [
      `DEFF = ${roundUp(DEFF, 2)} → multiply individual sample size by ${roundUp(DEFF, 2)}`,
      rho > 0.05 ? 'High ICC - consider smaller clusters' : 'Moderate ICC - clustering impact manageable',
      m > 50 ? 'Large clusters amplify DEFF - consider fewer, larger clusters vs more, smaller' : 'Reasonable cluster size',
      'Use DEFF to adjust any individual-level sample size formula'
    ],
    reference: 'Kish, L. (1965). Survey Sampling. John Wiley & Sons.'
  };
}
