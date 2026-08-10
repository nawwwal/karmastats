export const SITE_URL = 'https://www.karmastat.in';

export const routesMeta = [
  {
    path: '/',
    title: 'KARMASTAT 2.0 | Medical Sample Size Calculators',
    description: 'Medical sample size calculators, power analysis, and reporting tools for clinical and epidemiological research.'
  },
  {
    path: '/calculator/descriptive',
    title: 'Descriptive Studies Sample Size Calculator | KARMASTAT',
    description: 'Calculate sample size for prevalence, mean estimation, and finite population studies.'
  },
  {
    path: '/calculator/ttest',
    title: 'T-Test and Mean Comparison Calculator | KARMASTAT',
    description: 'Plan one-sample, two-sample, and paired t-test studies with effect size, variance, and power inputs.'
  },
  {
    path: '/calculator/comparative',
    title: 'Comparative Study Sample Size Calculator | KARMASTAT',
    description: 'Compute sample size for case-control and cohort studies using odds ratios, relative risk, and exposure assumptions.'
  },
  {
    path: '/calculator/diagnostic',
    title: 'Diagnostic Accuracy Sample Size Calculator | KARMASTAT',
    description: 'Estimate sample size for diagnostic accuracy studies using sensitivity, specificity, and ROC analysis.'
  },
  {
    path: '/calculator/clinical-trials',
    title: 'Clinical Trials Sample Size Calculator | KARMASTAT',
    description: 'Design superiority, non-inferiority, and equivalence clinical trials with sample size calculations.'
  },
  {
    path: '/calculator/survival',
    title: 'Survival Analysis Sample Size Calculator | KARMASTAT',
    description: 'Calculate sample size for survival analysis using log-rank tests, hazard ratios, and time-to-event assumptions.'
  },
  {
    path: '/calculator/power-analysis',
    title: 'Statistical Power Analysis Calculator | KARMASTAT',
    description: 'Compute statistical power from sample size and effect size, and explore power curves for study planning.'
  },
  {
    path: '/calculator/effect-size',
    title: 'Effect Size Conversion Calculator | KARMASTAT',
    description: "Calculate and convert Cohen's d, Hedges' g, odds ratios, correlations, and other effect sizes."
  },
  {
    path: '/calculator/meta-analysis',
    title: 'Meta-Analysis Sample Size Calculator | KARMASTAT',
    description: 'Plan meta-analysis study counts with fixed or random effects models and heterogeneity inputs.'
  },
  {
    path: '/calculator/cluster-multilevel',
    title: 'Cluster and Multilevel Sample Size Calculator | KARMASTAT',
    description: 'Design cluster randomized trials with ICC inputs and design effect adjustments for multilevel studies.'
  },
  {
    path: '/calculator/bayesian',
    title: 'Bayesian Sample Size Calculator | KARMASTAT',
    description: 'Plan Bayesian sample sizes using assurance targets, Bayes factors, and HPD width requirements.'
  },
  {
    path: '/calculator/agreement',
    title: 'Agreement Studies Sample Size Calculator | KARMASTAT',
    description: "Plan agreement studies using kappa, ICC, Bland-Altman, and Lin's CCC methods."
  },
  {
    path: '/tools/report-generator',
    title: 'Statistical Report Generator | KARMASTAT',
    description: 'Generate structured statistical reports aligned with CONSORT, STROBE, PRISMA, and STARD guidelines.'
  },
  {
    path: '/tools/sensitivity-analysis',
    title: 'Sample Size Sensitivity Analysis Tool | KARMASTAT',
    description: 'Explore how sample size, power, effect size, and dropout assumptions change with interactive charts.'
  },
  {
    path: '/tools/checklists',
    title: 'Medical Research Reporting Checklists | KARMASTAT',
    description: 'Use interactive CONSORT, STROBE, PRISMA, and STARD reporting checklists with progress tracking.'
  },
  {
    path: '/tools/descriptive-stats',
    title: 'Descriptive Statistics and Normality Tool | KARMASTAT',
    description: 'Analyze CSV and Excel data for normality, descriptive statistics, charts, and suitable statistical tests.'
  },
  {
    path: '/references',
    title: 'Statistical References and Formulas | KARMASTAT',
    description: 'Browse textbooks, formulas, and reporting guidelines used by KARMASTAT medical statistics tools.'
  },
  {
    path: '/contact',
    title: 'Contact KARMASTAT',
    description: 'Contact the KARMASTAT team for support, questions, or collaboration.'
  },
  {
    path: '/support',
    title: 'Support KARMASTAT Development',
    description: 'Support the continued development and maintenance of free KARMASTAT research tools.'
  },
  {
    path: '/test',
    title: 'KARMASTAT Test Page',
    description: 'Internal KARMASTAT test route.',
    noindex: true,
    includeInSitemap: false
  },
  {
    path: '*',
    title: 'Page Not Found | KARMASTAT',
    description: 'The requested KARMASTAT page could not be found.',
    noindex: true,
    includeInSitemap: false
  }
].map((route) => ({
  ...route,
  canonicalPath: route.path === '*' ? null : route.path
}));

export function getRouteMeta(pathname) {
  return routesMeta.find((route) => route.path === pathname)
    ?? routesMeta.find((route) => route.path === '*');
}
