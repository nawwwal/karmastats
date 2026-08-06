// KARMASTAT — Descriptive statistics & normality engine
// ---------------------------------------------------------------------------
// Pure JavaScript (no dependencies). Computes descriptive statistics, runs a
// normality battery (Shapiro–Wilk via Royston 1992 AS R94 — the same algorithm
// R's shapiro.test uses — plus the D'Agostino–Pearson omnibus test and
// skewness/kurtosis), auto-detects variable types, recommends the appropriate
// downstream test from a normality/design decision tree, and generates
// reproducible R and Python code. Validated against R 4.6.0 shapiro.test.

// ---- normal distribution helpers ------------------------------------------

// Inverse standard normal CDF (Acklam / Beasley-Springer); good to ~1e-9.
export function qnorm(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q, r, x;
  if (p < pLow) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  else if (p <= pHigh) { q = p - 0.5; r = q*q; x = (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
  else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  // one Halley refinement for extra accuracy
  const e = 0.5 * erfc(-x / Math.SQRT2) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
  return x - u / (1 + x * u / 2);
}

function erfc(x) {
  const z = Math.abs(x);
  const t = 1 / (1 + z / 2);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
    t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}

// Standard normal CDF
export function pnorm(x) { return 1 - 0.5 * erfc(x / Math.SQRT2); }

function poly(c, x) { let r = 0; for (let i = c.length - 1; i >= 0; i--) r = r * x + c[i]; return r; }

// ---- basic descriptive statistics -----------------------------------------

function asNumbers(arr) {
  return arr.map((v) => (v === '' || v === null || v === undefined) ? NaN : Number(v)).filter((v) => Number.isFinite(v));
}

export function quantile(sorted, p) {
  // R type-7 (default) linear interpolation on already-sorted array
  const n = sorted.length;
  if (n === 0) return NaN;
  if (n === 1) return sorted[0];
  const h = (n - 1) * p;
  const lo = Math.floor(h);
  const frac = h - lo;
  return sorted[lo] + frac * (sorted[Math.min(lo + 1, n - 1)] - sorted[lo]);
}

export function describeNumeric(rawValues) {
  const x = asNumbers(rawValues);
  const n = x.length;
  const missing = rawValues.length - n;
  if (n === 0) return { n: 0, missing };
  const sorted = [...x].sort((a, b) => a - b);
  const sum = x.reduce((s, v) => s + v, 0);
  const mean = sum / n;
  const m2 = x.reduce((s, v) => s + (v - mean) ** 2, 0);
  const variance = n > 1 ? m2 / (n - 1) : NaN;      // sample variance
  const sd = Math.sqrt(variance);
  const se = sd / Math.sqrt(n);
  const median = quantile(sorted, 0.5);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const tCrit = 1.96; // large-sample; adequate for a summary CI
  const ciLow = mean - tCrit * se;
  const ciHigh = mean + tCrit * se;

  // SPSS/Excel sample skewness (G1) and excess kurtosis (G2)
  let skew = NaN, kurt = NaN;
  if (n > 2 && sd > 0) {
    const s3 = x.reduce((s, v) => s + ((v - mean) / sd) ** 3, 0);
    skew = (n / ((n - 1) * (n - 2))) * s3;
  }
  if (n > 3 && sd > 0) {
    const s4 = x.reduce((s, v) => s + ((v - mean) / sd) ** 4, 0);
    kurt = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * s4 - 3 * (n - 1) ** 2 / ((n - 2) * (n - 3));
  }

  return {
    n, missing, mean, sd, se, variance,
    min: sorted[0], max: sorted[n - 1], range: sorted[n - 1] - sorted[0],
    median, q1, q3, iqr: q3 - q1, sum,
    skewness: skew, kurtosis: kurt,
    ci95: [ciLow, ciHigh],
    values: x, sorted,
  };
}

export function describeCategorical(rawValues) {
  const counts = new Map();
  let missing = 0;
  for (const v of rawValues) {
    if (v === '' || v === null || v === undefined) { missing++; continue; }
    const k = String(v);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const n = rawValues.length - missing;
  const levels = [...counts.entries()]
    .map(([level, count]) => ({ level, count, percent: (count / n) * 100 }))
    .sort((a, b) => b.count - a.count);
  return { n, missing, levels, mode: levels[0] ? levels[0].level : null, nLevels: levels.length };
}

// ---- Shapiro–Wilk (Royston 1992, AS R94) ----------------------------------
// Returns { W, p, n }. Valid for 3 <= n <= 5000.
export function shapiroWilk(rawValues) {
  const x = asNumbers(rawValues).sort((a, b) => a - b);
  const n = x.length;
  if (n < 3) return { W: NaN, p: NaN, n, error: 'need at least 3 values' };
  if (n > 5000) return { W: NaN, p: NaN, n, error: 'Shapiro–Wilk valid for n ≤ 5000; use D’Agostino for large n' };

  const c1 = [0, 0.221157, -0.147981, -2.071190, 4.434685, -2.706056];
  const c2 = [0, 0.042981, -0.293762, -1.752461, 5.682633, -3.582633];
  const c3 = [0.544, -0.39978, 0.025054, -6.714e-4];
  const c4 = [1.3822, -0.77857, 0.062767, -0.0020322];
  const c5 = [-1.5861, -0.31082, -0.083751, 0.0038915];
  const c6 = [-0.4803, -0.082676, 0.0030302];
  const g = [-2.273, 0.459];

  const n2 = Math.floor(n / 2);
  const a = new Array(n2);

  if (n === 3) {
    a[0] = Math.sqrt(0.5);
  } else {
    const an25 = n + 0.25;
    const m = new Array(n2);
    let summ2 = 0;
    for (let i = 0; i < n2; i++) {
      m[i] = qnorm((i + 1 - 0.375) / an25);
      summ2 += m[i] * m[i];
    }
    summ2 *= 2;
    const ssumm2 = Math.sqrt(summ2);
    const rsn = 1 / Math.sqrt(n);
    const a1 = poly(c1, rsn) - m[0] / ssumm2;
    let i1, fac;
    if (n > 5) {
      i1 = 2;
      const a2 = poly(c2, rsn) - m[1] / ssumm2;
      fac = Math.sqrt((summ2 - 2 * m[0] * m[0] - 2 * m[1] * m[1]) / (1 - 2 * a1 * a1 - 2 * a2 * a2));
      a[0] = a1; a[1] = a2;
    } else {
      i1 = 1;
      fac = Math.sqrt((summ2 - 2 * m[0] * m[0]) / (1 - 2 * a1 * a1));
      a[0] = a1;
    }
    for (let i = i1; i < n2; i++) a[i] = -m[i] / fac;
  }

  // W statistic
  const mean = x.reduce((s, v) => s + v, 0) / n;
  let ss = 0; for (const v of x) ss += (v - mean) ** 2;
  let wNum = 0;
  for (let i = 0; i < n2; i++) wNum += a[i] * (x[n - 1 - i] - x[i]);
  let W = (wNum * wNum) / ss;

  // p-value (Royston)
  const an = n;
  let pw;
  if (n === 3) {
    const pi6 = 1.90985931710274, stqr = 1.04719755119660;
    pw = pi6 * (Math.asin(Math.sqrt(W)) - stqr);
    if (pw < 0) pw = 0;
  } else {
    let y = Math.log(1 - W);
    const xx = Math.log(an);
    let m, s;
    if (n <= 11) {
      const gamma = poly(g, an);
      if (y >= gamma) return { W, p: 1e-99, n };
      y = -Math.log(gamma - y);
      m = poly(c3, an);
      s = Math.exp(poly(c4, an));
    } else {
      m = poly(c5, xx);
      s = Math.exp(poly(c6, xx));
    }
    pw = 1 - pnorm((y - m) / s);
  }
  return { W, p: Math.max(0, Math.min(1, pw)), n };
}

// ---- D'Agostino–Pearson omnibus test --------------------------------------
export function dagostinoPearson(rawValues) {
  const x = asNumbers(rawValues);
  const n = x.length;
  if (n < 8) return { K2: NaN, p: NaN, n, error: 'need n ≥ 8' };
  const mean = x.reduce((s, v) => s + v, 0) / n;
  const m2 = x.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const m3 = x.reduce((s, v) => s + (v - mean) ** 3, 0) / n;
  const m4 = x.reduce((s, v) => s + (v - mean) ** 4, 0) / n;
  const g1 = m3 / Math.pow(m2, 1.5);   // population skewness
  const b2 = m4 / (m2 * m2);           // population kurtosis

  // Skewness Z (D'Agostino 1970)
  const Y = g1 * Math.sqrt((n + 1) * (n + 3) / (6 * (n - 2)));
  const beta2 = 3 * (n * n + 27 * n - 70) * (n + 1) * (n + 3) / ((n - 2) * (n + 7) * (n + 9));
  const W2 = -1 + Math.sqrt(2 * (beta2 - 1));
  const delta = 1 / Math.sqrt(Math.log(Math.sqrt(W2)));
  const alpha = Math.sqrt(2 / (W2 - 1));
  const zSkew = delta * Math.log(Y / alpha + Math.sqrt((Y / alpha) ** 2 + 1));

  // Kurtosis Z (Anscombe–Glynn 1983)
  const E = 3 * (n - 1) / (n + 1);
  const varB2 = 24 * n * (n - 2) * (n - 3) / ((n + 1) ** 2 * (n + 3) * (n + 5));
  const xk = (b2 - E) / Math.sqrt(varB2);
  const sqrtBeta1 = 6 * (n * n - 5 * n + 2) / ((n + 7) * (n + 9)) * Math.sqrt(6 * (n + 3) * (n + 5) / (n * (n - 2) * (n - 3)));
  const A = 6 + 8 / sqrtBeta1 * (2 / sqrtBeta1 + Math.sqrt(1 + 4 / (sqrtBeta1 * sqrtBeta1)));
  const term = (1 - 2 / A) / (1 + xk * Math.sqrt(2 / (A - 4)));
  const zKurt = ((1 - 2 / (9 * A)) - Math.cbrt(term)) / Math.sqrt(2 / (9 * A));

  const K2 = zSkew * zSkew + zKurt * zKurt;
  const p = Math.exp(-K2 / 2); // chi-square(2) upper tail
  return { K2, p, zSkew, zKurt, g1, excessKurtosis: b2 - 3, n };
}

// ---- combined normality verdict -------------------------------------------
// Pass a precomputed describeNumeric result to avoid re-summarising the column.
export function assessNormality(rawValues, precomputedDesc) {
  const desc = precomputedDesc || describeNumeric(rawValues);
  const n = desc.n;
  const sw = n >= 3 && n <= 5000 ? shapiroWilk(rawValues) : null;
  const dp = n >= 8 ? dagostinoPearson(rawValues) : null;

  // Primary rule: Shapiro–Wilk for n ≤ 5000, else D'Agostino. Normal if p ≥ 0.05.
  let primary = sw && Number.isFinite(sw.p) ? { name: 'Shapiro–Wilk', p: sw.p, stat: sw.W } : null;
  if (!primary && dp && Number.isFinite(dp.p)) primary = { name: "D'Agostino–Pearson", p: dp.p, stat: dp.K2 };

  const isNormal = primary ? primary.p >= 0.05 : null;
  const note = n > 300
    ? 'With large n, formal tests flag trivial departures; also judge normality from the Q–Q plot and skewness/kurtosis.'
    : n < 8
      ? 'Very small sample — tests have low power; rely on the Q–Q plot and subject knowledge.'
      : null;

  return {
    n, isNormal, primary,
    shapiroWilk: sw, dagostino: dp,
    skewness: desc.skewness, kurtosis: desc.kurtosis,
    note,
  };
}

// ---- single normality p-value (same primary rule as assessNormality) ------
export function normTest(values) {
  const n = values.length;
  if (n >= 3 && n <= 5000) {
    const sw = shapiroWilk(values);
    if (Number.isFinite(sw.p)) return { name: 'Shapiro–Wilk', label: 'W', stat: sw.W, p: sw.p, n };
  }
  if (n >= 8) {
    const dp = dagostinoPearson(values);
    if (Number.isFinite(dp.p)) return { name: "D'Agostino–Pearson", label: 'K²', stat: dp.K2, p: dp.p, n };
  }
  return null;
}

// ---- outlier detection (Tukey fences) --------------------------------------
// mild: beyond Q1/Q3 ± 1.5·IQR; extreme: beyond ± 3·IQR. Whiskers = most
// extreme observations still inside the inner fences (standard box plot).
export function tukeyOutliers(rawValues, presorted) {
  const sorted = presorted || [...asNumbers(rawValues)].sort((a, b) => a - b);
  const n = sorted.length;
  if (n < 5) return null;
  const q1 = quantile(sorted, 0.25), q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const innerLow = q1 - 1.5 * iqr, innerHigh = q3 + 1.5 * iqr;
  const outerLow = q1 - 3 * iqr, outerHigh = q3 + 3 * iqr;
  const mild = [], extreme = [], inliers = [];
  for (const v of sorted) {
    if (v < outerLow || v > outerHigh) extreme.push(v);
    else if (v < innerLow || v > innerHigh) mild.push(v);
    else inliers.push(v);
  }
  return {
    n, q1, q3, iqr, median: quantile(sorted, 0.5),
    innerLow, innerHigh, outerLow, outerHigh,
    mild, extreme, inliers,
    whiskerLow: inliers.length ? inliers[0] : q1,
    whiskerHigh: inliers.length ? inliers[inliers.length - 1] : q3,
    min: sorted[0], max: sorted[n - 1],
  };
}

// Smallest 3-significant-figure number >= v (so a rounded domain shift can
// never fall below the exact one and silently push observations out of domain)
function sigCeil(v) {
  if (!(v > 0)) return 0;
  const step = Math.pow(10, Math.floor(Math.log10(v)) - 2);
  return Number((Math.ceil(v / step - 1e-9) * step).toPrecision(12));
}

// One-pass sample skewness (G1) — advisor rows don't need full descriptives
function sampleSkewness(t) {
  const n = t.length;
  if (n < 3) return NaN;
  let s = 0;
  for (const v of t) s += v;
  const mean = s / n;
  let m2 = 0, m3 = 0;
  for (const v of t) { const d = v - mean, d2 = d * d; m2 += d2; m3 += d2 * d; }
  const sd = Math.sqrt(m2 / (n - 1));
  if (!(sd > 0)) return NaN;
  return (n / ((n - 1) * (n - 2))) * (m3 / (sd * sd * sd));
}

// ---- transformation advisor (common rungs of Tukey's ladder) ---------------
// Re-tests normality after ln, √, 1/x and x². Transforms that need a domain
// shift get one (ln(x+c), √(x+c)) and say so in the label; 1/x and x² are
// offered only where the domain allows them without a shift. Shifts are
// rounded UP (sigCeil) so every observation stays in domain; any candidate
// that would still lose observations is dropped rather than tested on a
// truncated sample.
export function transformAdvisor(rawValues) {
  const x = asNumbers(rawValues);
  const n = x.length;
  if (n < 8) return null;
  let min = Infinity, max = -Infinity;
  for (const v of x) { if (v < min) min = v; if (v > max) max = v; }
  if (!(max > min)) return null; // constant column

  const logShift = min <= 0 ? sigCeil(1 - min) : 0;   // guarantees min + shift >= 1
  const sqrtShift = min < 0 ? sigCeil(-min) : 0;      // guarantees min + shift >= 0
  const candidates = [
    { key: 'none', label: 'None (original)', fn: (v) => v, ok: true },
    { key: 'log', label: logShift ? `ln(x + ${logShift})` : 'ln(x)', fn: (v) => Math.log(v + logShift), ok: true },
    { key: 'sqrt', label: sqrtShift ? `√(x + ${sqrtShift})` : '√x', fn: (v) => Math.sqrt(v + sqrtShift), ok: true },
    { key: 'recip', label: '1/x', fn: (v) => 1 / v, ok: min > 0 },
    { key: 'square', label: 'x²', fn: (v) => v * v, ok: min >= 0 },
  ];

  const rows = [];
  for (const c of candidates) {
    if (!c.ok) continue;
    const t = x.map(c.fn).filter(Number.isFinite);
    if (t.length !== n) continue; // would test a different sample — drop it
    const test = normTest(t);
    if (!test) continue;
    rows.push({ key: c.key, label: c.label, test, skewness: sampleSkewness(t), normal: test.p >= 0.05 });
  }

  const original = rows.find((r) => r.key === 'none') || null;
  let recommendation;
  if (original && original.normal) {
    recommendation = { type: 'none-needed', best: null };
  } else {
    const winners = rows.filter((r) => r.key !== 'none' && r.normal).sort((a, b) => b.test.p - a.test.p);
    recommendation = winners.length ? { type: 'transform', best: winners[0] } : { type: 'nonparametric', best: null };
  }
  return { rows, recommendation };
}

// ---- copy-ready reporting sentences (built ONLY from computed values) ------
export function reportSentences(varName, desc, norm) {
  if (!desc || !norm || !norm.primary) return null;
  const f = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');
  const p = norm.primary.p;
  const pTxt = p < 0.001 ? 'p < 0.001' : `p = ${p.toFixed(3)}`;
  const statTxt = norm.primary.name === 'Shapiro–Wilk'
    ? `W = ${f(norm.primary.stat, 3)}` : `K² = ${f(norm.primary.stat, 2)}`;
  const methods = `Normality of ${varName} was assessed using the ${norm.primary.name} test, supported by visual inspection of the histogram and normal Q–Q plot.`;
  const results = norm.isNormal
    ? `${varName} was approximately normally distributed (${norm.primary.name} ${statTxt}, ${pTxt}; skewness = ${f(desc.skewness)}, excess kurtosis = ${f(desc.kurtosis)}); values are therefore summarised as mean ± SD (${f(desc.mean)} ± ${f(desc.sd)}).`
    : `${varName} departed significantly from normality (${norm.primary.name} ${statTxt}, ${pTxt}; skewness = ${f(desc.skewness)}, excess kurtosis = ${f(desc.kurtosis)}); values are therefore summarised as median (IQR) (${f(desc.median)} [${f(desc.q1)}–${f(desc.q3)}]).`;
  return { methods, results };
}

// ---- variable type detection ----------------------------------------------
export function inferType(rawValues, name = '') {
  const nonEmpty = rawValues.filter((v) => v !== '' && v !== null && v !== undefined);
  if (nonEmpty.length === 0) return 'empty';
  const numeric = nonEmpty.filter((v) => Number.isFinite(Number(v)));
  const numericFrac = numeric.length / nonEmpty.length;
  const uniq = new Set(nonEmpty.map((v) => String(v)));
  const allUnique = uniq.size === nonEmpty.length;

  // ID detection: (a) the column NAME looks like an identifier (matches an "id"
  // suffix/word, serial, mrn, uid…) and values are all distinct; or (b) values are a
  // consecutive integer sequence (a row/serial number). Both avoid misclassifying a
  // continuous measurement that merely happens to be all-distinct integers.
  const nameLooksId = /(^|[\s_.])id($|[\s_.])|id$|^id|serial|\bmrn\b|\buid\b|patient.?id|subject.?id|record.?(no|id)/i.test(name);
  const nums = numeric.map(Number);
  const allInt = nums.length > 0 && nums.every((v) => Number.isInteger(v));
  const consecutive = allInt && allUnique && nums.length >= 8 && nums.every((v, i) => i === 0 || v === nums[i - 1] + 1);
  if ((nameLooksId && allUnique) || consecutive) return 'id';

  const looksDate = nonEmpty.slice(0, 20).every((v) => !Number.isFinite(Number(v)) && !isNaN(Date.parse(v)));
  if (looksDate) return 'date';

  if (numericFrac >= 0.9) {
    if (uniq.size === 2) return 'binary';
    if (uniq.size <= 6 && allInt) return 'categorical-numeric';
    if (allInt && uniq.size <= 20) {
      // loop, not Math.max(...spread) — a 100k-row column overflows the stack
      let maxV = -Infinity;
      for (const v of nums) if (v > maxV) maxV = v;
      if (maxV < 1000) return 'count';
    }
    return 'continuous';
  }
  if (uniq.size === 2) return 'binary';
  return 'categorical';
}

export function isContinuousType(t) { return t === 'continuous' || t === 'count'; }

// ---- test recommendation decision tree ------------------------------------
// context: { design: 'two-independent'|'paired'|'multi-group'|'correlation'|'one-sample',
//            groupsNormal: boolean, equalVariance?: boolean, k?: number }
export function recommendTest(context) {
  const { design, groupsNormal, equalVariance = true, k = 2 } = context;
  switch (design) {
    case 'two-independent':
      return groupsNormal
        ? (equalVariance
          ? { test: "Independent-samples t-test (Student)", why: 'both groups approximately normal, equal variances', route: '/calculator/ttest' }
          : { test: "Welch's t-test", why: 'both groups normal but unequal variances', route: '/calculator/ttest' })
        : { test: 'Mann–Whitney U test', why: 'at least one group is non-normal', route: '/calculator/comparative' };
    case 'paired':
      return groupsNormal
        ? { test: 'Paired-samples t-test', why: 'the paired differences are approximately normal', route: '/calculator/ttest' }
        : { test: 'Wilcoxon signed-rank test', why: 'the paired differences are non-normal' };
    case 'multi-group':
      return groupsNormal
        ? { test: `One-way ANOVA (${k} groups)`, why: 'all groups approximately normal', route: '/calculator/power-analysis' }
        : { test: 'Kruskal–Wallis test', why: 'at least one group is non-normal' };
    case 'correlation':
      return groupsNormal
        ? { test: 'Pearson correlation', why: 'both variables approximately normal', route: '/calculator/effect-size' }
        : { test: 'Spearman rank correlation', why: 'non-normal / monotonic relationship' };
    case 'one-sample':
      return groupsNormal
        ? { test: 'One-sample t-test', why: 'approximately normal', route: '/calculator/ttest' }
        : { test: 'One-sample Wilcoxon signed-rank test', why: 'non-normal' };
    default:
      return { test: 'Descriptive summary only', why: 'specify a comparison to get a test recommendation' };
  }
}

// ---- reproducible code generation -----------------------------------------
export function generateRCode(varName) {
  const v = varName || 'x';
  return `# KARMASTAT — reproducible R analysis
df <- read.csv("your_data.csv")      # or readxl::read_excel("your_data.xlsx")
${v} <- df$${v}

# Descriptive statistics
summary(${v}); sd(${v}, na.rm = TRUE)
psych::describe(${v})                 # mean, sd, skew, kurtosis, se

# Normality assessment (do this FIRST)
shapiro.test(${v})                    # Shapiro-Wilk (n <= 5000)
# fBasics::dagoTest(${v})             # D'Agostino-Pearson omnibus (large n)
qqnorm(${v}); qqline(${v})            # Q-Q plot
hist(${v}, breaks = "FD")

# Then choose the test based on normality, e.g.:
# t.test(${v} ~ group)   OR   wilcox.test(${v} ~ group)`;
}

export function generatePythonCode(varName) {
  const v = varName || 'x';
  return `# KARMASTAT — reproducible Python analysis
import pandas as pd
from scipy import stats

df = pd.read_csv("your_data.csv")        # or pd.read_excel("your_data.xlsx")
${v} = df["${v}"].dropna()

# Descriptive statistics
print(${v}.describe())
print("skew =", ${v}.skew(), "kurtosis =", ${v}.kurt())

# Normality assessment (do this FIRST)
print(stats.shapiro(${v}))               # Shapiro-Wilk
print(stats.normaltest(${v}))            # D'Agostino-Pearson omnibus
import statsmodels.api as sm
sm.qqplot(${v}, line="s")

# Then choose the test based on normality, e.g.:
# stats.ttest_ind(a, b)   OR   stats.mannwhitneyu(a, b)`;
}

export default { describeNumeric, describeCategorical, shapiroWilk, dagostinoPearson, assessNormality, inferType, recommendTest };
