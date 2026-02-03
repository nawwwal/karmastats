import { useState } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons, ResultsSection, ResultGrid, ResultCard, FormulaSection, StepsSection, InterpretationBox, RecommendationsSection, ReferenceSection, ExportModal } from '../components/calculators';
import { useCalculator } from '../hooks/useCalculator';
import { calculateSuperiority, calculateNonInferiority, calculateEquivalence } from '../calculators/clinical';
import { exportToPDF, copyToClipboard } from '../utils/pdfExport';
import '../components/calculators/CalculatorForm.css';

const ALPHA_OPTIONS = [
  { value: '0.05', label: '0.05 (5%)' },
  { value: '0.025', label: '0.025 (2.5%)' },
  { value: '0.01', label: '0.01 (1%)' }
];

const POWER_OPTIONS = [
  { value: '0.80', label: '80%' },
  { value: '0.90', label: '90%' },
  { value: '0.95', label: '95%' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/diagnostic', label: 'Diagnostic' },
  { to: '/references', label: 'References' }
];

export function ClinicalTrialsCalculator() {
  const [activeTab, setActiveTab] = useState('superiority');
  const [showExportModal, setShowExportModal] = useState(false);

  const superiorityCalc = useCalculator({ pC: 0.30, pT: 0.45, alpha: 0.05, power: 0.80, ratio: 1, dropoutRate: 15 });
  const nonInferiorityCalc = useCalculator({ pC: 0.70, pT: 0.70, delta: 0.10, alpha: 0.025, power: 0.80, ratio: 1, dropoutRate: 15 });
  const equivalenceCalc = useCalculator({ pC: 0.50, pT: 0.50, delta: 0.15, alpha: 0.05, power: 0.80, ratio: 1, dropoutRate: 15 });

  const handleCalculate = async (calc, fn) => {
    try { await calc.calculate(fn); } catch (error) { alert(error.message); }
  };

  const getCurrentCalculation = () => {
    switch (activeTab) {
      case 'superiority': return superiorityCalc.lastCalculation;
      case 'non-inferiority': return nonInferiorityCalc.lastCalculation;
      case 'equivalence': return equivalenceCalc.lastCalculation;
      default: return null;
    }
  };

  const handleExport = () => {
    const calc = getCurrentCalculation();
    if (!calc) { alert('Please perform a calculation first.'); return; }
    setShowExportModal(true);
  };

  return (
    <div className="calculator-page theme-amber">
      <CalculatorHeader title="Clinical Trials Calculator" subtitle="Sample size calculations for RCT superiority, non-inferiority, and equivalence trials" navLinks={NAV_LINKS} themeClass="theme-amber" />

      <main className="container" style={{ padding: '2rem' }}>
        <div className="tabs-container">
          <button className={`tab ${activeTab === 'superiority' ? 'active' : ''}`} onClick={() => setActiveTab('superiority')}><span className="tab-icon">+</span>Superiority</button>
          <button className={`tab ${activeTab === 'non-inferiority' ? 'active' : ''}`} onClick={() => setActiveTab('non-inferiority')}><span className="tab-icon">≥</span>Non-Inferiority</button>
          <button className={`tab ${activeTab === 'equivalence' ? 'active' : ''}`} onClick={() => setActiveTab('equivalence')}><span className="tab-icon">=</span>Equivalence</button>
        </div>

        {activeTab === 'superiority' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>+</div>
              <div className="card-title"><h2>Superiority Trial</h2><p>Demonstrate treatment is better than control</p></div>
            </div>
            <div className="form-grid">
              <FormInput label="Control Response Rate" name="pC" value={superiorityCalc.inputs.pC} onChange={superiorityCalc.updateInput} min={0.01} max={0.99} step={0.01} required helpText="Expected response rate in control group" />
              <FormInput label="Treatment Response Rate" name="pT" value={superiorityCalc.inputs.pT} onChange={superiorityCalc.updateInput} min={0.01} max={0.99} step={0.01} required helpText="Expected response rate in treatment group" />
              <FormSelect label="Significance Level (α)" name="alpha" value={superiorityCalc.inputs.alpha} onChange={superiorityCalc.updateInput} options={ALPHA_OPTIONS} required />
              <FormSelect label="Statistical Power" name="power" value={superiorityCalc.inputs.power} onChange={superiorityCalc.updateInput} options={POWER_OPTIONS} required />
              <FormInput label="Allocation Ratio (Control:Treatment)" name="ratio" value={superiorityCalc.inputs.ratio} onChange={superiorityCalc.updateInput} min={1} max={4} step={1} helpText="1 = equal allocation" />
              <FormInput label="Expected Dropout Rate (%)" name="dropoutRate" value={superiorityCalc.inputs.dropoutRate} onChange={superiorityCalc.updateInput} min={0} max={40} step={5} />
            </div>
            <CalculatorButtons onCalculate={() => handleCalculate(superiorityCalc, calculateSuperiority)} onReset={superiorityCalc.resetInputs} isLoading={superiorityCalc.isCalculating} calculateLabel="Calculate Sample Size" />
            {superiorityCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard value={superiorityCalc.lastCalculation.results['Total Sample Size']} label="Total Sample Size" isPrimary />
                  <ResultCard value={superiorityCalc.lastCalculation.results['Treatment Group']} label="Treatment Group" />
                  <ResultCard value={superiorityCalc.lastCalculation.results['Control Group']} label="Control Group" />
                </ResultGrid>
                <FormulaSection formula={superiorityCalc.lastCalculation.formula} explanation={superiorityCalc.lastCalculation.formulaExplanation} />
                <StepsSection steps={superiorityCalc.lastCalculation.steps} />
                <InterpretationBox text={superiorityCalc.lastCalculation.interpretation} />
                <RecommendationsSection recommendations={superiorityCalc.lastCalculation.recommendations} />
                <ReferenceSection reference={superiorityCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {activeTab === 'non-inferiority' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>≥</div>
              <div className="card-title"><h2>Non-Inferiority Trial</h2><p>Demonstrate treatment is not worse than control by margin δ</p></div>
            </div>
            <div className="form-grid">
              <FormInput label="Control Response Rate" name="pC" value={nonInferiorityCalc.inputs.pC} onChange={nonInferiorityCalc.updateInput} min={0.01} max={0.99} step={0.01} required />
              <FormInput label="Expected Treatment Rate" name="pT" value={nonInferiorityCalc.inputs.pT} onChange={nonInferiorityCalc.updateInput} min={0.01} max={0.99} step={0.01} required />
              <FormInput label="Non-Inferiority Margin (δ)" name="delta" value={nonInferiorityCalc.inputs.delta} onChange={nonInferiorityCalc.updateInput} min={0.01} max={0.20} step={0.01} required helpText="Maximum acceptable inferiority" />
              <FormSelect label="Significance Level (α, one-sided)" name="alpha" value={nonInferiorityCalc.inputs.alpha} onChange={nonInferiorityCalc.updateInput} options={ALPHA_OPTIONS} required />
              <FormSelect label="Statistical Power" name="power" value={nonInferiorityCalc.inputs.power} onChange={nonInferiorityCalc.updateInput} options={POWER_OPTIONS} required />
              <FormInput label="Expected Dropout Rate (%)" name="dropoutRate" value={nonInferiorityCalc.inputs.dropoutRate} onChange={nonInferiorityCalc.updateInput} min={0} max={40} step={5} />
            </div>
            <CalculatorButtons onCalculate={() => handleCalculate(nonInferiorityCalc, calculateNonInferiority)} onReset={nonInferiorityCalc.resetInputs} isLoading={nonInferiorityCalc.isCalculating} calculateLabel="Calculate Sample Size" />
            {nonInferiorityCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard value={nonInferiorityCalc.lastCalculation.results['Total Sample Size']} label="Total Sample Size" isPrimary />
                  <ResultCard value={nonInferiorityCalc.lastCalculation.results['Treatment Group']} label="Treatment Group" />
                  <ResultCard value={nonInferiorityCalc.lastCalculation.results['Control Group']} label="Control Group" />
                </ResultGrid>
                <FormulaSection formula={nonInferiorityCalc.lastCalculation.formula} explanation={nonInferiorityCalc.lastCalculation.formulaExplanation} />
                <StepsSection steps={nonInferiorityCalc.lastCalculation.steps} />
                <InterpretationBox text={nonInferiorityCalc.lastCalculation.interpretation} />
                <RecommendationsSection recommendations={nonInferiorityCalc.lastCalculation.recommendations} />
                <ReferenceSection reference={nonInferiorityCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {activeTab === 'equivalence' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>=</div>
              <div className="card-title"><h2>Equivalence Trial</h2><p>Demonstrate treatments are equivalent within margin ±δ</p></div>
            </div>
            <div className="form-grid">
              <FormInput label="Control Response Rate" name="pC" value={equivalenceCalc.inputs.pC} onChange={equivalenceCalc.updateInput} min={0.01} max={0.99} step={0.01} required />
              <FormInput label="Expected Treatment Rate" name="pT" value={equivalenceCalc.inputs.pT} onChange={equivalenceCalc.updateInput} min={0.01} max={0.99} step={0.01} required />
              <FormInput label="Equivalence Margin (±δ)" name="delta" value={equivalenceCalc.inputs.delta} onChange={equivalenceCalc.updateInput} min={0.01} max={0.25} step={0.01} required helpText="Acceptable difference range" />
              <FormSelect label="Significance Level (α)" name="alpha" value={equivalenceCalc.inputs.alpha} onChange={equivalenceCalc.updateInput} options={ALPHA_OPTIONS} required />
              <FormSelect label="Statistical Power" name="power" value={equivalenceCalc.inputs.power} onChange={equivalenceCalc.updateInput} options={POWER_OPTIONS} required />
              <FormInput label="Expected Dropout Rate (%)" name="dropoutRate" value={equivalenceCalc.inputs.dropoutRate} onChange={equivalenceCalc.updateInput} min={0} max={40} step={5} />
            </div>
            <CalculatorButtons onCalculate={() => handleCalculate(equivalenceCalc, calculateEquivalence)} onReset={equivalenceCalc.resetInputs} isLoading={equivalenceCalc.isCalculating} calculateLabel="Calculate Sample Size" />
            {equivalenceCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard value={equivalenceCalc.lastCalculation.results['Total Sample Size']} label="Total Sample Size" isPrimary />
                  <ResultCard value={equivalenceCalc.lastCalculation.results['Treatment Group']} label="Treatment Group" />
                  <ResultCard value={equivalenceCalc.lastCalculation.results['Control Group']} label="Control Group" />
                </ResultGrid>
                <FormulaSection formula={equivalenceCalc.lastCalculation.formula} explanation={equivalenceCalc.lastCalculation.formulaExplanation} />
                <StepsSection steps={equivalenceCalc.lastCalculation.steps} />
                <InterpretationBox text={equivalenceCalc.lastCalculation.interpretation} />
                <RecommendationsSection recommendations={equivalenceCalc.lastCalculation.recommendations} />
                <ReferenceSection reference={equivalenceCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        <section className="card export-card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>📄</div>
            <div className="card-title"><h2>Export Results</h2><p>Generate a PDF report</p></div>
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

export default ClinicalTrialsCalculator;
