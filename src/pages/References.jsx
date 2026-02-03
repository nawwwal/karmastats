import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';

const REFERENCES = {
  textbooks: [
    {
      title: 'Statistical Power Analysis for the Behavioral Sciences',
      author: 'Cohen, J.',
      year: 1988,
      edition: '2nd ed.',
      publisher: 'Lawrence Erlbaum Associates',
      description: 'The definitive guide to effect sizes and power analysis.'
    },
    {
      title: 'Sample Sizes for Clinical, Laboratory and Epidemiology Studies',
      author: 'Machin D, Campbell MJ, Tan SB, Tan SH',
      year: 2018,
      edition: '4th ed.',
      publisher: 'Wiley-Blackwell',
      description: 'Comprehensive guide covering sample size calculations for clinical trials and epidemiological studies.'
    },
    {
      title: 'Sample Size Calculations in Clinical Research',
      author: 'Chow, S. C., Shao, J., Wang, H., Lokhnygina Y',
      year: 2017,
      edition: '3rd ed.',
      publisher: 'Chapman and Hall/CRC',
      description: 'Authoritative text on sample size calculation for various clinical trial designs.'
    },
    {
      title: 'Introduction to Meta-Analysis',
      author: 'Borenstein M, Hedges LV, Higgins JPT, Rothstein HR',
      year: 2021,
      edition: '2nd ed.',
      publisher: 'Wiley',
      description: 'Definitive guide to meta-analysis covering effect sizes, models, and power analysis.'
    },
    {
      title: 'Statistical Methods for Rates and Proportions',
      author: 'Fleiss JL, Levin B, Paik MC',
      year: 2003,
      edition: '3rd ed.',
      publisher: 'Wiley',
      description: 'Classic text covering statistical methods for categorical data including kappa statistics.'
    },
    {
      title: 'Cluster Randomised Trials',
      author: 'Hayes RJ, Moulton LH',
      year: 2017,
      edition: '2nd ed.',
      publisher: 'Chapman and Hall/CRC',
      description: 'Comprehensive guide to design, analysis, and sample size for cluster randomized trials.'
    },
    {
      title: 'Bayesian Adaptive Methods for Clinical Trials',
      author: 'Berry SM, Carlin BP, Lee JJ, Muller P',
      year: 2010,
      publisher: 'Chapman and Hall/CRC',
      description: 'Introduction to Bayesian approaches in clinical trials including adaptive designs.'
    },
    {
      title: 'Sampling Techniques',
      author: 'Cochran, W. G.',
      year: 1977,
      edition: '3rd ed.',
      publisher: 'John Wiley & Sons',
      description: 'Classic reference for survey sampling methodologies.'
    }
  ],
  formulas: [
    {
      name: 'Two-Sample T-Test Sample Size',
      formula: 'n = 2 × ((z₁₋α/₂ + z₁₋β)² × σ²) / δ²',
      description: 'Sample size per group for comparing two means.',
      variables: ['z = critical values', 'σ = standard deviation', 'δ = minimum detectable difference']
    },
    {
      name: 'Two-Sample Proportion (Chi-Square)',
      formula: 'n = [(zα√(2p̄q̄) + zβ√(p₁q₁ + p₂q₂))/(p₁ - p₂)]²',
      description: 'Sample size for comparing two proportions.',
      variables: ['p̄ = (p₁ + p₂)/2', 'q̄ = 1 - p̄']
    },
    {
      name: 'Power Analysis (Two-Sample T-Test)',
      formula: 'Power = Φ(|δ|√(n/2) - z₁₋α/₂)',
      description: 'Statistical power calculation for t-test.',
      variables: ['Φ = standard normal CDF', 'δ = standardized effect size']
    },
    {
      name: 'Effect Size Conversions',
      formula: "Cohen's d = (M₁ - M₂) / SD_pooled",
      description: 'Standardized effect size measure.',
      variables: ["Hedges' g = d × (1 - 3/(4(n₁+n₂)-9))", 'OR to d: d = ln(OR) × √3/π']
    },
    {
      name: 'Cluster RCT Design Effect',
      formula: 'DEFF = 1 + (m - 1) × ICC',
      description: 'Design effect for cluster randomized trials.',
      variables: ['DEFF = design effect', 'm = cluster size', 'ICC = intraclass correlation']
    },
    {
      name: "Cohen's Kappa Sample Size",
      formula: 'n = [zα√(2pₑ(1-pₑ)/(1-pₑ)²) + zβ√(2pₒ(1-pₒ)/(1-pₑ)²)]² / (κ₁-κ₀)²',
      description: 'Sample size for inter-rater agreement studies.',
      variables: ['κ = (pₒ - pₑ)/(1 - pₑ)', 'pₒ = observed agreement']
    },
    {
      name: 'Survival Analysis (Log-rank)',
      formula: 'D = 4 × (Zα + Zβ)² / (ln(HR))²',
      description: 'Number of events needed for survival analysis.',
      variables: ['D = Total events needed', 'HR = Hazard ratio to detect']
    },
    {
      name: 'Meta-Analysis Sample Size',
      formula: 'k = ((z_α/₂ + z_β)² × (τ² + σ²/n̄)) / δ²',
      description: 'Number of studies needed for random effects meta-analysis.',
      variables: ['k = number of studies', 'τ² = between-study variance']
    }
  ],
  guidelines: [
    {
      name: 'CONSORT',
      fullName: 'Consolidated Standards of Reporting Trials',
      description: 'Guidelines for reporting randomized controlled trials.',
      url: 'https://www.consort-statement.org/'
    },
    {
      name: 'STROBE',
      fullName: 'Strengthening the Reporting of Observational Studies in Epidemiology',
      description: 'Guidelines for reporting observational studies.',
      url: 'https://www.strobe-statement.org/'
    },
    {
      name: 'PRISMA',
      fullName: 'Preferred Reporting Items for Systematic Reviews and Meta-Analyses',
      description: 'Guidelines for reporting systematic reviews.',
      url: 'https://www.prisma-statement.org/'
    },
    {
      name: 'STARD',
      fullName: 'Standards for Reporting of Diagnostic Accuracy Studies',
      description: 'Guidelines for reporting diagnostic accuracy studies.',
      url: 'https://www.equator-network.org/reporting-guidelines/stard/'
    },
    {
      name: 'EQUATOR Network',
      fullName: 'Enhancing the QUAlity and Transparency Of health Research',
      description: 'Comprehensive library of reporting guidelines for health research.',
      url: 'https://www.equator-network.org/'
    },
    {
      name: 'ICH E9',
      fullName: 'Statistical Principles for Clinical Trials',
      description: 'Guidance on statistical aspects of clinical trials design and analysis.',
      url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/e9-statistical-principles-clinical-trials'
    }
  ],
  resources: {
    calculators: [
      {
        name: 'G*Power',
        description: 'Comprehensive power analysis software for various statistical tests. Free download.',
        url: 'https://www.psychologie.hhu.de/arbeitsgruppen/allgemeine-psychologie-und-arbeitspsychologie/gpower'
      },
      {
        name: 'PS: Power and Sample Size',
        description: 'Free software for power and sample size calculations from Vanderbilt University.',
        url: 'https://biostat.app.vumc.org/wiki/Main/PowerSampleSize'
      },
      {
        name: 'Sealed Envelope',
        description: 'Online sample size calculators for clinical trials with clear explanations.',
        url: 'https://www.sealedenvelope.com/power/'
      },
      {
        name: 'ClinCalc',
        description: 'Clinical calculators including sample size for comparison of means and proportions.',
        url: 'https://clincalc.com/stats/samplesize.aspx'
      }
    ],
    software: [
      {
        name: 'R Project',
        description: 'Free statistical computing software with extensive package ecosystem.',
        url: 'https://cran.r-project.org/'
      },
      {
        name: 'pwr Package (R)',
        description: 'R package for basic power analysis functions based on Cohen (1988).',
        url: 'https://cran.r-project.org/package=pwr'
      },
      {
        name: 'Stata Power Documentation',
        description: "Stata's comprehensive power and sample size documentation.",
        url: 'https://www.stata.com/features/power-and-sample-size/'
      },
      {
        name: 'PASS Software',
        description: 'Commercial software for power analysis and sample size calculation.',
        url: 'https://www.ncss.com/software/pass/'
      }
    ],
    learning: [
      {
        name: 'UCLA Statistical Consulting',
        description: 'Comprehensive statistical resources and tutorials.',
        url: 'https://stats.oarc.ucla.edu/'
      },
      {
        name: 'Cochrane Handbook',
        description: 'Official handbook for systematic reviews of interventions.',
        url: 'https://training.cochrane.org/handbook'
      },
      {
        name: 'BMJ Statistics Notes',
        description: 'Collection of short statistics tutorials from BMJ.',
        url: 'https://www.bmj.com/specialties/statistics-notes'
      }
    ]
  },
  glossary: [
    { term: 'Power (1-β)', definition: 'The probability of correctly rejecting a false null hypothesis. Typically set at 80% or 90%.' },
    { term: 'Type I Error (α)', definition: 'The probability of incorrectly rejecting a true null hypothesis. Typically set at 0.05 (5%).' },
    { term: 'Type II Error (β)', definition: 'The probability of failing to reject a false null hypothesis. Related to power as (1-β).' },
    { term: 'Effect Size', definition: 'A standardized measure of the magnitude of a phenomenon. Common measures include Cohen\'s d and odds ratio.' },
    { term: 'Cohen\'s d', definition: 'Standardized difference between two means: d = (μ₁ - μ₂) / σ. Small (0.2), medium (0.5), large (0.8).' },
    { term: 'Hedges\' g', definition: 'Bias-corrected version of Cohen\'s d, preferred for small sample sizes.' },
    { term: 'Confidence Interval (CI)', definition: 'A range of values that is likely to contain the true population parameter with a specified probability.' },
    { term: 'Design Effect (DEFF)', definition: 'The ratio of the variance under complex sampling to variance under simple random sampling. DEFF > 1 for cluster sampling.' },
    { term: 'ICC', definition: 'Intraclass Correlation Coefficient - measures correlation within clusters. Used in cluster randomized trials.' },
    { term: 'Cohen\'s Kappa (κ)', definition: 'Measure of inter-rater agreement for categorical variables, corrected for chance agreement.' },
    { term: 'I² Statistic', definition: 'Measure of heterogeneity in meta-analysis, representing percentage of variability due to true differences.' },
    { term: 'Non-inferiority Margin (δ)', definition: 'The largest difference that would still be considered clinically acceptable in non-inferiority trials.' },
    { term: 'Hazard Ratio (HR)', definition: 'The ratio of hazard rates between two groups in survival analysis. HR < 1 indicates lower risk in treatment group.' },
    { term: 'Sensitivity', definition: 'The proportion of true positives correctly identified by a diagnostic test (true positive rate).' },
    { term: 'Specificity', definition: 'The proportion of true negatives correctly identified by a diagnostic test (true negative rate).' }
  ]
};

export function References() {
  const [activeTab, setActiveTab] = useState('textbooks');

  return (
    <div className="references-page">
      <CalculatorHeader
        title="Statistical References"
        subtitle="Comprehensive reference library with textbooks, formulas, online resources, and glossary"
        navLinks={[{ to: '/', label: 'Back to Main' }]}
        themeClass="theme-gray"
      />

      <main className="container" style={{ padding: '2rem' }}>
        {/* Tab Navigation */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'textbooks' ? 'active' : ''}`}
            onClick={() => setActiveTab('textbooks')}
          >
            📚 Textbooks
          </button>
          <button
            className={`tab ${activeTab === 'formulas' ? 'active' : ''}`}
            onClick={() => setActiveTab('formulas')}
          >
            🔢 Formulas
          </button>
          <button
            className={`tab ${activeTab === 'guidelines' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidelines')}
          >
            📋 Guidelines
          </button>
          <button
            className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            🌐 Online Resources
          </button>
          <button
            className={`tab ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            📖 Glossary
          </button>
        </div>

        {/* Textbooks */}
        {activeTab === 'textbooks' && (
          <section className="references-section">
            <h2>Key Textbooks & References</h2>
            <div className="reference-grid">
              {REFERENCES.textbooks.map((book, index) => (
                <div key={index} className="reference-card">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author} ({book.year})</p>
                  {book.edition && <p className="edition">{book.edition}</p>}
                  <p className="publisher">{book.publisher}</p>
                  <p className="description">{book.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Formulas */}
        {activeTab === 'formulas' && (
          <section className="references-section">
            <h2>Key Formulas</h2>
            <div className="formula-cards">
              {REFERENCES.formulas.map((formula, index) => (
                <div key={index} className="card">
                  <h3>{formula.name}</h3>
                  <div className="formula-box">
                    <div className="formula-main">{formula.formula}</div>
                  </div>
                  <p className="formula-description">{formula.description}</p>
                  <ul className="formula-variables">
                    {formula.variables.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Guidelines */}
        {activeTab === 'guidelines' && (
          <section className="references-section">
            <h2>Reporting Guidelines</h2>
            <div className="guidelines-grid">
              {REFERENCES.guidelines.map((guide, index) => (
                <div key={index} className="guideline-card card">
                  <h3>{guide.name}</h3>
                  <p className="full-name">{guide.fullName}</p>
                  <p className="description">{guide.description}</p>
                  <a href={guide.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    Visit Website →
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Online Resources */}
        {activeTab === 'resources' && (
          <section className="references-section">
            <h2>Online Resources</h2>
            <p className="section-desc">Useful online tools, calculators, and documentation for validation and reference.</p>

            <h3 className="resource-category-title">Sample Size Calculators</h3>
            <div className="resources-grid">
              {REFERENCES.resources.calculators.map((resource, index) => (
                <div key={index} className="resource-card">
                  <h4>{resource.name}</h4>
                  <p>{resource.description}</p>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.url.replace('https://', '').replace('http://', '').split('/')[0]} ↗
                  </a>
                </div>
              ))}
            </div>

            <h3 className="resource-category-title">Statistical Software</h3>
            <div className="resources-grid">
              {REFERENCES.resources.software.map((resource, index) => (
                <div key={index} className="resource-card">
                  <h4>{resource.name}</h4>
                  <p>{resource.description}</p>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.url.replace('https://', '').replace('http://', '').split('/')[0]} ↗
                  </a>
                </div>
              ))}
            </div>

            <h3 className="resource-category-title">Learning Resources</h3>
            <div className="resources-grid">
              {REFERENCES.resources.learning.map((resource, index) => (
                <div key={index} className="resource-card">
                  <h4>{resource.name}</h4>
                  <p>{resource.description}</p>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.url.replace('https://', '').replace('http://', '').split('/')[0]} ↗
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Glossary */}
        {activeTab === 'glossary' && (
          <section className="references-section">
            <h2>Statistical Glossary</h2>
            <div className="glossary-list">
              {REFERENCES.glossary.map((item, index) => (
                <div key={index} className="glossary-item">
                  <dt>{item.term}</dt>
                  <dd>{item.definition}</dd>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <SimpleFooter />
      <ThemeToggle variant="floating" />

      <style>{`
        .references-section {
          margin-bottom: 2rem;
        }

        .references-section h2 {
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .section-desc {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .reference-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .reference-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--primary);
          transition: transform 0.2s ease;
        }

        .reference-card:hover {
          transform: translateX(4px);
        }

        .reference-card h3 {
          color: var(--primary);
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .reference-card .author {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .reference-card .edition,
        .reference-card .publisher {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .reference-card .description {
          margin-top: 0.75rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .formula-cards {
          display: grid;
          gap: 1.5rem;
        }

        .formula-cards .card h3 {
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .formula-description {
          margin: 1rem 0;
          color: var(--text-secondary);
        }

        .formula-variables {
          list-style: none;
          padding: 0;
        }

        .formula-variables li {
          padding: 0.25rem 0;
          padding-left: 1rem;
          position: relative;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .formula-variables li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--primary);
        }

        .guidelines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .guideline-card h3 {
          color: var(--primary);
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .guideline-card .full-name {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }

        .guideline-card .description {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        /* Online Resources Styles */
        .resource-category-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--primary);
          margin: 2rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-color);
        }

        .resource-category-title:first-of-type {
          margin-top: 0;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .resource-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .resource-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }

        .resource-card h4 {
          color: var(--primary);
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        .resource-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }

        .resource-card a {
          font-size: 0.85rem;
          color: var(--info, #0284C7);
          text-decoration: none;
          font-weight: 500;
        }

        .resource-card a:hover {
          text-decoration: underline;
        }

        .glossary-list {
          display: grid;
          gap: 1rem;
        }

        .glossary-item {
          background: var(--bg-card);
          border-radius: var(--radius);
          padding: 1.25rem;
          border: 1px solid var(--border-color);
        }

        .glossary-item dt {
          font-weight: 700;
          color: var(--primary);
          font-size: 1.05rem;
          margin-bottom: 0.5rem;
        }

        .glossary-item dd {
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default References;
