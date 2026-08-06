// KARMASTAT — Intelligent Study Design Detector (engine)
// ---------------------------------------------------------------------------
// A transparent, multi-signal classifier that maps a free-text research
// description to the most appropriate KARMASTAT calculator. It replaces the
// previous engines, which used naive substring matching (so "prior" matched
// inside "priority"), returned the FIRST regex hit regardless of stronger
// evidence, and reported a confidence that was floored at 50% (so everything
// looked like a >=50% match).
//
// Design goals:
//   1. Word-boundary, plural/tense-tolerant matching — no substring false hits.
//   2. Weighted evidence from MANY signals per design, plus negative evidence.
//   3. Extracted "slots" (outcome type, group count, temporal direction,
//      randomization, matching, clustering) that discriminate between designs.
//   4. A CALIBRATED confidence that can honestly say "ambiguous — please
//      clarify", driven by both absolute evidence and how dominant the winner is.
//   5. Ranked alternatives, each routing to an exact calculator, with a
//      human-readable "why" and targeted follow-up questions when unsure.
//
// Pure JavaScript, no dependencies — usable from React or a plain <script>.

// --- helpers ---------------------------------------------------------------

// Build a case-insensitive, word-boundary regex from a phrase. Spaces in the
// phrase match one-or-more spaces/hyphens so "case control", "case-control" and
// "case  control" all match; a trailing (s|es)? tolerates simple plurals.
function phrase(p, { plural = true } = {}) {
  // Escape regex specials FIRST, then turn spaces into a whitespace/hyphen class so
  // "case control", "case-control" and "case  control" all match.
  const esc = p.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = esc.replace(/\s+/g, '[\\s-]+');
  const tail = plural ? '(?:s|es)?' : '';
  return new RegExp(`\\b${body}${tail}\\b`, 'i');
}

// --- slot extraction -------------------------------------------------------
// Slots are high-level features that strongly discriminate designs and drive
// both scoring bonuses and clarifying questions.

function extractSlots(text) {
  const hasAny = (arr) => arr.some((p) => phrase(p).test(text));

  const outcome = {
    binary: hasAny(['prevalence', 'proportion', 'percentage', 'rate of', 'incidence',
      'odds ratio', 'risk ratio', 'relative risk', 'cured', 'mortality rate', 'response rate',
      'success rate', 'positive', 'presence of', 'yes or no', 'dichotomous', 'binary outcome']),
    continuous: hasAny(['mean', 'average', 'level of', 'score', 'blood pressure', 'concentration',
      'bmi', 'weight', 'height', 'change in', 'continuous outcome', 'measurement', 'hba1c',
      'cholesterol', 'numeric']),
    timeToEvent: hasAny(['survival', 'time to event', 'time until', 'time-to-event', 'hazard',
      'kaplan', 'cox', 'median survival', 'progression free', 'overall survival', 'censoring',
      'until death', 'until recurrence', 'follow up until']),
    count: hasAny(['count of', 'number of episodes', 'poisson', 'rate per', 'events per',
      'incidence rate']),
    agreement: hasAny(['agreement', 'inter rater', 'intra rater', 'interobserver', 'reliability',
      'reproducibility', 'kappa', 'concordance', 'consistency between']),
    diagnostic: hasAny(['sensitivity', 'specificity', 'diagnostic accuracy', 'roc', 'auc',
      'predictive value', 'screening test', 'gold standard', 'index test', 'likelihood ratio']),
  };

  const design = {
    randomized: hasAny(['randomized', 'randomised', 'random allocation', 'randomly assigned',
      'randomly allocated', 'rct', 'placebo']),
    intervention: hasAny(['intervention', 'treatment', 'therapy', 'drug', 'vaccine', 'surgery',
      'administered', 'received the', 'given the', 'trial arm', 'experimental group']),
    retrospective: hasAny(['retrospective', 'case control', 'looking back', 'past exposure',
      'already occurred', 'medical records review', 'chart review']),
    prospective: hasAny(['prospective', 'followed over time', 'follow up', 'cohort',
      'over the next', 'incidence', 'develop the disease', 'longitudinal']),
    crossSectional: hasAny(['cross sectional', 'at a single point', 'point in time', 'snapshot',
      'survey', 'at one time', 'current status', 'burden of disease']),
    matchedPaired: hasAny(['matched', 'paired', 'before and after', 'pre and post', 'pre post',
      'same patients', 'repeated measures', 'crossover']),
    clustered: hasAny(['cluster', 'clusters', 'villages', 'clinics were randomized',
      'schools', 'communities randomized', 'group randomized', 'multilevel', 'hierarchical']),
    comparingGroups: hasAny(['compare', 'comparison', 'versus', ' vs ', 'between two groups',
      'difference between', 'two groups', 'control group', 'compared to']),
    correlation: hasAny(['correlation', 'associated with', 'relationship between', 'predictors of',
      'associated factors']),
    equivalence: hasAny(['non inferiority', 'noninferiority', 'equivalence', 'as good as',
      'not worse than', 'bioequivalence']),
    metaAnalysis: hasAny(['meta analysis', 'systematic review', 'pooled estimate', 'forest plot',
      'across studies', 'combine studies', 'pooling results']),
    bayesian: hasAny(['bayesian', 'prior distribution', 'posterior', 'credible interval',
      'assurance', 'informative prior']),
    manyGroups: hasAny(['three groups', 'multiple groups', 'several groups', 'anova',
      'more than two groups', 'four groups', 'across groups']),
  };

  return { outcome, design };
}

// --- study-type catalogue --------------------------------------------------
// Each type lists positive signals (with weights) and negative/anti signals.
// `slot` bonuses are applied in score() from the extracted slots.

const P = phrase; // alias

const STUDY_TYPES = [
  {
    key: 'clinical-trials', name: 'Clinical Trial (RCT)', route: '/calculator/clinical-trials',
    blurb: 'Randomised comparison of an intervention against a control to establish efficacy.',
    signals: [
      { re: P('randomized controlled trial'), w: 4 }, { re: P('rct'), w: 4 },
      { re: P('randomized'), w: 3 }, { re: P('randomised'), w: 3 },
      { re: P('placebo'), w: 3 }, { re: P('intervention'), w: 2 },
      { re: P('efficacy'), w: 2 }, { re: P('treatment arm'), w: 2 },
      { re: P('superiority'), w: 2 }, { re: P('clinical trial'), w: 3 },
      { re: P('randomly assigned'), w: 3 }, { re: P('trial'), w: 1 },
    ],
    anti: [
      { re: P('observational'), w: 3 }, { re: P('retrospective'), w: 2 },
      { re: P('prevalence'), w: 2 }, { re: P('cross sectional'), w: 2 },
    ],
  },
  {
    key: 'case-control', name: 'Case-Control Study', route: '/calculator/comparative',
    blurb: 'Compare past exposures between people with a disease (cases) and without (controls).',
    signals: [
      { re: P('case control'), w: 5 }, { re: P('cases and controls'), w: 4 },
      { re: P('odds ratio'), w: 3 }, { re: P('retrospective'), w: 2 },
      { re: P('matched controls'), w: 3 }, { re: P('risk factor'), w: 2 },
      { re: P('past exposure'), w: 2 }, { re: P('etiology'), w: 1 },
    ],
    anti: [
      { re: P('randomized'), w: 3 }, { re: P('prevalence'), w: 1 },
      { re: P('incidence'), w: 2 }, { re: P('prospective'), w: 2 },
    ],
  },
  {
    key: 'cohort', name: 'Cohort Study', route: '/calculator/comparative',
    blurb: 'Follow exposed vs unexposed groups forward in time to compare incidence / relative risk.',
    signals: [
      { re: P('cohort'), w: 5 }, { re: P('prospective'), w: 3 },
      { re: P('relative risk'), w: 3 }, { re: P('risk ratio'), w: 3 },
      { re: P('incidence'), w: 3 }, { re: P('exposed'), w: 2 },
      { re: P('unexposed'), w: 2 }, { re: P('followed over time'), w: 3 },
      { re: P('longitudinal'), w: 2 }, { re: P('natural history'), w: 1 },
    ],
    anti: [
      { re: P('randomized'), w: 3 }, { re: P('case control'), w: 3 },
      { re: P('cross sectional'), w: 2 }, { re: P('time to event'), w: 2 },
    ],
  },
  {
    key: 'cross-sectional', name: 'Cross-Sectional (two-proportion)', route: '/calculator/comparative',
    blurb: 'Compare a proportion between groups measured at a single time point.',
    signals: [
      { re: P('cross sectional'), w: 4 }, { re: P('compare proportion'), w: 3 },
      { re: P('difference in proportion'), w: 3 }, { re: P('prevalence in'), w: 2 },
      { re: P('association between'), w: 1 },
    ],
    anti: [
      { re: P('randomized'), w: 2 }, { re: P('follow up'), w: 2 },
      { re: P('time to event'), w: 2 },
    ],
  },
  {
    key: 'descriptive', name: 'Descriptive / Prevalence Study', route: '/calculator/descriptive',
    blurb: 'Estimate a single prevalence or mean in one population with a target precision.',
    signals: [
      { re: P('prevalence'), w: 4 }, { re: P('estimate the proportion'), w: 3 },
      { re: P('survey'), w: 2 }, { re: P('burden of disease'), w: 2 },
      { re: P('point in time'), w: 2 }, { re: P('estimate the mean'), w: 3 },
      { re: P('proportion of'), w: 2 }, { re: P('how common'), w: 2 },
      { re: P('single group'), w: 1 },
    ],
    anti: [
      { re: P('compare'), w: 2 }, { re: P('versus'), w: 2 },
      { re: P('randomized'), w: 2 }, { re: P('two groups'), w: 2 },
    ],
  },
  {
    key: 'ttest', name: 'T-Test / Mean Comparison', route: '/calculator/ttest',
    blurb: 'Compare a continuous mean between two groups, or before vs after in the same subjects.',
    signals: [
      { re: P('t test'), w: 4 }, { re: P('compare mean'), w: 4 },
      { re: P('mean difference'), w: 3 }, { re: P('before and after'), w: 3 },
      { re: P('pre and post'), w: 3 }, { re: P('paired'), w: 3 },
      { re: P('continuous outcome'), w: 2 }, { re: P('average'), w: 1 },
    ],
    anti: [
      { re: P('prevalence'), w: 2 }, { re: P('proportion'), w: 2 },
      { re: P('time to event'), w: 2 }, { re: P('three groups'), w: 2 },
    ],
  },
  {
    key: 'survival', name: 'Survival / Time-to-Event', route: '/calculator/survival',
    blurb: 'Time until an event (death, relapse) with censoring; log-rank / Cox / Kaplan-Meier.',
    signals: [
      { re: P('survival'), w: 4 }, { re: P('time to event'), w: 5 },
      { re: P('time until'), w: 3 }, { re: P('hazard ratio'), w: 4 },
      { re: P('kaplan meier'), w: 4 }, { re: P('cox'), w: 3 },
      { re: P('median survival'), w: 3 }, { re: P('censoring'), w: 3 },
      { re: P('progression free'), w: 3 }, { re: P('overall survival'), w: 3 },
    ],
    anti: [{ re: P('prevalence'), w: 2 }, { re: P('cross sectional'), w: 2 }],
  },
  {
    key: 'diagnostic', name: 'Diagnostic Accuracy / ROC', route: '/calculator/diagnostic',
    blurb: 'Evaluate a test against a reference standard: sensitivity, specificity, AUC.',
    signals: [
      { re: P('sensitivity'), w: 4 }, { re: P('specificity'), w: 4 },
      { re: P('diagnostic accuracy'), w: 4 }, { re: P('diagnostic test'), w: 3 },
      { re: P('screening'), w: 2 }, { re: P('roc'), w: 3 }, { re: P('auc'), w: 3 },
      { re: P('predictive value'), w: 3 }, { re: P('gold standard'), w: 3 },
      { re: P('index test'), w: 2 }, { re: P('likelihood ratio'), w: 2 },
    ],
    anti: [{ re: P('randomized'), w: 2 }, { re: P('hazard'), w: 2 }],
  },
  {
    key: 'agreement', name: 'Agreement / Reliability', route: '/calculator/agreement',
    blurb: 'Inter-rater / test-retest agreement: Cohen’s kappa, ICC, Bland-Altman.',
    signals: [
      { re: P('inter rater'), w: 4 }, { re: P('interobserver'), w: 4 },
      { re: P('intra rater'), w: 4 }, { re: P('agreement'), w: 3 },
      { re: P('reliability'), w: 3 }, { re: P('reproducibility'), w: 3 },
      { re: P('kappa'), w: 4 }, { re: P('icc'), w: 3 }, { re: P('intraclass'), w: 4 },
      { re: P('bland altman'), w: 4 }, { re: P('concordance'), w: 3 },
    ],
    anti: [{ re: P('randomized'), w: 2 }, { re: P('prevalence'), w: 1 }],
  },
  {
    key: 'meta-analysis', name: 'Meta-Analysis', route: '/calculator/meta-analysis',
    blurb: 'Pool effect estimates across multiple studies; heterogeneity and prediction interval.',
    signals: [
      { re: P('meta analysis'), w: 5 }, { re: P('systematic review'), w: 3 },
      { re: P('pooled estimate'), w: 4 }, { re: P('forest plot'), w: 4 },
      { re: P('heterogeneity'), w: 3 }, { re: P('combine studies'), w: 3 },
      { re: P('across studies'), w: 2 },
    ],
    anti: [],
  },
  {
    key: 'cluster', name: 'Cluster-Randomised / Multilevel', route: '/calculator/cluster-multilevel',
    blurb: 'Randomisation or sampling by group (clinic, village); design effect and ICC.',
    signals: [
      { re: P('cluster randomized'), w: 5 }, { re: P('cluster randomised'), w: 5 },
      { re: P('cluster'), w: 3 }, { re: P('design effect'), w: 4 },
      { re: P('intraclass correlation'), w: 3 }, { re: P('multilevel'), w: 3 },
      { re: P('villages'), w: 2 }, { re: P('group randomized'), w: 3 },
      { re: P('hierarchical'), w: 2 },
    ],
    anti: [],
  },
  {
    key: 'effect-size', name: 'Effect Size', route: '/calculator/effect-size',
    blurb: 'Compute or convert effect sizes (Cohen’s d, odds ratio, r, eta-squared).',
    signals: [
      { re: P('effect size'), w: 4 }, { re: P('cohen'), w: 3 },
      { re: P('standardized mean difference'), w: 3 }, { re: P('hedges'), w: 3 },
      { re: P('eta squared'), w: 3 },
    ],
    anti: [{ re: P('sample size'), w: 1 }],
  },
  {
    key: 'meta-power', name: 'Power Analysis', route: '/calculator/power-analysis',
    blurb: 'Compute achieved power, or the minimum detectable effect for a fixed sample.',
    signals: [
      { re: P('power analysis'), w: 4 }, { re: P('post hoc power'), w: 4 },
      { re: P('achieved power'), w: 3 }, { re: P('detectable effect'), w: 3 },
      { re: P('statistical power'), w: 3 },
    ],
    anti: [],
  },
  {
    key: 'bayesian', name: 'Bayesian Design', route: '/calculator/bayesian',
    blurb: 'Prior-informed sample size, credible intervals, assurance, adaptive designs.',
    signals: [
      { re: P('bayesian'), w: 5 }, { re: P('prior distribution'), w: 3 },
      { re: P('posterior'), w: 3 }, { re: P('credible interval'), w: 4 },
      { re: P('assurance'), w: 3 }, { re: P('informative prior'), w: 3 },
    ],
    anti: [],
  },
];

// --- scoring & slot bonuses ------------------------------------------------

function applySlotBonuses(scores, slots, reasonsByKey) {
  const add = (key, amt, why) => {
    if (scores[key] === undefined) return;
    scores[key] += amt;
    if (amt > 0 && why) reasonsByKey[key].push(why);
  };
  const { outcome, design } = slots;

  // Randomised intervention → strongly RCT (or cluster if clustered)
  if (design.randomized && design.intervention) {
    if (design.clustered) add('cluster', 4, 'randomisation is by cluster');
    else add('clinical-trials', 3, 'a randomised intervention is described');
  }
  if (design.equivalence) add('clinical-trials', 2, 'non-inferiority/equivalence framing');

  // Outcome type steers between comparative-family designs
  if (outcome.timeToEvent) add('survival', 3, 'the outcome is time-to-event');
  if (outcome.diagnostic) add('diagnostic', 3, 'test-accuracy metrics are mentioned');
  if (outcome.agreement) add('agreement', 3, 'rater agreement / reliability is the goal');
  if (outcome.continuous && design.comparingGroups) add('ttest', 2, 'a continuous outcome is compared between groups');
  if (outcome.continuous && design.matchedPaired) add('ttest', 2, 'paired / before-after continuous measurements');
  if (outcome.binary && !design.comparingGroups && !design.randomized) add('descriptive', 2, 'a single proportion is being estimated');

  // Temporal direction steers case-control vs cohort
  if (design.retrospective) add('case-control', 2, 'the design looks backward from outcome to exposure');
  if (design.prospective && !design.randomized) add('cohort', 2, 'subjects are followed forward in time');
  if (design.crossSectional) add('cross-sectional', 2, 'data are collected at a single time point');
  if (design.metaAnalysis) add('meta-analysis', 4, 'results are combined across studies');
  if (design.bayesian) add('bayesian', 4, 'a prior / Bayesian framing is used');
  if (design.clustered) add('cluster', 3, 'the unit of sampling/randomisation is a cluster');
}

// Build clarifying questions when the winner is weak/ambiguous.
function clarifyingQuestions(slots, ranked) {
  const qs = [];
  const { outcome, design } = slots;
  const outcomeKnown = outcome.binary || outcome.continuous || outcome.timeToEvent ||
    outcome.diagnostic || outcome.agreement;
  if (!outcomeKnown) {
    qs.push('What type of outcome are you measuring — a proportion/percentage, a mean/continuous value, or time-until-an-event?');
  }
  if (!design.randomized && !design.retrospective && !design.prospective && !design.crossSectional) {
    qs.push('Is this an experiment (you assign the intervention) or observational (you observe what already happens)?');
  }
  if (design.comparingGroups === false && !outcome.diagnostic && !outcome.agreement) {
    qs.push('Are you comparing groups, or estimating a single quantity in one population?');
  }
  // If the top two are close, ask the discriminating question between them.
  if (ranked.length >= 2 && ranked[0].score > 0 &&
      (ranked[0].score - ranked[1].score) / ranked[0].score < 0.25) {
    qs.push(`Your description fits both a ${ranked[0].name} and a ${ranked[1].name}. Which matches your intent?`);
  }
  return qs.slice(0, 3);
}

// --- public API ------------------------------------------------------------

/**
 * detectStudyDesign(text) -> {
 *   recommendations: [{ key, name, route, blurb, confidence, score, why[] }],
 *   top, confidence, ambiguous, clarifyingQuestions[], slots
 * }
 */
export function detectStudyDesign(rawText) {
  const text = ` ${String(rawText || '').toLowerCase().replace(/\s+/g, ' ')} `;

  const scores = {};
  const reasonsByKey = {};
  for (const t of STUDY_TYPES) { scores[t.key] = 0; reasonsByKey[t.key] = []; }

  // 1) direct signal matching (word-boundary)
  for (const t of STUDY_TYPES) {
    for (const s of t.signals) {
      if (s.re.test(text)) {
        scores[t.key] += s.w;
        reasonsByKey[t.key].push(labelOf(s.re));
      }
    }
    for (const a of t.anti) {
      if (a.re.test(text)) scores[t.key] -= a.w;
    }
  }

  // 2) slot-based discriminators
  const slots = extractSlots(text);
  applySlotBonuses(scores, slots, reasonsByKey);

  // 3) rank
  const ranked = STUDY_TYPES
    .map((t) => ({
      key: t.key, name: t.name, route: t.route, blurb: t.blurb,
      score: Math.max(0, scores[t.key]),
      why: dedupe(reasonsByKey[t.key]),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // 4) calibrated confidence
  const top = ranked[0] || null;
  const second = ranked[1] || { score: 0 };
  let confidence = 0;
  let ambiguous = true;
  if (top) {
    const K = 6; // evidence saturation constant
    const strength = 1 - Math.exp(-top.score / K);          // 0..1 absolute evidence
    const dominance = top.score > 0 ? (top.score - second.score) / top.score : 0; // 0..1 separation
    confidence = Math.round(100 * strength * (0.55 + 0.45 * dominance));
    // Honest floors/ceilings: weak or tied evidence must read as uncertain.
    if (top.score < 3) { confidence = Math.min(confidence, 40); ambiguous = true; }
    else if (dominance < 0.15) { confidence = Math.min(confidence, 60); ambiguous = true; }
    else { ambiguous = confidence < 55; }
    confidence = Math.max(15, Math.min(96, confidence));
  }

  // attach per-recommendation confidence (top gets the calibrated value; others scale down)
  const recommendations = ranked.slice(0, 4).map((r, i) => ({
    ...r,
    confidence: i === 0 ? confidence : Math.max(10, Math.round(confidence * r.score / top.score)),
  }));

  return {
    recommendations,
    top,
    confidence,
    ambiguous: top ? ambiguous : true,
    clarifyingQuestions: clarifyingQuestions(slots, ranked),
    slots,
  };
}

// A readable label for a signal regex (strip the \b...\b wrapper).
function labelOf(re) {
  return re.source
    .replace(/\\b/g, '')
    .replace(/\(\?:s\|es\)\?/g, '')
    .replace(/\[\\s-\]\+/g, ' ')
    .replace(/\\/g, '')
    .trim();
}
function dedupe(arr) { return Array.from(new Set(arr)); }

export default detectStudyDesign;
