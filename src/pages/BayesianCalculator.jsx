import { useState, useMemo } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons, ResultsSection, ResultGrid, ResultCard, FormulaSection, StepsSection, InterpretationBox, RecommendationsSection, ReferenceSection, ExportModal } from '../components/calculators';
import { BayesianChart } from '../components/charts';
import { useCalculator } from '../hooks/useCalculator';
import { calculateBayesianProportion, calculateBayesianMean, calculateAssurance, calculateAdaptiveDesign } from '../calculators/bayesian';
import { exportToPDF, copyToClipboard } from '../utils/pdfExport';
import '../components/calculators/CalculatorForm.css';

const CREDIBLE_OPTIONS = [
  { value: '95', label: '95%' },
  { value: '90', label: '90%' },
  { value: '99', label: '99%' }
];

const ANALYSIS_TYPES = [
  { value: 'proportion', label: 'Sample Size for Proportion (Beta-Binomial)' },
  { value: 'mean', label: 'Sample Size for Mean (Normal-Normal)' },
  { value: 'assurance', label: 'Probability of Success (Assurance)' },
  { value: 'adaptive', label: 'Adaptive Design - Interim Analysis' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/power', label: 'Power Analysis' },
  { to: '/references', label: 'References' }
];

export function BayesianCalculator() {
  const [analysisType, setAnalysisType] = useState('proportion');
  const [showExportModal, setShowExportModal] = useState(false);
  const { calculation, setCalculation, theme, clearCalculation } = useCalculator();

  // Beta-Binomial inputs
  const [priorAlpha, setPriorAlpha] = useState('1');
  const [priorBeta, setPriorBeta] = useState('1');
  const [targetPrecision, setTargetPrecision] = useState('0.1');
  const [credibleLevel, setCredibleLevel] = useState('95');
  const [expectedP, setExpectedP] = useState('0.5');

  // Normal-Normal inputs
  const [priorMean, setPriorMean] = useState('5');
  const [priorSD, setPriorSD] = useState('2');
  const [dataSD, setDataSD] = useState('10');
  const [expectedMean, setExpectedMean] = useState('5');

  // Assurance inputs
  const [clinicalThreshold, setClinicalThreshold] = useState('0');
  const [sampleSize, setSampleSize] = useState('100');
  const [alpha, setAlpha] = useState('0.05');

  // Adaptive design inputs
  const [interimN, setInterimN] = useState('50');
  const [interimSuccesses, setInterimSuccesses] = useState('30');
  const [targetSuccess, setTargetSuccess] = useState('0.5');
  const [maxN, setMaxN] = useState('200');

  const handleCalculate = () => {
    let result;
    switch (analysisType) {
      case 'proportion':
        result = calculateBayesianProportion({ priorAlpha, priorBeta, targetPrecision, credibleLevel, expectedP });
        break;
      case 'mean':
        result = calculateBayesianMean({ priorMean, priorSD, dataSD, targetPrecision, credibleLevel, expectedMean });
        break;
      case 'assurance':
        result = calculateAssurance({ priorMean, priorSD, clinicalThreshold, dataSD, sampleSize, alpha });
        break;
      case 'adaptive':
        result = calculateAdaptiveDesign({ interimN, interimSuccesses, priorAlpha, priorBeta, targetSuccess, maxN });
        break;
      default:
        return;
    }
    setCalculation(result);
  };

  const handleClear = () => {
    clearCalculation();
    setPriorAlpha('1');
    setPriorBeta('1');
    setTargetPrecision('0.1');
    setCredibleLevel('95');
    setExpectedP('0.5');
    setPriorMean('5');
    setPriorSD('2');
    setDataSD('10');
    setExpectedMean('5');
    setClinicalThreshold('0');
    setSampleSize('100');
    setAlpha('0.05');
    setInterimN('50');
    setInterimSuccesses('30');
    setTargetSuccess('0.5');
    setMaxN('200');
  };

  // Generate chart data for Prior vs Posterior visualization
  const chartData = useMemo(() => {
    if (!calculation) return null;

    if (analysisType === 'mean' || analysisType === 'assurance') {
      const pMean = parseFloat(priorMean) || 0;
      const pSD = parseFloat(priorSD) || 1;
      const dSD = parseFloat(dataSD) || 10;
      const n = parseFloat(sampleSize) || 100;
      const expMean = parseFloat(expectedMean) || pMean;

      // Calculate posterior parameters
      const priorPrecision = 1 / (pSD * pSD);
      const dataPrecision = n / (dSD * dSD);
      const posteriorPrecision = priorPrecision + dataPrecision;
      const posteriorSD = Math.sqrt(1 / posteriorPrecision);
      const posteriorMean = (priorPrecision * pMean + dataPrecision * expMean) / posteriorPrecision;

      return {
        priorMean: pMean,
        posteriorMean: posteriorMean,
        priorSD: pSD,
        posteriorSD: posteriorSD
      };
    }

    return null;
  }, [calculation, analysisType, priorMean, priorSD, dataSD, sampleSize, expectedMean]);

  const renderInputs = () => {
    switch (analysisType) {
      case 'proportion':
        return (
          <>
            <div className="form-group-header">Prior Distribution: Beta(alpha, beta)</div>
            <div className="form-row">
              <FormInput
                label="Prior Alpha"
                value={priorAlpha}
                onChange={setPriorAlpha}
                type="number"
                min="0.1"
                step="0.5"
                tooltip="Alpha parameter of Beta prior (successes + 1)"
              />
              <FormInput
                label="Prior Beta"
                value={priorBeta}
                onChange={setPriorBeta}
                type="number"
                min="0.1"
                step="0.5"
                tooltip="Beta parameter of Beta prior (failures + 1)"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Expected Proportion"
                value={expectedP}
                onChange={setExpectedP}
                type="number"
                min="0.01"
                max="0.99"
                step="0.05"
                tooltip="Expected proportion in the data"
              />
              <FormInput
                label="Target Precision (±)"
                value={targetPrecision}
                onChange={setTargetPrecision}
                type="number"
                min="0.01"
                max="0.5"
                step="0.01"
                tooltip="Desired half-width of credible interval"
              />
            </div>
            <div className="form-row">
              <FormSelect
                label="Credible Level"
                value={credibleLevel}
                onChange={setCredibleLevel}
                options={CREDIBLE_OPTIONS}
                tooltip="Bayesian credible interval level"
              />
            </div>
          </>
        );

      case 'mean':
        return (
          <>
            <div className="form-group-header">Prior Distribution: Normal(mean, SD)</div>
            <div className="form-row">
              <FormInput
                label="Prior Mean"
                value={priorMean}
                onChange={setPriorMean}
                type="number"
                step="0.5"
                tooltip="Mean of normal prior"
              />
              <FormInput
                label="Prior SD"
                value={priorSD}
                onChange={setPriorSD}
                type="number"
                min="0.01"
                step="0.5"
                tooltip="Standard deviation of prior"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Data SD (known)"
                value={dataSD}
                onChange={setDataSD}
                type="number"
                min="0.01"
                step="0.5"
                tooltip="Known/assumed SD of the data"
              />
              <FormInput
                label="Expected Mean"
                value={expectedMean}
                onChange={setExpectedMean}
                type="number"
                step="0.5"
                tooltip="Expected sample mean"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Target Precision (±)"
                value={targetPrecision}
                onChange={setTargetPrecision}
                type="number"
                min="0.01"
                step="0.1"
                tooltip="Desired half-width of credible interval"
              />
              <FormSelect
                label="Credible Level"
                value={credibleLevel}
                onChange={setCredibleLevel}
                options={CREDIBLE_OPTIONS}
              />
            </div>
          </>
        );

      case 'assurance':
        return (
          <>
            <div className="form-group-header">Prior on Treatment Effect</div>
            <div className="form-row">
              <FormInput
                label="Prior Mean Effect"
                value={priorMean}
                onChange={setPriorMean}
                type="number"
                step="0.5"
                tooltip="Expected treatment effect (prior mean)"
              />
              <FormInput
                label="Prior SD"
                value={priorSD}
                onChange={setPriorSD}
                type="number"
                min="0.01"
                step="0.5"
                tooltip="Uncertainty in treatment effect"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Clinical Threshold"
                value={clinicalThreshold}
                onChange={setClinicalThreshold}
                type="number"
                step="0.5"
                tooltip="Minimum clinically meaningful effect"
              />
              <FormInput
                label="Data SD"
                value={dataSD}
                onChange={setDataSD}
                type="number"
                min="0.01"
                step="0.5"
                tooltip="Expected SD of observations"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Sample Size (per arm)"
                value={sampleSize}
                onChange={setSampleSize}
                type="number"
                min="10"
                step="10"
                tooltip="Planned sample size per group"
              />
              <FormInput
                label="Alpha Level"
                value={alpha}
                onChange={setAlpha}
                type="number"
                min="0.001"
                max="0.1"
                step="0.01"
                tooltip="Significance level for trial"
              />
            </div>
          </>
        );

      case 'adaptive':
        return (
          <>
            <div className="form-group-header">Interim Analysis Data</div>
            <div className="form-row">
              <FormInput
                label="Interim Sample Size"
                value={interimN}
                onChange={setInterimN}
                type="number"
                min="1"
                step="1"
                tooltip="Subjects enrolled at interim"
              />
              <FormInput
                label="Observed Successes"
                value={interimSuccesses}
                onChange={setInterimSuccesses}
                type="number"
                min="0"
                step="1"
                tooltip="Number of successes at interim"
              />
            </div>
            <div className="form-group-header">Prior and Target</div>
            <div className="form-row">
              <FormInput
                label="Prior Alpha"
                value={priorAlpha}
                onChange={setPriorAlpha}
                type="number"
                min="0.1"
                step="0.5"
                tooltip="Alpha parameter of Beta prior"
              />
              <FormInput
                label="Prior Beta"
                value={priorBeta}
                onChange={setPriorBeta}
                type="number"
                min="0.1"
                step="0.5"
                tooltip="Beta parameter of Beta prior"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Target Success Rate"
                value={targetSuccess}
                onChange={setTargetSuccess}
                type="number"
                min="0.01"
                max="0.99"
                step="0.05"
                tooltip="Target success rate for trial"
              />
              <FormInput
                label="Maximum Sample Size"
                value={maxN}
                onChange={setMaxN}
                type="number"
                min="10"
                step="10"
                tooltip="Maximum planned enrollment"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="calculator-page theme-gray">
      <CalculatorHeader
        title="Bayesian Analysis Calculator"
        description="Sample size and design calculations using Bayesian methods"
        icon="📈"
        navLinks={NAV_LINKS}
      />

      <main className="calculator-content">
        <div className="calculator-container">
          <div className="calculator-form-section">
            <div className="form-card">
              <h3 className="form-title">Bayesian Parameters</h3>

              <div className="form-row">
                <FormSelect
                  label="Analysis Type"
                  value={analysisType}
                  onChange={setAnalysisType}
                  options={ANALYSIS_TYPES}
                  tooltip="Select the Bayesian analysis type"
                />
              </div>

              {renderInputs()}

              <CalculatorButtons
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
            </div>

            <div className="info-card">
              <h4>Common Priors</h4>
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Prior</th>
                    <th>Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Beta(1,1)</td><td>Non-informative (uniform)</td></tr>
                  <tr><td>Beta(0.5,0.5)</td><td>Jeffreys prior</td></tr>
                  <tr><td>Beta(2,2)</td><td>Weakly informative, centered at 0.5</td></tr>
                  <tr><td>Normal(0, 10)</td><td>Weakly informative for effects</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {calculation && (
            <div className="calculator-results-section">
              <ResultsSection
                title="Bayesian Analysis Results"
                onExport={() => setShowExportModal(true)}
              >
                <ResultGrid>
                  {Object.entries(calculation.results).map(([key, value]) => (
                    <ResultCard
                      key={key}
                      label={key}
                      value={value}
                      isPrimary={key.includes('Sample') || key.includes('Assurance') || key.includes('Posterior Mean')}
                    />
                  ))}
                </ResultGrid>

                {/* Bayesian Distribution Chart */}
                {chartData && (
                  <div className="chart-section" style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Prior vs Posterior Distribution</h4>
                    <BayesianChart
                      priorMean={chartData.priorMean}
                      posteriorMean={chartData.posteriorMean}
                      priorSD={chartData.priorSD}
                      posteriorSD={chartData.posteriorSD}
                      theme={theme}
                    />
                  </div>
                )}

                <FormulaSection
                  formula={calculation.formula}
                  explanation={calculation.formulaExplanation}
                />

                <StepsSection steps={calculation.steps} />

                <InterpretationBox text={calculation.interpretation} />

                <RecommendationsSection recommendations={calculation.recommendations} />

                <ReferenceSection reference={calculation.reference} />
              </ResultsSection>
            </div>
          )}
        </div>
      </main>

      <SimpleFooter />
      <ThemeToggle />

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExportPDF={() => {
            exportToPDF(theme, calculation);
            setShowExportModal(false);
          }}
          onCopyClipboard={() => {
            copyToClipboard(calculation);
            setShowExportModal(false);
          }}
        />
      )}
    </div>
  );
}
