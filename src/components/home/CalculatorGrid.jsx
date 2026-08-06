import { Link } from 'react-router-dom';
import './CalculatorGrid.css';

// Calculator card data
const CORE_CALCULATORS = [
  {
    id: 'descriptive',
    title: 'Descriptive Studies',
    description: 'Cross-sectional surveys, prevalence studies, and population parameter estimation with precision calculations.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect x="3.5" y="13" width="4.4" height="9" rx="1.2" fill="rgba(255,255,255,0.95)" />
        <rect x="10.8" y="7.5" width="4.4" height="14.5" rx="1.2" fill="rgba(255,255,255,0.75)" />
        <rect x="18.1" y="10.5" width="4.4" height="11.5" rx="1.2" fill="rgba(255,255,255,0.95)" />
        <path d="M3.5 5.5 L10 9 L16 4.5 L22.5 7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="4.5" r="1.7" fill="white" />
      </svg>
    ),
    tags: ['Prevalence', 'CI Estimation', 'Surveys'],
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    url: '/calculator/descriptive'
  },
  {
    id: 'ttest',
    title: 'T-Test & Mean Comparisons',
    description: 'One-sample, two-sample, and paired t-tests with effect size and power calculations.',
    icon: '📈',
    tags: ['One-sample', 'Two-sample', 'Paired'],
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    url: '/calculator/ttest'
  },
  {
    id: 'comparative',
    title: 'Comparative Studies',
    description: 'Case-control and cohort studies for odds ratios, relative risk, and disease causation research.',
    icon: '⚖️',
    tags: ['Case-Control', 'Cohort', 'OR/RR'],
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    url: '/calculator/comparative'
  },
  {
    id: 'diagnostic',
    title: 'Diagnostic Accuracy',
    description: 'Sensitivity, specificity, ROC analysis, and predictive values for diagnostic test evaluation.',
    icon: '🩺',
    tags: ['Sensitivity', 'Specificity', 'ROC'],
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    url: '/calculator/diagnostic'
  },
  {
    id: 'clinical-trials',
    title: 'Clinical Trials',
    description: 'RCTs, superiority/non-inferiority designs, crossover trials, and adaptive methodologies.',
    icon: '🧪',
    tags: ['RCT', 'Non-inferiority', 'ICH E9'],
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    url: '/calculator/clinical-trials'
  },
  {
    id: 'survival',
    title: 'Survival Analysis',
    description: 'Time-to-event studies, Kaplan-Meier, Cox regression, and hazard ratio calculations.',
    icon: '💓',
    tags: ['Kaplan-Meier', 'Cox', 'Log-rank'],
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    url: '/calculator/survival'
  }
];

const ADVANCED_CALCULATORS = [
  {
    id: 'power-analysis',
    title: 'Power Analysis',
    description: 'Reverse calculations to find statistical power given sample size for study evaluation.',
    icon: '⚡',
    tags: ['T-Test Power', 'ANOVA', 'Power Curves'],
    gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
    url: '/calculator/power-analysis'
  },
  {
    id: 'effect-size',
    title: 'Effect Size Calculator',
    description: "Convert between Cohen's d, Hedges' g, odds ratios, and correlation coefficients.",
    icon: '📏',
    tags: ["Cohen's d", "Hedges' g", 'OR/RR'],
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    url: '/calculator/effect-size'
  },
  {
    id: 'meta-analysis',
    title: 'Meta-Analysis',
    description: 'Sample sizes for systematic reviews with fixed/random effects and heterogeneity.',
    icon: '📚',
    tags: ['Fixed Effects', 'Random Effects', 'I²'],
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    url: '/calculator/meta-analysis'
  },
  {
    id: 'cluster-multilevel',
    title: 'Cluster & Multi-level',
    description: 'Cluster RCTs, stepped-wedge designs, and ICC-adjusted sample size calculations.',
    icon: '🔗',
    tags: ['Cluster RCT', 'Stepped Wedge', 'ICC'],
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    url: '/calculator/cluster-multilevel'
  },
  {
    id: 'bayesian',
    title: 'Bayesian Sample Size',
    description: 'APVC, Bayes Factor targets, HPD width, and assurance-based calculations.',
    icon: '🎲',
    tags: ['APVC', 'Bayes Factor', 'Assurance'],
    gradient: 'linear-gradient(135deg, #F43F5E, #E11D48)',
    url: '/calculator/bayesian'
  },
  {
    id: 'agreement',
    title: 'Agreement Studies',
    description: "Kappa, ICC, Bland-Altman, and Lin's CCC for inter-rater reliability studies.",
    icon: '🤝',
    tags: ['Kappa', 'ICC', 'Bland-Altman'],
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    url: '/calculator/agreement'
  }
];

const TOOLS = [
  {
    id: 'descriptive-stats',
    title: 'Descriptive Stats & Normality',
    description: 'Upload an Excel/CSV sheet: normality assessment first (Shapiro–Wilk), then descriptives, charts, the right test, and R/Python code.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <path d="M2.5 21.5 C8 21.5 8.5 5.5 13 5.5 C17.5 5.5 18 21.5 23.5 21.5"
          stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        <line x1="13" y1="9.5" x2="13" y2="21" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeDasharray="2.5 2.5" strokeLinecap="round" />
        <circle cx="7.8" cy="16.4" r="1.4" fill="rgba(255,255,255,0.85)" />
        <circle cx="18.2" cy="16.4" r="1.4" fill="rgba(255,255,255,0.85)" />
      </svg>
    ),
    tags: ['Excel/CSV', 'Shapiro–Wilk', 'Q–Q + Export'],
    gradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
    url: '/tools/descriptive-stats'
  },
  {
    id: 'report-generator',
    title: 'Report Generator',
    description: 'Generate publication-ready methodology text with PDF, Word, and LaTeX export.',
    icon: '📄',
    tags: ['PDF', 'Word', 'LaTeX'],
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    url: '/tools/report-generator'
  },
  {
    id: 'sensitivity-analysis',
    title: 'Sensitivity Analysis',
    description: 'Interactive parameter exploration with real-time visualizations and power curves.',
    icon: '🎚️',
    tags: ['Sliders', 'Charts', 'Scenarios'],
    gradient: 'linear-gradient(135deg, #FB923C, #F97316)',
    url: '/tools/sensitivity-analysis'
  },
  {
    id: 'checklists',
    title: 'Reporting Checklists',
    description: 'CONSORT, STROBE, PRISMA, and STARD interactive checklists with progress tracking.',
    icon: '✅',
    tags: ['CONSORT', 'STROBE', 'PRISMA'],
    gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    url: '/tools/checklists'
  },
  {
    id: 'references',
    title: 'Statistical References',
    description: 'Comprehensive reference library with textbooks, formulas, papers, and glossary.',
    icon: '📖',
    tags: ['Textbooks', 'Formulas', 'Glossary'],
    gradient: 'linear-gradient(135deg, #64748B, #475569)',
    url: '/references'
  }
];

function CalculatorCard({ calc }) {
  return (
    <Link
      to={calc.url}
      className="calc-card fade-in-up"
      style={{ '--card-accent': calc.gradient }}
    >
      <div className="calc-content">
        <div className="calc-icon" style={{ background: calc.gradient }}>
          {calc.icon}
        </div>
        <h3 className="calc-title">{calc.title}</h3>
        <p className="calc-desc">{calc.description}</p>
        <div className="calc-tags">
          {calc.tags.map((tag, i) => (
            <span key={i} className="calc-tag">{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function CalculatorGrid() {
  return (
    <>
      {/* Core Calculators */}
      <section className="section">
        <div className="section-header">
          <h2>Core Sample Size Calculators</h2>
          <p>Essential tools for clinical and epidemiological research design</p>
        </div>
        <div className="calc-grid">
          {CORE_CALCULATORS.map(calc => (
            <CalculatorCard key={calc.id} calc={calc} />
          ))}
        </div>
      </section>

      {/* Advanced Calculators */}
      <section className="section">
        <div className="section-header">
          <h2>Advanced Statistical Calculators</h2>
          <p>Specialized tools for power analysis, meta-analysis, and complex study designs</p>
        </div>
        <div className="calc-grid">
          {ADVANCED_CALCULATORS.map(calc => (
            <CalculatorCard key={calc.id} calc={calc} />
          ))}
        </div>
      </section>

      {/* Tools & Resources */}
      <section className="section">
        <div className="section-header">
          <h2>Tools & Resources</h2>
          <p>Reporting tools, sensitivity analysis, and reference materials</p>
        </div>
        <div className="calc-grid">
          {TOOLS.map(calc => (
            <CalculatorCard key={calc.id} calc={calc} />
          ))}
        </div>
      </section>
    </>
  );
}

export default CalculatorGrid;
