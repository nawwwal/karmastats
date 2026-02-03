import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import {
  FormInput,
  FormSelect,
  CalculatorButtons,
  ResultsSection,
  ResultGrid,
  ResultCard,
  FormulaSection,
  StepsSection,
  InterpretationBox,
  RecommendationsSection,
  ReferenceSection,
  ExportModal
} from '../components/calculators';
import { useCalculator } from '../hooks/useCalculator';
import { calculateCaseControl, calculateCohort, calculateCrossSectional } from '../calculators/comparative';
import { exportToPDF, copyToClipboard } from '../utils/pdfExport';
import '../components/calculators/CalculatorForm.css';

const ALPHA_OPTIONS = [
  { value: '0.05', label: '0.05 (5%)' },
  { value: '0.01', label: '0.01 (1%)' },
  { value: '0.10', label: '0.10 (10%)' }
];

const POWER_OPTIONS = [
  { value: '0.80', label: '80%' },
  { value: '0.90', label: '90%' },
  { value: '0.95', label: '95%' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/ttest', label: 'T-Test' },
  { to: '/references', label: 'References' }
];

export function ComparativeCalculator() {
  const [activeTab, setActiveTab] = useState('case-control');
  const [showExportModal, setShowExportModal] = useState(false);

  // Case-Control form state
  const caseControlCalc = useCalculator({
    p0: 0.20,
    or: 2.0,
    alpha: 0.05,
    power: 0.80,
    ratio: 1
  });

  // Cohort form state
  const cohortCalc = useCalculator({
    p0: 0.10,
    rr: 2.0,
    alpha: 0.05,
    power: 0.80,
    ratio: 1
  });

  // Cross-sectional form state
  const crossSectionalCalc = useCalculator({
    p1: 0.30,
    p2: 0.20,
    alpha: 0.05,
    power: 0.80,
    ratio: 1
  });

  const handleCaseControlCalculate = async () => {
    try {
      await caseControlCalc.calculate(calculateCaseControl);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCohortCalculate = async () => {
    try {
      await cohortCalc.calculate(calculateCohort);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCrossSectionalCalculate = async () => {
    try {
      await crossSectionalCalc.calculate(calculateCrossSectional);
    } catch (error) {
      alert(error.message);
    }
  };

  const getCurrentCalculation = () => {
    switch (activeTab) {
      case 'case-control':
        return caseControlCalc.lastCalculation;
      case 'cohort':
        return cohortCalc.lastCalculation;
      case 'cross-sectional':
        return crossSectionalCalc.lastCalculation;
      default:
        return null;
    }
  };

  const handleExport = () => {
    const calc = getCurrentCalculation();
    if (!calc) {
      alert('Please perform a calculation first before exporting.');
      return;
    }
    setShowExportModal(true);
  };

  const handleCopy = () => {
    copyToClipboard(getCurrentCalculation());
  };

  return (
    <div className="calculator-page theme-purple">
      <CalculatorHeader
        title="Comparative Studies Calculator"
        subtitle="Sample size calculations for case-control, cohort, and cross-sectional comparison studies"
        navLinks={NAV_LINKS}
        themeClass="theme-purple"
      />

      <main className="container" style={{ padding: '2rem' }}>
        {/* Tab Navigation */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'case-control' ? 'active' : ''}`}
            onClick={() => setActiveTab('case-control')}
          >
            <span className="tab-icon">OR</span>
            Case-Control
          </button>
          <button
            className={`tab ${activeTab === 'cohort' ? 'active' : ''}`}
            onClick={() => setActiveTab('cohort')}
          >
            <span className="tab-icon">RR</span>
            Cohort Study
          </button>
          <button
            className={`tab ${activeTab === 'cross-sectional' ? 'active' : ''}`}
            onClick={() => setActiveTab('cross-sectional')}
          >
            <span className="tab-icon">%</span>
            Cross-Sectional
          </button>
        </div>

        {/* Case-Control Tab */}
        {activeTab === 'case-control' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>OR</div>
              <div className="card-title">
                <h2>Case-Control Study</h2>
                <p>Calculate sample size for detecting an odds ratio comparing cases to controls</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput
                label="Exposure Prevalence in Controls (P₀)"
                name="p0"
                value={caseControlCalc.inputs.p0}
                onChange={caseControlCalc.updateInput}
                min={0.01}
                max={0.99}
                step={0.01}
                required
                helpText="Proportion exposed among controls (0 to 1)"
              />
              <FormInput
                label="Expected Odds Ratio"
                name="or"
                value={caseControlCalc.inputs.or}
                onChange={caseControlCalc.updateInput}
                min={0.1}
                step={0.1}
                required
                helpText="OR > 1 indicates increased risk, OR < 1 indicates protection"
              />
              <FormSelect
                label="Significance Level (α)"
                name="alpha"
                value={caseControlCalc.inputs.alpha}
                onChange={caseControlCalc.updateInput}
                options={ALPHA_OPTIONS}
                required
              />
              <FormSelect
                label="Statistical Power (1-β)"
                name="power"
                value={caseControlCalc.inputs.power}
                onChange={caseControlCalc.updateInput}
                options={POWER_OPTIONS}
                required
              />
              <FormInput
                label="Control:Case Ratio"
                name="ratio"
                value={caseControlCalc.inputs.ratio}
                onChange={caseControlCalc.updateInput}
                min={1}
                max={5}
                step={1}
                helpText="Number of controls per case (e.g., 2 for 2:1 matching)"
              />
            </div>

            <CalculatorButtons
              onCalculate={handleCaseControlCalculate}
              onReset={caseControlCalc.resetInputs}
              isLoading={caseControlCalc.isCalculating}
              calculateLabel="Calculate Sample Size"
            />

            {caseControlCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard
                    value={caseControlCalc.lastCalculation.results['Cases Required']}
                    label="Cases Required"
                    isPrimary
                  />
                  <ResultCard
                    value={caseControlCalc.lastCalculation.results['Controls Required']}
                    label="Controls Required"
                  />
                  <ResultCard
                    value={caseControlCalc.lastCalculation.results['Total Sample Size']}
                    label="Total Sample Size"
                  />
                </ResultGrid>

                <FormulaSection
                  formula={caseControlCalc.lastCalculation.formula}
                  explanation={caseControlCalc.lastCalculation.formulaExplanation}
                />

                <StepsSection steps={caseControlCalc.lastCalculation.steps} />

                <InterpretationBox text={caseControlCalc.lastCalculation.interpretation} />

                <RecommendationsSection recommendations={caseControlCalc.lastCalculation.recommendations} />

                <ReferenceSection reference={caseControlCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {/* Cohort Study Tab */}
        {activeTab === 'cohort' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>RR</div>
              <div className="card-title">
                <h2>Cohort Study</h2>
                <p>Calculate sample size for detecting a relative risk comparing exposed to unexposed</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput
                label="Incidence in Unexposed (P₀)"
                name="p0"
                value={cohortCalc.inputs.p0}
                onChange={cohortCalc.updateInput}
                min={0.001}
                max={0.99}
                step={0.01}
                required
                helpText="Expected incidence rate in unexposed group (0 to 1)"
              />
              <FormInput
                label="Expected Relative Risk"
                name="rr"
                value={cohortCalc.inputs.rr}
                onChange={cohortCalc.updateInput}
                min={0.1}
                step={0.1}
                required
                helpText="RR > 1 indicates increased risk, RR < 1 indicates protection"
              />
              <FormSelect
                label="Significance Level (α)"
                name="alpha"
                value={cohortCalc.inputs.alpha}
                onChange={cohortCalc.updateInput}
                options={ALPHA_OPTIONS}
                required
              />
              <FormSelect
                label="Statistical Power (1-β)"
                name="power"
                value={cohortCalc.inputs.power}
                onChange={cohortCalc.updateInput}
                options={POWER_OPTIONS}
                required
              />
              <FormInput
                label="Unexposed:Exposed Ratio"
                name="ratio"
                value={cohortCalc.inputs.ratio}
                onChange={cohortCalc.updateInput}
                min={1}
                max={5}
                step={1}
                helpText="Number of unexposed per exposed participant"
              />
            </div>

            <CalculatorButtons
              onCalculate={handleCohortCalculate}
              onReset={cohortCalc.resetInputs}
              isLoading={cohortCalc.isCalculating}
              calculateLabel="Calculate Sample Size"
            />

            {cohortCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard
                    value={cohortCalc.lastCalculation.results['Exposed Group']}
                    label="Exposed Group"
                    isPrimary
                  />
                  <ResultCard
                    value={cohortCalc.lastCalculation.results['Unexposed Group']}
                    label="Unexposed Group"
                  />
                  <ResultCard
                    value={cohortCalc.lastCalculation.results['Total Sample Size']}
                    label="Total Sample Size"
                  />
                </ResultGrid>

                <FormulaSection
                  formula={cohortCalc.lastCalculation.formula}
                  explanation={cohortCalc.lastCalculation.formulaExplanation}
                />

                <StepsSection steps={cohortCalc.lastCalculation.steps} />

                <InterpretationBox text={cohortCalc.lastCalculation.interpretation} />

                <RecommendationsSection recommendations={cohortCalc.lastCalculation.recommendations} />

                <ReferenceSection reference={cohortCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {/* Cross-Sectional Tab */}
        {activeTab === 'cross-sectional' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>%</div>
              <div className="card-title">
                <h2>Cross-Sectional Comparison</h2>
                <p>Compare two proportions between independent groups</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput
                label="Proportion in Group 1 (P₁)"
                name="p1"
                value={crossSectionalCalc.inputs.p1}
                onChange={crossSectionalCalc.updateInput}
                min={0.01}
                max={0.99}
                step={0.01}
                required
                helpText="Expected proportion in first group"
              />
              <FormInput
                label="Proportion in Group 2 (P₂)"
                name="p2"
                value={crossSectionalCalc.inputs.p2}
                onChange={crossSectionalCalc.updateInput}
                min={0.01}
                max={0.99}
                step={0.01}
                required
                helpText="Expected proportion in second group"
              />
              <FormSelect
                label="Significance Level (α)"
                name="alpha"
                value={crossSectionalCalc.inputs.alpha}
                onChange={crossSectionalCalc.updateInput}
                options={ALPHA_OPTIONS}
                required
              />
              <FormSelect
                label="Statistical Power (1-β)"
                name="power"
                value={crossSectionalCalc.inputs.power}
                onChange={crossSectionalCalc.updateInput}
                options={POWER_OPTIONS}
                required
              />
              <FormInput
                label="Allocation Ratio (n₂/n₁)"
                name="ratio"
                value={crossSectionalCalc.inputs.ratio}
                onChange={crossSectionalCalc.updateInput}
                min={0.5}
                max={3}
                step={0.5}
                helpText="1 = equal groups"
              />
            </div>

            <CalculatorButtons
              onCalculate={handleCrossSectionalCalculate}
              onReset={crossSectionalCalc.resetInputs}
              isLoading={crossSectionalCalc.isCalculating}
              calculateLabel="Calculate Sample Size"
            />

            {crossSectionalCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard
                    value={crossSectionalCalc.lastCalculation.results['Group 1']}
                    label="Group 1"
                    isPrimary
                  />
                  <ResultCard
                    value={crossSectionalCalc.lastCalculation.results['Group 2']}
                    label="Group 2"
                  />
                  <ResultCard
                    value={crossSectionalCalc.lastCalculation.results['Total Sample Size']}
                    label="Total Sample Size"
                  />
                </ResultGrid>

                <FormulaSection
                  formula={crossSectionalCalc.lastCalculation.formula}
                  explanation={crossSectionalCalc.lastCalculation.formulaExplanation}
                />

                <StepsSection steps={crossSectionalCalc.lastCalculation.steps} />

                <InterpretationBox text={crossSectionalCalc.lastCalculation.interpretation} />

                <RecommendationsSection recommendations={crossSectionalCalc.lastCalculation.recommendations} />

                <ReferenceSection reference={crossSectionalCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {/* Export Card */}
        <section className="card export-card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>📄</div>
            <div className="card-title">
              <h2>Export Results</h2>
              <p>Generate a comprehensive PDF report with all calculation details</p>
            </div>
          </div>

          <div className="export-options">
            <button className="btn btn-export" onClick={handleExport}>
              Export PDF Report
            </button>
            <button className="btn btn-secondary" onClick={handleCopy}>
              Copy to Clipboard
            </button>
          </div>
        </section>
      </main>

      <SimpleFooter />

      <ThemeToggle variant="floating" />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportToPDF}
        lastCalculation={getCurrentCalculation()}
      />
    </div>
  );
}

export default ComparativeCalculator;
