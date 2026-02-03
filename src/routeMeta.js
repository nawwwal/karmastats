export const SITE_URL = 'https://karmastat.in';
export const DEFAULT_OG_IMAGE = '/og-default.png';

export const routesMeta = [
  {
    path: '/',
    title: 'KARMASTAT 2.0 | Advanced Medical Sample Size Calculators',
    description: 'KARMASTAT 2.0 provides advanced medical sample size calculators, power analysis, and reporting tools for clinical and epidemiological research.',
    canonicalPath: '/',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'weekly',
    priority: 1.0,
    kind: 'page'
  },
  {
    path: '/calculator/descriptive',
    title: 'Descriptive Studies Sample Size Calculator | KARMASTAT',
    description: 'Calculate sample size for prevalence, mean estimation, and finite population studies with confidence interval precision targets.',
    canonicalPath: '/calculator/descriptive',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/ttest',
    title: 'T-Test & Mean Comparison Calculator | KARMASTAT',
    description: 'Plan one-sample, two-sample, and paired t-test studies with effect size, variance, and power inputs.',
    canonicalPath: '/calculator/ttest',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/comparative',
    title: 'Comparative Study Sample Size Calculator | KARMASTAT',
    description: 'Compute sample size for case-control and cohort studies with odds ratios, relative risk, and exposure assumptions.',
    canonicalPath: '/calculator/comparative',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/diagnostic',
    title: 'Diagnostic Accuracy Sample Size Calculator | KARMASTAT',
    description: 'Estimate sample size for diagnostic accuracy studies including sensitivity, specificity, and ROC analysis.',
    canonicalPath: '/calculator/diagnostic',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/clinical-trials',
    title: 'Clinical Trials Sample Size Calculator | KARMASTAT',
    description: 'Design RCTs with superiority, non-inferiority, crossover, and adaptive clinical trial sample size calculations.',
    canonicalPath: '/calculator/clinical-trials',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/survival',
    title: 'Survival Analysis Sample Size Calculator | KARMASTAT',
    description: 'Calculate sample size for survival analysis with log-rank tests, hazard ratios, and time-to-event assumptions.',
    canonicalPath: '/calculator/survival',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/power-analysis',
    title: 'Power Analysis Calculator | KARMASTAT',
    description: 'Compute statistical power from sample size and effect size, and explore power curves for study planning.',
    canonicalPath: '/calculator/power-analysis',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/effect-size',
    title: 'Effect Size Calculator | KARMASTAT',
    description: 'Convert and compare effect sizes including Cohen\'s d, Hedges\' g, odds ratios, and correlations.',
    canonicalPath: '/calculator/effect-size',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/meta-analysis',
    title: 'Meta-Analysis Sample Size Calculator | KARMASTAT',
    description: 'Plan meta-analysis study counts with fixed or random effects models and heterogeneity inputs.',
    canonicalPath: '/calculator/meta-analysis',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/cluster-multilevel',
    title: 'Cluster & Multilevel Sample Size Calculator | KARMASTAT',
    description: 'Design cluster randomized trials with ICC inputs and design effect adjustments for multilevel studies.',
    canonicalPath: '/calculator/cluster-multilevel',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/bayesian',
    title: 'Bayesian Sample Size Calculator | KARMASTAT',
    description: 'Bayesian sample size planning with assurance targets, Bayes factors, and HPD width requirements.',
    canonicalPath: '/calculator/bayesian',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/calculator/agreement',
    title: 'Agreement Studies Sample Size Calculator | KARMASTAT',
    description: 'Plan inter-rater agreement studies with kappa, ICC, Bland-Altman, and Lin\'s CCC methods.',
    canonicalPath: '/calculator/agreement',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.8,
    kind: 'calculator'
  },
  {
    path: '/tools/report-generator',
    title: 'Statistical Report Generator | KARMASTAT',
    description: 'Generate structured statistical reports aligned to CONSORT, STROBE, PRISMA, and STARD guidelines.',
    canonicalPath: '/tools/report-generator',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.7,
    kind: 'tool'
  },
  {
    path: '/tools/sensitivity-analysis',
    title: 'Sensitivity Analysis Tool | KARMASTAT',
    description: 'Explore sensitivity of sample size, power, effect size, and dropout assumptions with interactive charts.',
    canonicalPath: '/tools/sensitivity-analysis',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.7,
    kind: 'tool'
  },
  {
    path: '/tools/checklists',
    title: 'Reporting Checklists | KARMASTAT',
    description: 'Interactive CONSORT, STROBE, PRISMA, and STARD reporting checklists with progress tracking.',
    canonicalPath: '/tools/checklists',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'monthly',
    priority: 0.7,
    kind: 'tool'
  },
  {
    path: '/references',
    title: 'Statistical References & Formulas | KARMASTAT',
    description: 'Reference library of textbooks, formulas, and reporting guidelines for medical statistics.',
    canonicalPath: '/references',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'yearly',
    priority: 0.6,
    kind: 'page'
  },
  {
    path: '/contact',
    title: 'Contact | KARMASTAT',
    description: 'Contact the KARMASTAT team for support, questions, or collaboration.',
    canonicalPath: '/contact',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'yearly',
    priority: 0.3,
    kind: 'page'
  },
  {
    path: '/support',
    title: 'Support KARMASTAT | KARMASTAT',
    description: 'Support KARMASTAT development and access ways to contribute.',
    canonicalPath: '/support',
    ogImage: DEFAULT_OG_IMAGE,
    changefreq: 'yearly',
    priority: 0.3,
    kind: 'page'
  },
  {
    path: '/test',
    title: 'KARMASTAT Test Page',
    description: 'Internal test route for KARMASTAT.',
    canonicalPath: '/test',
    ogImage: DEFAULT_OG_IMAGE,
    noindex: true,
    nofollow: true,
    includeInSitemap: false,
    kind: 'utility'
  },
  {
    path: '*',
    title: 'Page Not Found | KARMASTAT',
    description: 'The page you are looking for could not be found.',
    canonicalPath: null,
    ogImage: DEFAULT_OG_IMAGE,
    noindex: true,
    nofollow: true,
    includeInSitemap: false,
    kind: 'utility'
  }
];
