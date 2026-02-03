import { useState, useMemo } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons, ResultsSection, ResultGrid, ResultCard, FormulaSection, StepsSection, InterpretationBox, RecommendationsSection, ReferenceSection, ExportModal } from '../components/calculators';
import { AgreementChart } from '../components/charts';
import { useCalculator } from '../hooks/useCalculator';
import { calculateKappaSampleSize, calculateICCSampleSize, calculateBlandAltmanSampleSize, calculateKappaFromTable } from '../calculators/agreement';
import { exportToPDF, copyToClipboard } from '../utils/pdfExport';
import '../components/calculators/CalculatorForm.css';

const ALPHA_OPTIONS = [
  { value: '0.05', label: '0.05 (5%)' },
  { value: '0.01', label: '0.01 (1%)' },
  { value: '0.10', label: '0.10 (10%)' }
];

const POWER_OPTIONS = [
  { value: '80', label: '80%' },
  { value: '90', label: '90%' },
  { value: '95', label: '95%' }
];

const ANALYSIS_TYPES = [
  { value: 'kappa-sample', label: "Cohen's Kappa Sample Size" },
  { value: 'kappa-table', label: 'Kappa from 2×2 Table' },
  { value: 'icc', label: 'ICC Sample Size' },
  { value: 'bland-altman', label: 'Bland-Altman Sample Size' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/diagnostic', label: 'Diagnostic' },
  { to: '/references', label: 'References' }
];

export function AgreementCalculator() {
  const [analysisType, setAnalysisType] = useState('kappa-sample');
  const [showExportModal, setShowExportModal] = useState(false);
  const { calculation, setCalculation, theme, clearCalculation } = useCalculator();

  // Kappa sample size inputs
  const [kappa0, setKappa0] = useState('0.4');
  const [kappa1, setKappa1] = useState('0.7');
  const [prevalence, setPrevalence] = useState('0.5');
  const [numCategories, setNumCategories] = useState('2');

  // Kappa from table inputs
  const [cellA, setCellA] = useState('40');
  const [cellB, setCellB] = useState('10');
  const [cellC, setCellC] = useState('8');
  const [cellD, setCellD] = useState('42');

  // ICC inputs
  const [icc0, setIcc0] = useState('0.5');
  const [icc1, setIcc1] = useState('0.8');
  const [numRaters, setNumRaters] = useState('2');

  // Bland-Altman inputs
  const [expectedBias, setExpectedBias] = useState('0');
  const [loaWidth, setLoaWidth] = useState('10');
  const [precision, setPrecision] = useState('2');

  // Common
  const [alpha, setAlpha] = useState('0.05');
  const [power, setPower] = useState('80');

  const handleCalculate = () => {
    let result;
    switch (analysisType) {
      case 'kappa-sample':
        result = calculateKappaSampleSize({ kappa0, kappa1, alpha, power, prevalence, numCategories });
        break;
      case 'kappa-table':
        result = calculateKappaFromTable({ a: cellA, b: cellB, c: cellC, d: cellD });
        break;
      case 'icc':
        result = calculateICCSampleSize({ icc0, icc1, alpha, power, numRaters });
        break;
      case 'bland-altman':
        result = calculateBlandAltmanSampleSize({ expectedBias, loaWidth, precision, alpha });
        break;
      default:
        return;
    }
    setCalculation(result);
  };

  const handleClear = () => {
    clearCalculation();
    setKappa0('0.4');
    setKappa1('0.7');
    setPrevalence('0.5');
    setNumCategories('2');
    setCellA('40');
    setCellB('10');
    setCellC('8');
    setCellD('42');
    setIcc0('0.5');
    setIcc1('0.8');
    setNumRaters('2');
    setExpectedBias('0');
    setLoaWidth('10');
    setPrecision('2');
    setAlpha('0.05');
    setPower('80');
  };

  // Generate agreement chart data
  const agreementChartData = useMemo(() => {
    if (!calculation) return null;

    // For Kappa calculations from table
    if (analysisType === 'kappa-table') {
      const kappaValue = parseFloat(calculation.results['Kappa']) || 0;
      return {
        icc: kappaValue,
        lowerBound: kappaValue - 0.1,
        upperBound: kappaValue + 0.1
      };
    }

    // For ICC calculations
    if (analysisType === 'icc') {
      const iccValue = parseFloat(icc1) || 0.8;
      return {
        icc: iccValue,
        lowerBound: iccValue - 0.15,
        upperBound: iccValue + 0.1
      };
    }

    return null;
  }, [calculation, analysisType, icc1]);

  const renderInputs = () => {
    switch (analysisType) {
      case 'kappa-sample':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Null Kappa (kappa0)"
                value={kappa0}
                onChange={setKappa0}
                type="number"
                min="0"
                max="0.99"
                step="0.05"
                tooltip="Kappa under null hypothesis"
              />
              <FormInput
                label="Alternative Kappa (kappa1)"
                value={kappa1}
                onChange={setKappa1}
                type="number"
                min="0.01"
                max="1"
                step="0.05"
                tooltip="Expected kappa to detect"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Prevalence"
                value={prevalence}
                onChange={setPrevalence}
                type="number"
                min="0.01"
                max="0.99"
                step="0.05"
                tooltip="Proportion of positive cases"
              />
              <FormInput
                label="Number of Categories"
                value={numCategories}
                onChange={setNumCategories}
                type="number"
                min="2"
                max="10"
                step="1"
                tooltip="Number of rating categories"
              />
            </div>
            <div className="form-row">
              <FormSelect
                label="Significance Level (α)"
                value={alpha}
                onChange={setAlpha}
                options={ALPHA_OPTIONS}
              />
              <FormSelect
                label="Power (1-β)"
                value={power}
                onChange={setPower}
                options={POWER_OPTIONS}
              />
            </div>
          </>
        );

      case 'kappa-table':
        return (
          <>
            <div className="form-group-header">2×2 Agreement Table (Both raters rating same subjects)</div>
            <div className="form-row">
              <FormInput
                label="a: Both Positive"
                value={cellA}
                onChange={setCellA}
                type="number"
                min="0"
                step="1"
                tooltip="Both raters said positive"
              />
              <FormInput
                label="b: Rater 1 Pos, Rater 2 Neg"
                value={cellB}
                onChange={setCellB}
                type="number"
                min="0"
                step="1"
                tooltip="Rater 1 positive, Rater 2 negative"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="c: Rater 1 Neg, Rater 2 Pos"
                value={cellC}
                onChange={setCellC}
                type="number"
                min="0"
                step="1"
                tooltip="Rater 1 negative, Rater 2 positive"
              />
              <FormInput
                label="d: Both Negative"
                value={cellD}
                onChange={setCellD}
                type="number"
                min="0"
                step="1"
                tooltip="Both raters said negative"
              />
            </div>
          </>
        );

      case 'icc':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Null ICC (rho0)"
                value={icc0}
                onChange={setIcc0}
                type="number"
                min="0"
                max="0.99"
                step="0.05"
                tooltip="ICC under null hypothesis"
              />
              <FormInput
                label="Alternative ICC (rho1)"
                value={icc1}
                onChange={setIcc1}
                type="number"
                min="0.01"
                max="0.99"
                step="0.05"
                tooltip="Expected ICC to detect"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Number of Raters"
                value={numRaters}
                onChange={setNumRaters}
                type="number"
                min="2"
                max="20"
                step="1"
                tooltip="Number of raters per subject"
              />
            </div>
            <div className="form-row">
              <FormSelect
                label="Significance Level (α)"
                value={alpha}
                onChange={setAlpha}
                options={ALPHA_OPTIONS}
              />
              <FormSelect
                label="Power (1-β)"
                value={power}
                onChange={setPower}
                options={POWER_OPTIONS}
              />
            </div>
          </>
        );

      case 'bland-altman':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Expected Bias"
                value={expectedBias}
                onChange={setExpectedBias}
                type="number"
                step="0.1"
                tooltip="Expected mean difference between methods"
              />
              <FormInput
                label="Expected LOA Width"
                value={loaWidth}
                onChange={setLoaWidth}
                type="number"
                min="0.01"
                step="0.5"
                tooltip="Expected width of limits of agreement (both sides)"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Desired Precision"
                value={precision}
                onChange={setPrecision}
                type="number"
                min="0.01"
                step="0.1"
                tooltip="Desired precision for estimates"
              />
              <FormSelect
                label="Confidence Level"
                value={alpha}
                onChange={setAlpha}
                options={ALPHA_OPTIONS}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="calculator-page theme-cyan">
      <CalculatorHeader
        title="Agreement Studies Calculator"
        description="Calculate sample sizes and statistics for inter-rater reliability and method comparison studies"
        icon="🤝"
        navLinks={NAV_LINKS}
      />

      <main className="calculator-content">
        <div className="calculator-container">
          <div className="calculator-form-section">
            <div className="form-card">
              <h3 className="form-title">Agreement Analysis Parameters</h3>

              <div className="form-row">
                <FormSelect
                  label="Analysis Type"
                  value={analysisType}
                  onChange={setAnalysisType}
                  options={ANALYSIS_TYPES}
                  tooltip="Select the type of agreement analysis"
                />
              </div>

              {renderInputs()}

              <CalculatorButtons
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
            </div>

            <div className="info-card">
              <h4>Agreement Interpretation</h4>
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Kappa</th>
                    <th>ICC</th>
                    <th>Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>&lt; 0.20</td><td>&lt; 0.50</td><td>Poor</td></tr>
                  <tr><td>0.21-0.40</td><td>0.50-0.75</td><td>Fair/Moderate</td></tr>
                  <tr><td>0.41-0.60</td><td>0.75-0.90</td><td>Moderate/Good</td></tr>
                  <tr><td>0.61-0.80</td><td>&gt; 0.90</td><td>Substantial/Excellent</td></tr>
                  <tr><td>&gt; 0.80</td><td>-</td><td>Almost Perfect</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {calculation && (
            <div className="calculator-results-section">
              <ResultsSection
                title="Agreement Analysis Results"
                onExport={() => setShowExportModal(true)}
              >
                <ResultGrid>
                  {Object.entries(calculation.results).map(([key, value]) => (
                    <ResultCard
                      key={key}
                      label={key}
                      value={value}
                      isPrimary={key.includes('Sample') || key.includes('Kappa') || key.includes('ICC')}
                    />
                  ))}
                </ResultGrid>

                {/* Agreement Chart */}
                {agreementChartData && (
                  <div className="chart-section" style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Agreement Level</h4>
                    <AgreementChart
                      icc={agreementChartData.icc}
                      lowerBound={agreementChartData.lowerBound}
                      upperBound={agreementChartData.upperBound}
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
