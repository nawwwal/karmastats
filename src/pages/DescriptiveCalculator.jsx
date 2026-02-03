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
import { calculatePrevalence, calculateMean, calculateFinite } from '../calculators/descriptive';
import { exportToPDF, copyToClipboard } from '../utils/pdfExport';
import '../components/calculators/CalculatorForm.css';

const CONFIDENCE_OPTIONS = [
  { value: '1.96', label: '95% (Z = 1.96)' },
  { value: '2.576', label: '99% (Z = 2.576)' },
  { value: '1.645', label: '90% (Z = 1.645)' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/power-analysis', label: 'Power Analysis' },
  { to: '/references', label: 'References' }
];

export function DescriptiveCalculator() {
  const [activeTab, setActiveTab] = useState('prevalence');
  const [showExportModal, setShowExportModal] = useState(false);

  // Prevalence form state
  const prevalenceCalc = useCalculator({
    p: 0.5,
    d: 0.05,
    z: 1.96,
    deff: 1,
    nonResponseRate: 10
  });

  // Mean estimation form state
  const meanCalc = useCalculator({
    sd: 10,
    d: 2,
    z: 1.96,
    nonResponseRate: 10
  });

  // Finite population form state
  const finiteCalc = useCalculator({
    n0: 385,
    N: 1000
  });

  const handlePrevalenceCalculate = async () => {
    try {
      await prevalenceCalc.calculate(calculatePrevalence);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMeanCalculate = async () => {
    try {
      await meanCalc.calculate(calculateMean);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleFiniteCalculate = async () => {
    try {
      await finiteCalc.calculate(calculateFinite);
    } catch (error) {
      alert(error.message);
    }
  };

  const getCurrentCalculation = () => {
    switch (activeTab) {
      case 'prevalence':
        return prevalenceCalc.lastCalculation;
      case 'mean':
        return meanCalc.lastCalculation;
      case 'finite':
        return finiteCalc.lastCalculation;
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
    <div className="calculator-page theme-green">
      <CalculatorHeader
        title="Descriptive Studies Calculator"
        subtitle="Cross-sectional surveys, prevalence studies, and population parameter estimation with comprehensive statistical analysis"
        navLinks={NAV_LINKS}
        themeClass="theme-green"
      />

      <main className="container" style={{ padding: '2rem' }}>
        {/* Tab Navigation */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'prevalence' ? 'active' : ''}`}
            onClick={() => setActiveTab('prevalence')}
          >
            <span className="tab-icon">%</span>
            Prevalence Estimation
          </button>
          <button
            className={`tab ${activeTab === 'mean' ? 'active' : ''}`}
            onClick={() => setActiveTab('mean')}
          >
            <span className="tab-icon">x̄</span>
            Mean Estimation
          </button>
          <button
            className={`tab ${activeTab === 'finite' ? 'active' : ''}`}
            onClick={() => setActiveTab('finite')}
          >
            <span className="tab-icon">N</span>
            Finite Population
          </button>
        </div>

        {/* Prevalence Tab */}
        {activeTab === 'prevalence' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>%</div>
              <div className="card-title">
                <h2>Prevalence Estimation Sample Size</h2>
                <p>Calculate sample size for estimating a population proportion with specified precision</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput
                label="Expected Prevalence (P)"
                name="p"
                value={prevalenceCalc.inputs.p}
                onChange={prevalenceCalc.updateInput}
                min={0.01}
                max={0.99}
                step={0.01}
                required
                helpText="Use 0.5 if unknown (most conservative estimate)"
              />
              <FormInput
                label="Precision / Margin of Error (d)"
                name="d"
                value={prevalenceCalc.inputs.d}
                onChange={prevalenceCalc.updateInput}
                min={0.01}
                max={0.2}
                step={0.01}
                required
                helpText="Absolute precision (e.g., 0.05 = ±5%)"
              />
              <FormSelect
                label="Confidence Level"
                name="z"
                value={prevalenceCalc.inputs.z}
                onChange={prevalenceCalc.updateInput}
                options={CONFIDENCE_OPTIONS}
                required
                helpText="Standard confidence level for interval estimation"
              />
              <FormInput
                label="Design Effect (DEFF)"
                name="deff"
                value={prevalenceCalc.inputs.deff}
                onChange={prevalenceCalc.updateInput}
                min={1}
                max={5}
                step={0.1}
                helpText="Use 1 for simple random sampling; higher for cluster sampling"
              />
              <FormInput
                label="Expected Non-response Rate (%)"
                name="nonResponseRate"
                value={prevalenceCalc.inputs.nonResponseRate}
                onChange={prevalenceCalc.updateInput}
                min={0}
                max={50}
                step={1}
                helpText="Percentage of participants expected not to respond"
              />
            </div>

            <CalculatorButtons
              onCalculate={handlePrevalenceCalculate}
              onReset={prevalenceCalc.resetInputs}
              isLoading={prevalenceCalc.isCalculating}
              calculateLabel="Calculate Sample Size"
            />

            {prevalenceCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard
                    value={prevalenceCalc.lastCalculation.results['Required Sample Size']}
                    label="Required Sample Size"
                    isPrimary
                  />
                  <ResultCard
                    value={prevalenceCalc.lastCalculation.results['Adjusted for Non-response']}
                    label="Adjusted for Non-response"
                  />
                  <ResultCard
                    value={prevalenceCalc.lastCalculation.results['Expected CI Width']}
                    label="Expected CI Width"
                  />
                </ResultGrid>

                <FormulaSection
                  formula={prevalenceCalc.lastCalculation.formula}
                  explanation={prevalenceCalc.lastCalculation.formulaExplanation}
                />

                <StepsSection steps={prevalenceCalc.lastCalculation.steps} />

                <InterpretationBox text={prevalenceCalc.lastCalculation.interpretation} />

                <RecommendationsSection recommendations={prevalenceCalc.lastCalculation.recommendations} />

                <ReferenceSection reference={prevalenceCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {/* Mean Estimation Tab */}
        {activeTab === 'mean' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>x̄</div>
              <div className="card-title">
                <h2>Mean Estimation Sample Size</h2>
                <p>Calculate sample size for estimating a population mean with specified precision</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput
                label="Population Standard Deviation (σ)"
                name="sd"
                value={meanCalc.inputs.sd}
                onChange={meanCalc.updateInput}
                min={0.1}
                step={0.1}
                required
                helpText="Estimate from pilot study or published literature"
              />
              <FormInput
                label="Desired Precision (d)"
                name="d"
                value={meanCalc.inputs.d}
                onChange={meanCalc.updateInput}
                min={0.1}
                step={0.1}
                required
                helpText="Half-width of the confidence interval"
              />
              <FormSelect
                label="Confidence Level"
                name="z"
                value={meanCalc.inputs.z}
                onChange={meanCalc.updateInput}
                options={CONFIDENCE_OPTIONS}
                required
                helpText="Standard confidence level for interval estimation"
              />
              <FormInput
                label="Expected Non-response Rate (%)"
                name="nonResponseRate"
                value={meanCalc.inputs.nonResponseRate}
                onChange={meanCalc.updateInput}
                min={0}
                max={50}
                step={1}
                helpText="Percentage of participants expected not to respond"
              />
            </div>

            <CalculatorButtons
              onCalculate={handleMeanCalculate}
              onReset={meanCalc.resetInputs}
              isLoading={meanCalc.isCalculating}
              calculateLabel="Calculate Sample Size"
            />

            {meanCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard
                    value={meanCalc.lastCalculation.results['Required Sample Size']}
                    label="Required Sample Size"
                    isPrimary
                  />
                  <ResultCard
                    value={meanCalc.lastCalculation.results['Adjusted for Non-response']}
                    label="Adjusted for Non-response"
                  />
                  <ResultCard
                    value={meanCalc.lastCalculation.results['Expected Standard Error']}
                    label="Expected Standard Error"
                  />
                </ResultGrid>

                <FormulaSection
                  formula={meanCalc.lastCalculation.formula}
                  explanation={meanCalc.lastCalculation.formulaExplanation}
                />

                <StepsSection steps={meanCalc.lastCalculation.steps} />

                <InterpretationBox text={meanCalc.lastCalculation.interpretation} />

                <RecommendationsSection recommendations={meanCalc.lastCalculation.recommendations} />

                <ReferenceSection reference={meanCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {/* Finite Population Tab */}
        {activeTab === 'finite' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>N</div>
              <div className="card-title">
                <h2>Finite Population Correction</h2>
                <p>Adjust sample size when sampling from a known finite population</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput
                label="Initial Sample Size (n₀)"
                name="n0"
                value={finiteCalc.inputs.n0}
                onChange={finiteCalc.updateInput}
                min={10}
                step={1}
                required
                helpText="Sample size calculated assuming infinite population"
              />
              <FormInput
                label="Population Size (N)"
                name="N"
                value={finiteCalc.inputs.N}
                onChange={finiteCalc.updateInput}
                min={100}
                step={1}
                required
                helpText="Total size of the target population"
              />
            </div>

            <CalculatorButtons
              onCalculate={handleFiniteCalculate}
              onReset={finiteCalc.resetInputs}
              isLoading={finiteCalc.isCalculating}
              calculateLabel="Calculate Adjusted Sample Size"
            />

            {finiteCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard
                    value={finiteCalc.lastCalculation.results['Adjusted Sample Size']}
                    label="Adjusted Sample Size"
                    isPrimary
                  />
                  <ResultCard
                    value={finiteCalc.lastCalculation.results['Sampling Fraction']}
                    label="Sampling Fraction"
                  />
                  <ResultCard
                    value={finiteCalc.lastCalculation.results['Sample Reduction']}
                    label="Sample Reduction"
                  />
                </ResultGrid>

                <FormulaSection
                  formula={finiteCalc.lastCalculation.formula}
                  explanation={finiteCalc.lastCalculation.formulaExplanation}
                />

                <StepsSection steps={finiteCalc.lastCalculation.steps} />

                <InterpretationBox text={finiteCalc.lastCalculation.interpretation} />

                <RecommendationsSection recommendations={finiteCalc.lastCalculation.recommendations} />

                <ReferenceSection reference={finiteCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {/* Export Card */}
        <section className="card export-card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>📄</div>
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

export default DescriptiveCalculator;
