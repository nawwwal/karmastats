import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import '../components/calculators/CalculatorForm.css';

const CHECKLISTS = {
  consort: {
    name: 'CONSORT',
    fullName: 'Consolidated Standards of Reporting Trials',
    description: 'For randomized controlled trials',
    url: 'https://www.consort-statement.org/checklists/view/32--consort-2010/66-title',
    sections: [
      {
        title: 'Title and Abstract',
        items: [
          'Identification as a randomised trial in the title',
          'Structured summary of trial design, methods, results, and conclusions'
        ]
      },
      {
        title: 'Introduction',
        items: [
          'Scientific background and explanation of rationale',
          'Specific objectives or hypotheses'
        ]
      },
      {
        title: 'Methods - Trial Design',
        items: [
          'Description of trial design (parallel, factorial) including allocation ratio',
          'Important changes to methods after trial commencement with reasons'
        ]
      },
      {
        title: 'Methods - Participants',
        items: [
          'Eligibility criteria for participants',
          'Settings and locations where data were collected'
        ]
      },
      {
        title: 'Methods - Interventions',
        items: [
          'Interventions for each group with sufficient details to allow replication',
          'How and when they were actually administered'
        ]
      },
      {
        title: 'Methods - Outcomes',
        items: [
          'Completely defined pre-specified primary and secondary outcome measures',
          'Any changes to trial outcomes after the trial commenced with reasons'
        ]
      },
      {
        title: 'Methods - Sample Size',
        items: [
          'How sample size was determined',
          'When applicable, explanation of any interim analyses and stopping guidelines'
        ]
      },
      {
        title: 'Methods - Randomisation',
        items: [
          'Method used to generate random allocation sequence',
          'Type of randomisation; details of any restriction',
          'Mechanism used to implement random allocation sequence',
          'Who generated sequence, who enrolled, who assigned participants'
        ]
      },
      {
        title: 'Methods - Blinding',
        items: [
          'If done, who was blinded after assignment to interventions',
          'Description of the similarity of interventions'
        ]
      },
      {
        title: 'Methods - Statistical Methods',
        items: [
          'Statistical methods used to compare groups for primary and secondary outcomes',
          'Methods for additional analyses, such as subgroup and adjusted analyses'
        ]
      },
      {
        title: 'Results - Participant Flow',
        items: [
          'For each group, numbers of participants randomly assigned, received intended treatment, and analysed',
          'For each group, losses and exclusions after randomisation with reasons'
        ]
      },
      {
        title: 'Results - Baseline Data',
        items: [
          'A table showing baseline demographic and clinical characteristics for each group'
        ]
      },
      {
        title: 'Results - Outcomes and Estimation',
        items: [
          'For each primary and secondary outcome, results for each group and estimated effect size with confidence interval',
          'For binary outcomes, presentation of both absolute and relative effect sizes is recommended'
        ]
      },
      {
        title: 'Discussion',
        items: [
          'Trial limitations, addressing sources of potential bias, imprecision',
          'Generalisability of the trial findings',
          'Interpretation consistent with results, balancing benefits and harms'
        ]
      },
      {
        title: 'Other Information',
        items: [
          'Registration number and name of trial registry',
          'Where the full trial protocol can be accessed',
          'Sources of funding and other support'
        ]
      }
    ]
  },
  strobe: {
    name: 'STROBE',
    fullName: 'Strengthening the Reporting of Observational Studies in Epidemiology',
    description: 'For cohort, case-control, and cross-sectional studies',
    url: 'https://www.strobe-statement.org/checklists/',
    sections: [
      {
        title: 'Title and Abstract',
        items: [
          'Indicate the study\'s design with a commonly used term in title or abstract',
          'Provide an informative and balanced summary of what was done and found'
        ]
      },
      {
        title: 'Introduction',
        items: [
          'Explain the scientific background and rationale for the investigation',
          'State specific objectives, including any prespecified hypotheses'
        ]
      },
      {
        title: 'Methods - Study Design',
        items: [
          'Present key elements of study design early in the paper',
          'Describe the setting, locations, and relevant dates'
        ]
      },
      {
        title: 'Methods - Participants',
        items: [
          'Give eligibility criteria, sources and methods of selection',
          'For matched studies, give matching criteria and number of exposed/unexposed'
        ]
      },
      {
        title: 'Methods - Variables',
        items: [
          'Clearly define all outcomes, exposures, predictors, confounders, effect modifiers',
          'Give diagnostic criteria, if applicable'
        ]
      },
      {
        title: 'Methods - Data Sources/Measurement',
        items: [
          'Give sources of data and details of assessment methods',
          'Describe comparability of assessment methods if there is more than one group'
        ]
      },
      {
        title: 'Methods - Bias',
        items: [
          'Describe any efforts to address potential sources of bias'
        ]
      },
      {
        title: 'Methods - Study Size',
        items: [
          'Explain how the study size was arrived at'
        ]
      },
      {
        title: 'Methods - Statistical Methods',
        items: [
          'Describe all statistical methods, including those for confounding',
          'Describe any methods used to examine subgroups and interactions',
          'Explain how missing data were addressed',
          'Describe any sensitivity analyses'
        ]
      },
      {
        title: 'Results',
        items: [
          'Report numbers at each stage of study (flow diagram recommended)',
          'Give characteristics of study participants',
          'Report numbers of outcome events or summary measures',
          'Give unadjusted estimates and, if applicable, confounder-adjusted estimates with confidence intervals'
        ]
      },
      {
        title: 'Discussion',
        items: [
          'Summarise key results with reference to study objectives',
          'Discuss limitations, including sources of bias/imprecision',
          'Give a cautious overall interpretation considering objectives, limitations, multiplicity'
        ]
      }
    ]
  },
  prisma: {
    name: 'PRISMA',
    fullName: 'Preferred Reporting Items for Systematic Reviews and Meta-Analyses',
    description: 'For systematic reviews and meta-analyses',
    url: 'http://www.prisma-statement.org/PRISMAStatement/Checklist',
    sections: [
      {
        title: 'Title',
        items: [
          'Identify the report as a systematic review, meta-analysis, or both'
        ]
      },
      {
        title: 'Abstract',
        items: [
          'Provide a structured summary including background, objectives, methods, results, conclusions'
        ]
      },
      {
        title: 'Introduction',
        items: [
          'Describe the rationale for the review',
          'Provide an explicit statement of questions being addressed'
        ]
      },
      {
        title: 'Methods - Protocol',
        items: [
          'Indicate if a review protocol exists, where it can be accessed',
          'Specify eligibility criteria',
          'Describe all information sources with dates of coverage'
        ]
      },
      {
        title: 'Methods - Search and Selection',
        items: [
          'Present full electronic search strategy for at least one database',
          'State process for selecting studies (screening, eligibility, inclusion)'
        ]
      },
      {
        title: 'Methods - Data Items',
        items: [
          'List and define all variables for which data were sought',
          'Describe methods of data collection and any data assumptions'
        ]
      },
      {
        title: 'Methods - Risk of Bias',
        items: [
          'Describe methods used for assessing risk of bias in individual studies',
          'State how this information was used in any data synthesis'
        ]
      },
      {
        title: 'Methods - Synthesis',
        items: [
          'State the principal summary measures (risk ratio, difference in means)',
          'Describe methods of handling data and combining results',
          'Describe any methods for assessing heterogeneity'
        ]
      },
      {
        title: 'Results',
        items: [
          'Give numbers of studies screened, assessed, and included (flow diagram)',
          'Present characteristics of each study',
          'Present data on risk of bias for each study',
          'Present results of individual studies and syntheses',
          'Present results of any assessment of publication bias'
        ]
      },
      {
        title: 'Discussion',
        items: [
          'Summarize the main findings including strength of evidence',
          'Discuss limitations at study and outcome level',
          'Provide a general interpretation of results and implications'
        ]
      },
      {
        title: 'Funding',
        items: [
          'Describe sources of funding for the systematic review'
        ]
      }
    ]
  },
  stard: {
    name: 'STARD',
    fullName: 'Standards for Reporting of Diagnostic Accuracy Studies',
    description: 'For diagnostic accuracy studies',
    url: 'https://www.equator-network.org/reporting-guidelines/stard/',
    sections: [
      {
        title: 'Title and Abstract',
        items: [
          'Identification as a study of diagnostic accuracy using at least one measure',
          'Structured abstract with study design, methods, results, conclusions'
        ]
      },
      {
        title: 'Introduction',
        items: [
          'Scientific and clinical background, including intended use of index test',
          'Study objectives and hypotheses'
        ]
      },
      {
        title: 'Methods - Study Design',
        items: [
          'Whether data collection was planned before (prospective) or after (retrospective) index test and reference standard',
          'Eligibility criteria, setting and locations'
        ]
      },
      {
        title: 'Methods - Test Methods',
        items: [
          'Index test, in sufficient detail to allow replication',
          'Reference standard, in sufficient detail to allow replication',
          'Definition and rationale for test positivity cut-offs or result categories'
        ]
      },
      {
        title: 'Methods - Analysis',
        items: [
          'Methods for estimating diagnostic accuracy measures',
          'How indeterminate index test or reference standard results were handled',
          'How missing data on the index test and reference standard were handled',
          'Any analyses of variability in diagnostic accuracy'
        ]
      },
      {
        title: 'Results',
        items: [
          'Flow of participants (diagram recommended)',
          'Baseline demographic and clinical characteristics',
          '2x2 cross tabulation of the index test results by reference standard results',
          'Estimates of diagnostic accuracy and their precision (95% CI)',
          'Any adverse events from performing the index test or reference standard'
        ]
      },
      {
        title: 'Discussion',
        items: [
          'Study limitations including sources of potential bias and statistical uncertainty',
          'Implications for practice, including the intended use of the index test'
        ]
      }
    ]
  }
};

export function Checklists() {
  const [selectedChecklist, setSelectedChecklist] = useState('consort');
  const [checkedItems, setCheckedItems] = useState({});

  const checklist = CHECKLISTS[selectedChecklist];

  const handleCheckItem = (sectionIndex, itemIndex) => {
    const key = `${selectedChecklist}-${sectionIndex}-${itemIndex}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getTotalItems = () => {
    return checklist.sections.reduce((sum, section) => sum + section.items.length, 0);
  };

  const getCheckedCount = () => {
    return checklist.sections.reduce((sum, section, sIndex) => {
      return sum + section.items.filter((_, iIndex) =>
        checkedItems[`${selectedChecklist}-${sIndex}-${iIndex}`]
      ).length;
    }, 0);
  };

  const progress = getTotalItems() > 0 ? (getCheckedCount() / getTotalItems()) * 100 : 0;

  const resetChecklist = () => {
    const newChecked = { ...checkedItems };
    checklist.sections.forEach((section, sIndex) => {
      section.items.forEach((_, iIndex) => {
        delete newChecked[`${selectedChecklist}-${sIndex}-${iIndex}`];
      });
    });
    setCheckedItems(newChecked);
  };

  return (
    <div className="calculator-page theme-green">
      <CalculatorHeader
        title="Reporting Checklists"
        description="Interactive EQUATOR Network reporting checklists for different study designs"
        icon="✅"
      />

      <main className="calculator-content">
        <div className="calculator-container">
          <div className="calculator-form-section">
            <div className="form-card checklist-selector">
              <h3 className="form-title">Select Checklist</h3>

              <div className="checklist-tabs">
                {Object.entries(CHECKLISTS).map(([key, cl]) => (
                  <button
                    key={key}
                    className={`checklist-tab ${selectedChecklist === key ? 'active' : ''}`}
                    onClick={() => setSelectedChecklist(key)}
                  >
                    <span className="tab-name">{cl.name}</span>
                    <span className="tab-desc">{cl.description}</span>
                  </button>
                ))}
              </div>

              <div className="checklist-info">
                <h4>{checklist.fullName}</h4>
                <p>{checklist.description}</p>
                <a href={checklist.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  View Official Checklist
                </a>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{getCheckedCount()} / {getTotalItems()} items</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <button className="btn btn-outline" onClick={resetChecklist}>Reset Checklist</button>
              </div>
            </div>
          </div>

          <div className="calculator-results-section checklist-content">
            <div className="results-section">
              <h3>{checklist.name} Checklist</h3>

              {checklist.sections.map((section, sIndex) => (
                <div key={sIndex} className="checklist-section">
                  <h4 className="section-title">{section.title}</h4>
                  <ul className="checklist-items">
                    {section.items.map((item, iIndex) => {
                      const key = `${selectedChecklist}-${sIndex}-${iIndex}`;
                      const isChecked = checkedItems[key];
                      return (
                        <li
                          key={iIndex}
                          className={`checklist-item ${isChecked ? 'checked' : ''}`}
                          onClick={() => handleCheckItem(sIndex, iIndex)}
                        >
                          <span className="checkbox">
                            {isChecked ? '✓' : ''}
                          </span>
                          <span className="item-text">{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter />
      <ThemeToggle />

      <style>{`
        .checklist-tabs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .checklist-tab {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 2px solid transparent;
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .checklist-tab:hover {
          border-color: var(--primary);
        }
        .checklist-tab.active {
          background: var(--primary);
          color: white;
        }
        .tab-name {
          font-weight: 600;
          font-size: 1.1rem;
        }
        .tab-desc {
          font-size: 0.85rem;
          opacity: 0.8;
        }
        .checklist-info {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: var(--radius);
          margin-bottom: 1.5rem;
        }
        .checklist-info h4 {
          color: var(--primary);
          margin-bottom: 0.5rem;
        }
        .checklist-info p {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        .progress-section {
          margin-top: 1rem;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .progress-bar {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.3s;
        }
        .checklist-content {
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }
        .checklist-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .section-title {
          color: var(--primary);
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
        }
        .checklist-items {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .checklist-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          cursor: pointer;
          border-radius: var(--radius);
          transition: background 0.2s;
        }
        .checklist-item:hover {
          background: var(--bg-secondary);
        }
        .checklist-item.checked {
          opacity: 0.7;
        }
        .checklist-item.checked .item-text {
          text-decoration: line-through;
        }
        .checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--primary);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--primary);
          font-weight: bold;
        }
        .checklist-item.checked .checkbox {
          background: var(--primary);
          color: white;
        }
        .item-text {
          color: var(--text-primary);
          line-height: 1.5;
        }
        .btn-outline {
          background: transparent;
          border: 2px solid var(--primary);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
}
