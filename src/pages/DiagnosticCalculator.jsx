import { useState } from 'react';
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
import { calculateSensitivity, calculateSpecificity, calculateAUC } from '../calculators/diagnostic';
import { exportToPDF, copyToClipboard } from '../utils/pdfExport';
import '../components/calculators/CalculatorForm.css';

const ALPHA_OPTIONS = [
  { value: '0.05', label: '0.05 (95% CI)' },
  { value: '0.01', label: '0.01 (99% CI)' },
  { value: '0.10', label: '0.10 (90% CI)' }
];

const POWER_OPTIONS = [
  { value: '0.80', label: '80%' },
  { value: '0.90', label: '90%' },
  { value: '0.95', label: '95%' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/comparative', label: 'Comparative' },
  { to: '/references', label: 'References' }
];

export function DiagnosticCalculator() {
  const [activeTab, setActiveTab] = useState('sensitivity');
  const [showExportModal, setShowExportModal] = useState(false);

  const sensCalc = useCalculator({
    sens: 0.90,
    precision: 0.05,
    alpha: 0.05,
    prevalence: 0.30
  });

  const specCalc = useCalculator({
    spec: 0.85,
    precision: 0.05,
    alpha: 0.05,
    prevalence: 0.30
  });

  const aucCalc = useCalculator({
    auc0: 0.70,
    auc1: 0.80,
    alpha: 0.05,
    power: 0.80,
    ratio: 1
  });

  const handleSensCalculate = async () => {
    try {
      await sensCalc.calculate(calculateSensitivity);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSpecCalculate = async () => {
    try {
      await specCalc.calculate(calculateSpecificity);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAUCCalculate = async () => {
    try {
      await aucCalc.calculate(calculateAUC);
    } catch (error) {
      alert(error.message);
    }
  };

  const getCurrentCalculation = () => {
    switch (activeTab) {
      case 'sensitivity': return sensCalc.lastCalculation;
      case 'specificity': return specCalc.lastCalculation;
      case 'auc': return aucCalc.lastCalculation;
      default: return null;
    }
  };

  const handleExport = () => {
    const calc = getCurrentCalculation();
    if (!calc) {
      alert('Please perform a calculation first.');
      return;
    }
    setShowExportModal(true);
  };

  return (
    <div className="calculator-page theme-pink">
      <CalculatorHeader
        title="Diagnostic Accuracy Calculator"
        subtitle="Sample size calculations for sensitivity, specificity, and ROC curve analysis"
        navLinks={NAV_LINKS}
        themeClass="theme-pink"
      />

      <main className="container" style={{ padding: '2rem' }}>
        <div className="tabs-container">
          <button className={`tab ${activeTab === 'sensitivity' ? 'active' : ''}`} onClick={() => setActiveTab('sensitivity')}>
            <span className="tab-icon">Se</span>
            Sensitivity
          </button>
          <button className={`tab ${activeTab === 'specificity' ? 'active' : ''}`} onClick={() => setActiveTab('specificity')}>
            <span className="tab-icon">Sp</span>
            Specificity
          </button>
          <button className={`tab ${activeTab === 'auc' ? 'active' : ''}`} onClick={() => setActiveTab('auc')}>
            <span className="tab-icon">AUC</span>
            ROC Analysis
          </button>
        </div>

        {activeTab === 'sensitivity' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #EC4899, #DB2777)' }}>Se</div>
              <div className="card-title">
                <h2>Sensitivity Estimation</h2>
                <p>Sample size for estimating test sensitivity with desired precision</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput label="Expected Sensitivity" name="sens" value={sensCalc.inputs.sens} onChange={sensCalc.updateInput} min={0.5} max={0.99} step={0.01} required helpText="Expected sensitivity (0.5 to 0.99)" />
              <FormInput label="Desired Precision (±)" name="precision" value={sensCalc.inputs.precision} onChange={sensCalc.updateInput} min={0.01} max={0.15} step={0.01} required helpText="Half-width of confidence interval" />
              <FormSelect label="Confidence Level" name="alpha" value={sensCalc.inputs.alpha} onChange={sensCalc.updateInput} options={ALPHA_OPTIONS} required />
              <FormInput label="Disease Prevalence" name="prevalence" value={sensCalc.inputs.prevalence} onChange={sensCalc.updateInput} min={0.01} max={0.99} step={0.01} required helpText="Expected proportion with disease" />
            </div>

            <CalculatorButtons onCalculate={handleSensCalculate} onReset={sensCalc.resetInputs} isLoading={sensCalc.isCalculating} calculateLabel="Calculate Sample Size" />

            {sensCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard value={sensCalc.lastCalculation.results['Total Sample Size']} label="Total Sample Size" isPrimary />
                  <ResultCard value={sensCalc.lastCalculation.results['Diseased Subjects']} label="Diseased Subjects" />
                  <ResultCard value={sensCalc.lastCalculation.results['Expected Non-diseased']} label="Non-diseased" />
                </ResultGrid>
                <FormulaSection formula={sensCalc.lastCalculation.formula} explanation={sensCalc.lastCalculation.formulaExplanation} />
                <StepsSection steps={sensCalc.lastCalculation.steps} />
                <InterpretationBox text={sensCalc.lastCalculation.interpretation} />
                <RecommendationsSection recommendations={sensCalc.lastCalculation.recommendations} />
                <ReferenceSection reference={sensCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {activeTab === 'specificity' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #EC4899, #DB2777)' }}>Sp</div>
              <div className="card-title">
                <h2>Specificity Estimation</h2>
                <p>Sample size for estimating test specificity with desired precision</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput label="Expected Specificity" name="spec" value={specCalc.inputs.spec} onChange={specCalc.updateInput} min={0.5} max={0.99} step={0.01} required helpText="Expected specificity (0.5 to 0.99)" />
              <FormInput label="Desired Precision (±)" name="precision" value={specCalc.inputs.precision} onChange={specCalc.updateInput} min={0.01} max={0.15} step={0.01} required helpText="Half-width of confidence interval" />
              <FormSelect label="Confidence Level" name="alpha" value={specCalc.inputs.alpha} onChange={specCalc.updateInput} options={ALPHA_OPTIONS} required />
              <FormInput label="Disease Prevalence" name="prevalence" value={specCalc.inputs.prevalence} onChange={specCalc.updateInput} min={0.01} max={0.99} step={0.01} required helpText="Expected proportion with disease" />
            </div>

            <CalculatorButtons onCalculate={handleSpecCalculate} onReset={specCalc.resetInputs} isLoading={specCalc.isCalculating} calculateLabel="Calculate Sample Size" />

            {specCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard value={specCalc.lastCalculation.results['Total Sample Size']} label="Total Sample Size" isPrimary />
                  <ResultCard value={specCalc.lastCalculation.results['Non-diseased Subjects']} label="Non-diseased Subjects" />
                  <ResultCard value={specCalc.lastCalculation.results['Expected Diseased']} label="Diseased" />
                </ResultGrid>
                <FormulaSection formula={specCalc.lastCalculation.formula} explanation={specCalc.lastCalculation.formulaExplanation} />
                <StepsSection steps={specCalc.lastCalculation.steps} />
                <InterpretationBox text={specCalc.lastCalculation.interpretation} />
                <RecommendationsSection recommendations={specCalc.lastCalculation.recommendations} />
                <ReferenceSection reference={specCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {activeTab === 'auc' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #EC4899, #DB2777)' }}>AUC</div>
              <div className="card-title">
                <h2>ROC Curve Analysis</h2>
                <p>Sample size for detecting difference in AUC values</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput label="Null Hypothesis AUC" name="auc0" value={aucCalc.inputs.auc0} onChange={aucCalc.updateInput} min={0.5} max={0.95} step={0.01} required helpText="AUC under null hypothesis (e.g., 0.50 or 0.70)" />
              <FormInput label="Alternative AUC" name="auc1" value={aucCalc.inputs.auc1} onChange={aucCalc.updateInput} min={0.55} max={0.99} step={0.01} required helpText="Expected AUC to detect" />
              <FormSelect label="Significance Level (α)" name="alpha" value={aucCalc.inputs.alpha} onChange={aucCalc.updateInput} options={ALPHA_OPTIONS} required />
              <FormSelect label="Statistical Power" name="power" value={aucCalc.inputs.power} onChange={aucCalc.updateInput} options={POWER_OPTIONS} required />
              <FormInput label="Non-diseased:Diseased Ratio" name="ratio" value={aucCalc.inputs.ratio} onChange={aucCalc.updateInput} min={1} max={5} step={1} helpText="Ratio of non-diseased to diseased" />
            </div>

            <CalculatorButtons onCalculate={handleAUCCalculate} onReset={aucCalc.resetInputs} isLoading={aucCalc.isCalculating} calculateLabel="Calculate Sample Size" />

            {aucCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard value={aucCalc.lastCalculation.results['Total Sample Size']} label="Total Sample Size" isPrimary />
                  <ResultCard value={aucCalc.lastCalculation.results['Diseased Subjects']} label="Diseased Subjects" />
                  <ResultCard value={aucCalc.lastCalculation.results['Non-diseased Subjects']} label="Non-diseased" />
                </ResultGrid>
                <FormulaSection formula={aucCalc.lastCalculation.formula} explanation={aucCalc.lastCalculation.formulaExplanation} />
                <StepsSection steps={aucCalc.lastCalculation.steps} />
                <InterpretationBox text={aucCalc.lastCalculation.interpretation} />
                <RecommendationsSection recommendations={aucCalc.lastCalculation.recommendations} />
                <ReferenceSection reference={aucCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        <section className="card export-card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #EC4899, #DB2777)' }}>📄</div>
            <div className="card-title">
              <h2>Export Results</h2>
              <p>Generate a PDF report with all calculation details</p>
            </div>
          </div>
          <div className="export-options">
            <button className="btn btn-export" onClick={handleExport}>Export PDF Report</button>
            <button className="btn btn-secondary" onClick={() => copyToClipboard(getCurrentCalculation())}>Copy to Clipboard</button>
          </div>
        </section>
      </main>

      <SimpleFooter />
      <ThemeToggle variant="floating" />
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={exportToPDF} lastCalculation={getCurrentCalculation()} />
    </div>
  );
}

export default DiagnosticCalculator;
