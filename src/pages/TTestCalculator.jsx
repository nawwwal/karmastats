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
import { calculateOneSample, calculateTwoSample, calculatePaired } from '../calculators/ttest';
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
  { to: '/calculator/descriptive', label: 'Descriptive' },
  { to: '/references', label: 'References' }
];

export function TTestCalculator() {
  const [activeTab, setActiveTab] = useState('one-sample');
  const [showExportModal, setShowExportModal] = useState(false);

  // One-sample t-test form state
  const oneSampleCalc = useCalculator({
    mean: 75,
    mu0: 70,
    sd: 15,
    alpha: 0.05,
    power: 0.80
  });

  // Two-sample t-test form state
  const twoSampleCalc = useCalculator({
    mean1: 75,
    mean2: 70,
    sd1: 15,
    sd2: 15,
    alpha: 0.05,
    power: 0.80,
    ratio: 1
  });

  // Paired t-test form state
  const pairedCalc = useCalculator({
    meanDiff: 5,
    sdDiff: 10,
    alpha: 0.05,
    power: 0.80
  });

  const handleOneSampleCalculate = async () => {
    try {
      await oneSampleCalc.calculate(calculateOneSample);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleTwoSampleCalculate = async () => {
    try {
      await twoSampleCalc.calculate(calculateTwoSample);
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePairedCalculate = async () => {
    try {
      await pairedCalc.calculate(calculatePaired);
    } catch (error) {
      alert(error.message);
    }
  };

  const getCurrentCalculation = () => {
    switch (activeTab) {
      case 'one-sample':
        return oneSampleCalc.lastCalculation;
      case 'two-sample':
        return twoSampleCalc.lastCalculation;
      case 'paired':
        return pairedCalc.lastCalculation;
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
    <div className="calculator-page theme-blue">
      <CalculatorHeader
        title="T-Test & Mean Comparisons"
        subtitle="Sample size calculations for one-sample, two-sample, and paired t-tests with effect size analysis"
        navLinks={NAV_LINKS}
        themeClass="theme-blue"
      />

      <main className="container" style={{ padding: '2rem' }}>
        {/* Tab Navigation */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'one-sample' ? 'active' : ''}`}
            onClick={() => setActiveTab('one-sample')}
          >
            <span className="tab-icon">1</span>
            One-Sample T-Test
          </button>
          <button
            className={`tab ${activeTab === 'two-sample' ? 'active' : ''}`}
            onClick={() => setActiveTab('two-sample')}
          >
            <span className="tab-icon">2</span>
            Two-Sample T-Test
          </button>
          <button
            className={`tab ${activeTab === 'paired' ? 'active' : ''}`}
            onClick={() => setActiveTab('paired')}
          >
            <span className="tab-icon">⇄</span>
            Paired T-Test
          </button>
        </div>

        {/* One-Sample T-Test Tab */}
        {activeTab === 'one-sample' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>1</div>
              <div className="card-title">
                <h2>One-Sample T-Test</h2>
                <p>Compare a sample mean to a known or hypothesized population value</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput
                label="Expected Sample Mean"
                name="mean"
                value={oneSampleCalc.inputs.mean}
                onChange={oneSampleCalc.updateInput}
                step={0.1}
                required
                helpText="The mean you expect to observe in your sample"
              />
              <FormInput
                label="Null Hypothesis Mean (μ₀)"
                name="mu0"
                value={oneSampleCalc.inputs.mu0}
                onChange={oneSampleCalc.updateInput}
                step={0.1}
                required
                helpText="Population mean under null hypothesis"
              />
              <FormInput
                label="Standard Deviation"
                name="sd"
                value={oneSampleCalc.inputs.sd}
                onChange={oneSampleCalc.updateInput}
                min={0.1}
                step={0.1}
                required
                helpText="Estimate from pilot study or literature"
              />
              <FormSelect
                label="Significance Level (α)"
                name="alpha"
                value={oneSampleCalc.inputs.alpha}
                onChange={oneSampleCalc.updateInput}
                options={ALPHA_OPTIONS}
                required
                helpText="Two-sided significance level"
              />
              <FormSelect
                label="Statistical Power (1-β)"
                name="power"
                value={oneSampleCalc.inputs.power}
                onChange={oneSampleCalc.updateInput}
                options={POWER_OPTIONS}
                required
                helpText="Probability of detecting true effect"
              />
            </div>

            <CalculatorButtons
              onCalculate={handleOneSampleCalculate}
              onReset={oneSampleCalc.resetInputs}
              isLoading={oneSampleCalc.isCalculating}
              calculateLabel="Calculate Sample Size"
            />

            {oneSampleCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard
                    value={oneSampleCalc.lastCalculation.results['Required Sample Size']}
                    label="Required Sample Size"
                    isPrimary
                  />
                  <ResultCard
                    value={oneSampleCalc.lastCalculation.results["Effect Size (Cohen's d)"]}
                    label="Effect Size (Cohen's d)"
                  />
                  <ResultCard
                    value={oneSampleCalc.lastCalculation.results['Zα (two-sided)']}
                    label="Zα (two-sided)"
                  />
                </ResultGrid>

                <FormulaSection
                  formula={oneSampleCalc.lastCalculation.formula}
                  explanation={oneSampleCalc.lastCalculation.formulaExplanation}
                />

                <StepsSection steps={oneSampleCalc.lastCalculation.steps} />

                <InterpretationBox text={oneSampleCalc.lastCalculation.interpretation} />

                <RecommendationsSection recommendations={oneSampleCalc.lastCalculation.recommendations} />

                <ReferenceSection reference={oneSampleCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {/* Two-Sample T-Test Tab */}
        {activeTab === 'two-sample' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>2</div>
              <div className="card-title">
                <h2>Two-Sample T-Test (Independent Groups)</h2>
                <p>Compare means between two independent groups</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput
                label="Mean Group 1"
                name="mean1"
                value={twoSampleCalc.inputs.mean1}
                onChange={twoSampleCalc.updateInput}
                step={0.1}
                required
                helpText="Expected mean for treatment/experimental group"
              />
              <FormInput
                label="Mean Group 2"
                name="mean2"
                value={twoSampleCalc.inputs.mean2}
                onChange={twoSampleCalc.updateInput}
                step={0.1}
                required
                helpText="Expected mean for control group"
              />
              <FormInput
                label="SD Group 1"
                name="sd1"
                value={twoSampleCalc.inputs.sd1}
                onChange={twoSampleCalc.updateInput}
                min={0.1}
                step={0.1}
                required
                helpText="Standard deviation for group 1"
              />
              <FormInput
                label="SD Group 2"
                name="sd2"
                value={twoSampleCalc.inputs.sd2}
                onChange={twoSampleCalc.updateInput}
                min={0.1}
                step={0.1}
                required
                helpText="Standard deviation for group 2"
              />
              <FormSelect
                label="Significance Level (α)"
                name="alpha"
                value={twoSampleCalc.inputs.alpha}
                onChange={twoSampleCalc.updateInput}
                options={ALPHA_OPTIONS}
                required
              />
              <FormSelect
                label="Statistical Power (1-β)"
                name="power"
                value={twoSampleCalc.inputs.power}
                onChange={twoSampleCalc.updateInput}
                options={POWER_OPTIONS}
                required
              />
              <FormInput
                label="Allocation Ratio (k)"
                name="ratio"
                value={twoSampleCalc.inputs.ratio}
                onChange={twoSampleCalc.updateInput}
                min={0.5}
                max={3}
                step={0.1}
                helpText="n₂/n₁ ratio (1 = equal groups)"
              />
            </div>

            <CalculatorButtons
              onCalculate={handleTwoSampleCalculate}
              onReset={twoSampleCalc.resetInputs}
              isLoading={twoSampleCalc.isCalculating}
              calculateLabel="Calculate Sample Size"
            />

            {twoSampleCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard
                    value={twoSampleCalc.lastCalculation.results['Group 1 (n₁)']}
                    label="Group 1 (n₁)"
                    isPrimary
                  />
                  <ResultCard
                    value={twoSampleCalc.lastCalculation.results['Group 2 (n₂)']}
                    label="Group 2 (n₂)"
                  />
                  <ResultCard
                    value={twoSampleCalc.lastCalculation.results['Total Sample Size']}
                    label="Total Sample Size"
                  />
                </ResultGrid>

                <FormulaSection
                  formula={twoSampleCalc.lastCalculation.formula}
                  explanation={twoSampleCalc.lastCalculation.formulaExplanation}
                />

                <StepsSection steps={twoSampleCalc.lastCalculation.steps} />

                <InterpretationBox text={twoSampleCalc.lastCalculation.interpretation} />

                <RecommendationsSection recommendations={twoSampleCalc.lastCalculation.recommendations} />

                <ReferenceSection reference={twoSampleCalc.lastCalculation.reference} />
              </ResultsSection>
            )}
          </section>
        )}

        {/* Paired T-Test Tab */}
        {activeTab === 'paired' && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>⇄</div>
              <div className="card-title">
                <h2>Paired T-Test</h2>
                <p>Compare means from paired or matched observations (before-after, matched pairs)</p>
              </div>
            </div>

            <div className="form-grid">
              <FormInput
                label="Expected Mean Difference"
                name="meanDiff"
                value={pairedCalc.inputs.meanDiff}
                onChange={pairedCalc.updateInput}
                step={0.1}
                required
                helpText="Expected difference between paired observations"
              />
              <FormInput
                label="SD of Differences"
                name="sdDiff"
                value={pairedCalc.inputs.sdDiff}
                onChange={pairedCalc.updateInput}
                min={0.1}
                step={0.1}
                required
                helpText="Standard deviation of the differences (usually smaller than individual SDs)"
              />
              <FormSelect
                label="Significance Level (α)"
                name="alpha"
                value={pairedCalc.inputs.alpha}
                onChange={pairedCalc.updateInput}
                options={ALPHA_OPTIONS}
                required
              />
              <FormSelect
                label="Statistical Power (1-β)"
                name="power"
                value={pairedCalc.inputs.power}
                onChange={pairedCalc.updateInput}
                options={POWER_OPTIONS}
                required
              />
            </div>

            <CalculatorButtons
              onCalculate={handlePairedCalculate}
              onReset={pairedCalc.resetInputs}
              isLoading={pairedCalc.isCalculating}
              calculateLabel="Calculate Sample Size"
            />

            {pairedCalc.lastCalculation && (
              <ResultsSection show={true}>
                <ResultGrid>
                  <ResultCard
                    value={pairedCalc.lastCalculation.results['Required Pairs']}
                    label="Required Pairs"
                    isPrimary
                  />
                  <ResultCard
                    value={pairedCalc.lastCalculation.results["Effect Size (Cohen's d)"]}
                    label="Effect Size (Cohen's d)"
                  />
                  <ResultCard
                    value={pairedCalc.lastCalculation.results['Total Observations']}
                    label="Total Observations"
                  />
                </ResultGrid>

                <FormulaSection
                  formula={pairedCalc.lastCalculation.formula}
                  explanation={pairedCalc.lastCalculation.formulaExplanation}
                />

                <StepsSection steps={pairedCalc.lastCalculation.steps} />

                <InterpretationBox text={pairedCalc.lastCalculation.interpretation} />

                <RecommendationsSection recommendations={pairedCalc.lastCalculation.recommendations} />

                <ReferenceSection reference={pairedCalc.lastCalculation.reference} />
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

export default TTestCalculator;
