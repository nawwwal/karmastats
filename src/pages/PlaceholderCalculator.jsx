import { Link, useParams, useLocation } from 'react-router-dom';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';

// Calculator configurations
const CALCULATOR_CONFIG = {
  'ttest': {
    title: 'T-Test & Mean Comparisons',
    subtitle: 'One-sample, two-sample, and paired t-tests with effect size and power calculations.',
    themeClass: 'theme-blue',
    icon: '📈'
  },
  'comparative': {
    title: 'Comparative Studies',
    subtitle: 'Case-control and cohort studies for odds ratios, relative risk, and disease causation research.',
    themeClass: 'theme-purple',
    icon: '⚖️'
  },
  'diagnostic': {
    title: 'Diagnostic Accuracy',
    subtitle: 'Sensitivity, specificity, ROC analysis, and predictive values for diagnostic test evaluation.',
    themeClass: 'theme-pink',
    icon: '🩺'
  },
  'clinical-trials': {
    title: 'Clinical Trials',
    subtitle: 'RCTs, superiority/non-inferiority designs, crossover trials, and adaptive methodologies.',
    themeClass: 'theme-amber',
    icon: '🧪'
  },
  'survival': {
    title: 'Survival Analysis',
    subtitle: 'Time-to-event studies, Kaplan-Meier, Cox regression, and hazard ratio calculations.',
    themeClass: 'theme-red',
    icon: '💓'
  },
  'power-analysis': {
    title: 'Power Analysis',
    subtitle: 'Reverse calculations to find statistical power given sample size for study evaluation.',
    themeClass: 'theme-purple',
    icon: '⚡'
  },
  'effect-size': {
    title: 'Effect Size Calculator',
    subtitle: "Convert between Cohen's d, Hedges' g, odds ratios, and correlation coefficients.",
    themeClass: 'theme-teal',
    icon: '📏'
  },
  'meta-analysis': {
    title: 'Meta-Analysis',
    subtitle: 'Sample sizes for systematic reviews with fixed/random effects and heterogeneity.',
    themeClass: 'theme-indigo',
    icon: '📚'
  },
  'cluster-multilevel': {
    title: 'Cluster & Multi-level',
    subtitle: 'Cluster RCTs, stepped-wedge designs, and ICC-adjusted sample size calculations.',
    themeClass: 'theme-orange',
    icon: '🔗'
  },
  'bayesian': {
    title: 'Bayesian Sample Size',
    subtitle: 'APVC, Bayes Factor targets, HPD width, and assurance-based calculations.',
    themeClass: 'theme-rose',
    icon: '🎲'
  },
  'agreement': {
    title: 'Agreement Studies',
    subtitle: "Kappa, ICC, Bland-Altman, and Lin's CCC for inter-rater reliability studies.",
    themeClass: 'theme-cyan',
    icon: '🤝'
  }
};

const TOOLS_CONFIG = {
  'report-generator': {
    title: 'Report Generator',
    subtitle: 'Generate publication-ready methodology text with PDF, Word, and LaTeX export.',
    themeClass: 'theme-green',
    icon: '📄'
  },
  'sensitivity-analysis': {
    title: 'Sensitivity Analysis',
    subtitle: 'Interactive parameter exploration with real-time visualizations and power curves.',
    themeClass: 'theme-orange',
    icon: '🎚️'
  },
  'checklists': {
    title: 'Reporting Checklists',
    subtitle: 'CONSORT, STROBE, PRISMA, and STARD interactive checklists with progress tracking.',
    themeClass: 'theme-blue',
    icon: '✅'
  }
};

export function PlaceholderCalculator() {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const type = pathParts[pathParts.length - 1];
  const isCalculator = pathParts.includes('calculator');

  const config = isCalculator ? CALCULATOR_CONFIG[type] : TOOLS_CONFIG[type];

  if (!config) {
    return (
      <div className="not-found">
        <h1>Page Not Found</h1>
        <Link to="/">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className={`calculator-page ${config.themeClass}`}>
      <CalculatorHeader
        title={config.title}
        subtitle={config.subtitle}
        navLinks={[
          { to: '/', label: 'Back to Main' },
          { to: '/references', label: 'References' }
        ]}
        themeClass={config.themeClass}
      />

      <main className="container" style={{ padding: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{config.icon}</div>
          <h2 style={{ marginBottom: '1rem' }}>{config.title}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem' }}>
            This calculator is being prepared. Full functionality coming soon!
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
            <Link to="/calculator/descriptive" className="btn btn-secondary">
              Try Descriptive Calculator
            </Link>
          </div>

          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Coming Features:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                Multiple calculation types with step-by-step solutions
              </li>
              <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                Professional PDF export with light/dark themes
              </li>
              <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                Detailed interpretations and recommendations
              </li>
              <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                Statistical references and citations
              </li>
            </ul>
          </div>
        </div>
      </main>

      <SimpleFooter />
      <ThemeToggle variant="floating" />
    </div>
  );
}

export default PlaceholderCalculator;
