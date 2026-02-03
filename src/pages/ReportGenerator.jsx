import { useState } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons } from '../components/calculators';
import { exportToPDF } from '../utils/pdfExport';
import '../components/calculators/CalculatorForm.css';

const STUDY_TYPES = [
  { value: 'rct', label: 'Randomized Controlled Trial' },
  { value: 'cohort', label: 'Cohort Study' },
  { value: 'case-control', label: 'Case-Control Study' },
  { value: 'cross-sectional', label: 'Cross-Sectional Study' },
  { value: 'diagnostic', label: 'Diagnostic Accuracy Study' },
  { value: 'meta-analysis', label: 'Meta-Analysis' }
];

const CHECKLIST_GUIDELINES = {
  rct: 'CONSORT',
  cohort: 'STROBE (Cohort)',
  'case-control': 'STROBE (Case-Control)',
  'cross-sectional': 'STROBE (Cross-Sectional)',
  diagnostic: 'STARD',
  'meta-analysis': 'PRISMA'
};

export function ReportGenerator() {
  const [studyType, setStudyType] = useState('rct');
  const [studyTitle, setStudyTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [sampleSize, setSampleSize] = useState('');
  const [primaryOutcome, setPrimaryOutcome] = useState('');
  const [secondaryOutcomes, setSecondaryOutcomes] = useState('');
  const [effectSize, setEffectSize] = useState('');
  const [pValue, setPValue] = useState('');
  const [ciLower, setCiLower] = useState('');
  const [ciUpper, setCiUpper] = useState('');
  const [conclusions, setConclusions] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);

  const generateReport = () => {
    const guideline = CHECKLIST_GUIDELINES[studyType];

    const report = {
      studyType: `${STUDY_TYPES.find(s => s.value === studyType)?.label} (${guideline} Guidelines)`,
      type: 'statistical-report',
      method: 'Statistical Report Generation',
      inputs: {
        'Study Title': studyTitle || 'Untitled Study',
        'Authors': authors || 'Not specified',
        'Study Design': STUDY_TYPES.find(s => s.value === studyType)?.label,
        'Reporting Guideline': guideline,
        'Sample Size': sampleSize || 'Not specified',
        'Primary Outcome': primaryOutcome || 'Not specified'
      },
      formula: 'Structured reporting per ' + guideline + ' guidelines',
      formulaExplanation: 'Standardized statistical reporting format',
      steps: [
        { title: 'Study Design', calc: STUDY_TYPES.find(s => s.value === studyType)?.label },
        { title: 'Sample Size', calc: `N = ${sampleSize || 'TBD'}` },
        { title: 'Primary Outcome', calc: primaryOutcome || 'To be specified' },
        { title: 'Effect Estimate', calc: effectSize ? `Effect = ${effectSize} (95% CI: ${ciLower || '?'} to ${ciUpper || '?'})` : 'To be calculated' },
        { title: 'Statistical Significance', calc: pValue ? `p = ${pValue}` : 'To be determined' }
      ],
      results: {
        'Study Design': STUDY_TYPES.find(s => s.value === studyType)?.label,
        'Total N': sampleSize || 'TBD',
        'Effect Size': effectSize || 'TBD',
        'P-value': pValue || 'TBD',
        '95% CI': ciLower && ciUpper ? `[${ciLower}, ${ciUpper}]` : 'TBD'
      },
      interpretation: conclusions || 'Conclusions to be written based on the analysis results. Follow ' + guideline + ' guidelines for complete reporting.',
      recommendations: [
        `Follow ${guideline} checklist for complete reporting`,
        'Register study protocol (e.g., ClinicalTrials.gov, PROSPERO)',
        'Report all pre-specified outcomes',
        'Describe any deviations from protocol'
      ],
      reference: `${guideline} Statement: www.equator-network.org`
    };

    setGeneratedReport(report);
  };

  const handleExportReport = () => {
    if (generatedReport) {
      exportToPDF('light', generatedReport);
    }
  };

  const handleClear = () => {
    setStudyTitle('');
    setAuthors('');
    setSampleSize('');
    setPrimaryOutcome('');
    setSecondaryOutcomes('');
    setEffectSize('');
    setPValue('');
    setCiLower('');
    setCiUpper('');
    setConclusions('');
    setGeneratedReport(null);
  };

  return (
    <div className="calculator-page theme-teal">
      <CalculatorHeader
        title="Statistical Report Generator"
        description="Generate structured statistical reports following EQUATOR guidelines"
        icon="📝"
      />

      <main className="calculator-content">
        <div className="calculator-container">
          <div className="calculator-form-section">
            <div className="form-card">
              <h3 className="form-title">Study Information</h3>

              <div className="form-row">
                <FormSelect
                  label="Study Type"
                  value={studyType}
                  onChange={setStudyType}
                  options={STUDY_TYPES}
                  tooltip="Select your study design"
                />
              </div>

              <div className="form-group full-width">
                <label>Study Title</label>
                <input
                  type="text"
                  value={studyTitle}
                  onChange={(e) => setStudyTitle(e.target.value)}
                  placeholder="Enter study title"
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Authors</label>
                <input
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  placeholder="Author names"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <FormInput
                  label="Sample Size"
                  value={sampleSize}
                  onChange={setSampleSize}
                  type="number"
                  min="1"
                  tooltip="Total number of participants"
                />
              </div>

              <div className="form-group full-width">
                <label>Primary Outcome</label>
                <input
                  type="text"
                  value={primaryOutcome}
                  onChange={(e) => setPrimaryOutcome(e.target.value)}
                  placeholder="Describe primary outcome measure"
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Secondary Outcomes</label>
                <textarea
                  value={secondaryOutcomes}
                  onChange={(e) => setSecondaryOutcomes(e.target.value)}
                  placeholder="List secondary outcomes (one per line)"
                  className="form-input"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-title">Results</h3>

              <div className="form-row">
                <FormInput
                  label="Effect Size"
                  value={effectSize}
                  onChange={setEffectSize}
                  type="text"
                  tooltip="Main effect estimate (e.g., OR, RR, MD)"
                />
                <FormInput
                  label="P-value"
                  value={pValue}
                  onChange={setPValue}
                  type="text"
                  tooltip="Statistical significance"
                />
              </div>

              <div className="form-row">
                <FormInput
                  label="95% CI Lower"
                  value={ciLower}
                  onChange={setCiLower}
                  type="text"
                  tooltip="Lower bound of confidence interval"
                />
                <FormInput
                  label="95% CI Upper"
                  value={ciUpper}
                  onChange={setCiUpper}
                  type="text"
                  tooltip="Upper bound of confidence interval"
                />
              </div>

              <div className="form-group full-width">
                <label>Conclusions</label>
                <textarea
                  value={conclusions}
                  onChange={(e) => setConclusions(e.target.value)}
                  placeholder="Summary of main findings and conclusions"
                  className="form-input"
                  rows={4}
                />
              </div>

              <CalculatorButtons
                onCalculate={generateReport}
                onClear={handleClear}
                calculateLabel="Generate Report"
              />
            </div>
          </div>

          {generatedReport && (
            <div className="calculator-results-section">
              <div className="results-section">
                <div className="results-header">
                  <h3>Generated Report Preview</h3>
                  <button className="btn btn-export" onClick={handleExportReport}>
                    Export PDF
                  </button>
                </div>

                <div className="report-preview">
                  <h4>{generatedReport.inputs['Study Title']}</h4>
                  <p className="report-meta">
                    {generatedReport.inputs['Authors']} | {generatedReport.inputs['Study Design']}
                  </p>

                  <div className="report-section">
                    <h5>Methods</h5>
                    <p>Study Design: {generatedReport.inputs['Study Design']}</p>
                    <p>Sample Size: N = {generatedReport.results['Total N']}</p>
                    <p>Primary Outcome: {generatedReport.inputs['Primary Outcome']}</p>
                    <p>Reporting Guideline: {generatedReport.inputs['Reporting Guideline']}</p>
                  </div>

                  <div className="report-section">
                    <h5>Results</h5>
                    <p>Effect Size: {generatedReport.results['Effect Size']}</p>
                    <p>95% Confidence Interval: {generatedReport.results['95% CI']}</p>
                    <p>P-value: {generatedReport.results['P-value']}</p>
                  </div>

                  <div className="report-section">
                    <h5>Conclusions</h5>
                    <p>{generatedReport.interpretation}</p>
                  </div>

                  <div className="report-section recommendations-box">
                    <h5>Reporting Checklist ({CHECKLIST_GUIDELINES[studyType]})</h5>
                    <ul>
                      {generatedReport.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SimpleFooter />
      <ThemeToggle />

      <style>{`
        .report-preview {
          background: var(--bg-card);
          border-radius: var(--radius);
          padding: 2rem;
          border: 1px solid var(--border-color);
        }
        .report-preview h4 {
          color: var(--primary);
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .report-meta {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .report-section {
          margin-bottom: 1.5rem;
        }
        .report-section h5 {
          color: var(--primary);
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .report-section p {
          color: var(--text-secondary);
          margin: 0.25rem 0;
        }
        .recommendations-box {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: var(--radius);
        }
        .recommendations-box ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        .recommendations-box li {
          color: var(--text-secondary);
          margin: 0.25rem 0;
        }
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        textarea.form-input {
          resize: vertical;
          min-height: 80px;
        }
      `}</style>
    </div>
  );
}
