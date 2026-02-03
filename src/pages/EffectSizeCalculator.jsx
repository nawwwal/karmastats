import { useState, useMemo } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons, ResultsSection, ResultGrid, ResultCard, FormulaSection, StepsSection, InterpretationBox, RecommendationsSection, ReferenceSection, ExportModal } from '../components/calculators';
import { EffectSizeBarChart } from '../components/charts';
import { useCalculator } from '../hooks/useCalculator';
import { calculateCohensD, calculateHedgesG, calculateOddsRatioES, calculateRFromT, calculateEtaSquared } from '../calculators/effectSize';
import { exportToPDF, copyToClipboard } from '../utils/pdfExport';
import '../components/calculators/CalculatorForm.css';

const EFFECT_TYPES = [
  { value: 'cohens-d', label: "Cohen's d (Mean Difference)" },
  { value: 'hedges-g', label: "Hedges' g (Bias-Corrected)" },
  { value: 'odds-ratio', label: 'Odds Ratio' },
  { value: 'r-from-t', label: 'Correlation r from t-statistic' },
  { value: 'eta-squared', label: 'Eta-squared (ANOVA)' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/power', label: 'Power Analysis' },
  { to: '/references', label: 'References' }
];

export function EffectSizeCalculator() {
  const [effectType, setEffectType] = useState('cohens-d');
  const [showExportModal, setShowExportModal] = useState(false);
  const { calculation, setCalculation, theme, clearCalculation } = useCalculator();

  // Cohen's d / Hedges' g inputs
  const [mean1, setMean1] = useState('75');
  const [mean2, setMean2] = useState('70');
  const [sd1, setSd1] = useState('10');
  const [sd2, setSd2] = useState('10');
  const [n1, setN1] = useState('50');
  const [n2, setN2] = useState('50');

  // Odds Ratio inputs
  const [cellA, setCellA] = useState('40');
  const [cellB, setCellB] = useState('60');
  const [cellC, setCellC] = useState('20');
  const [cellD, setCellD] = useState('80');

  // r from t inputs
  const [tValue, setTValue] = useState('2.5');
  const [df, setDf] = useState('98');

  // Eta-squared inputs
  const [ssEffect, setSsEffect] = useState('150');
  const [ssError, setSsError] = useState('850');
  const [ssTotal, setSsTotal] = useState('1000');
  const [dfEffect, setDfEffect] = useState('2');
  const [dfError, setDfError] = useState('97');

  const handleCalculate = () => {
    let result;
    switch (effectType) {
      case 'cohens-d':
        result = calculateCohensD({ mean1, mean2, sd1, sd2, n1, n2 });
        break;
      case 'hedges-g':
        result = calculateHedgesG({ mean1, mean2, sd1, sd2, n1, n2 });
        break;
      case 'odds-ratio':
        result = calculateOddsRatioES({ a: cellA, b: cellB, c: cellC, d: cellD });
        break;
      case 'r-from-t':
        result = calculateRFromT({ tValue, df });
        break;
      case 'eta-squared':
        result = calculateEtaSquared({ ssEffect, ssError, ssTotal, dfEffect, dfError });
        break;
      default:
        return;
    }
    setCalculation(result);
  };

  const handleClear = () => {
    clearCalculation();
    setMean1('75');
    setMean2('70');
    setSd1('10');
    setSd2('10');
    setN1('50');
    setN2('50');
    setCellA('40');
    setCellB('60');
    setCellC('20');
    setCellD('80');
    setTValue('2.5');
    setDf('98');
    setSsEffect('150');
    setSsError('850');
    setSsTotal('1000');
    setDfEffect('2');
    setDfError('97');
  };

  // Generate effect size comparison chart data
  const effectSizeChartData = useMemo(() => {
    if (!calculation) return null;

    // Get the calculated effect size value
    let effectValue = 0;
    if (effectType === 'cohens-d' && calculation.results["Cohen's d"]) {
      effectValue = parseFloat(calculation.results["Cohen's d"]);
    } else if (effectType === 'hedges-g' && calculation.results["Hedges' g"]) {
      effectValue = parseFloat(calculation.results["Hedges' g"]);
    } else if (effectType === 'r-from-t' && calculation.results["Correlation r"]) {
      effectValue = parseFloat(calculation.results["Correlation r"]);
    }

    if (effectType === 'cohens-d' || effectType === 'hedges-g') {
      // Show power at different effect sizes for comparison
      return [
        { param: '0.2 (Small)', power: '29' },
        { param: effectValue.toFixed(2) + ' (Your d)', power: String(Math.min(99, 20 + effectValue * 80).toFixed(0)) },
        { param: '0.5 (Medium)', power: '70' },
        { param: '0.8 (Large)', power: '94' }
      ];
    }

    return null;
  }, [calculation, effectType]);

  const renderInputs = () => {
    switch (effectType) {
      case 'cohens-d':
      case 'hedges-g':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Group 1 Mean"
                value={mean1}
                onChange={setMean1}
                type="number"
                step="0.1"
                tooltip="Mean of group 1 (treatment/experimental)"
              />
              <FormInput
                label="Group 2 Mean"
                value={mean2}
                onChange={setMean2}
                type="number"
                step="0.1"
                tooltip="Mean of group 2 (control)"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Group 1 SD"
                value={sd1}
                onChange={setSd1}
                type="number"
                min="0.01"
                step="0.1"
                tooltip="Standard deviation of group 1"
              />
              <FormInput
                label="Group 2 SD"
                value={sd2}
                onChange={setSd2}
                type="number"
                min="0.01"
                step="0.1"
                tooltip="Standard deviation of group 2"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Group 1 Sample Size"
                value={n1}
                onChange={setN1}
                type="number"
                min="2"
                step="1"
                tooltip="Number of participants in group 1"
              />
              <FormInput
                label="Group 2 Sample Size"
                value={n2}
                onChange={setN2}
                type="number"
                min="2"
                step="1"
                tooltip="Number of participants in group 2"
              />
            </div>
          </>
        );

      case 'odds-ratio':
        return (
          <>
            <div className="form-group-header">2×2 Contingency Table</div>
            <div className="form-row">
              <FormInput
                label="a: Exposed + Outcome"
                value={cellA}
                onChange={setCellA}
                type="number"
                min="1"
                step="1"
                tooltip="Count in exposed group with outcome"
              />
              <FormInput
                label="b: Exposed + No Outcome"
                value={cellB}
                onChange={setCellB}
                type="number"
                min="1"
                step="1"
                tooltip="Count in exposed group without outcome"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="c: Not Exposed + Outcome"
                value={cellC}
                onChange={setCellC}
                type="number"
                min="1"
                step="1"
                tooltip="Count in unexposed group with outcome"
              />
              <FormInput
                label="d: Not Exposed + No Outcome"
                value={cellD}
                onChange={setCellD}
                type="number"
                min="1"
                step="1"
                tooltip="Count in unexposed group without outcome"
              />
            </div>
          </>
        );

      case 'r-from-t':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="t-value"
                value={tValue}
                onChange={setTValue}
                type="number"
                step="0.01"
                tooltip="t-statistic from t-test"
              />
              <FormInput
                label="Degrees of Freedom"
                value={df}
                onChange={setDf}
                type="number"
                min="1"
                step="1"
                tooltip="df = n1 + n2 - 2 for independent t-test"
              />
            </div>
          </>
        );

      case 'eta-squared':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="SS Effect"
                value={ssEffect}
                onChange={setSsEffect}
                type="number"
                min="0"
                step="1"
                tooltip="Sum of squares for the effect"
              />
              <FormInput
                label="SS Error"
                value={ssError}
                onChange={setSsError}
                type="number"
                min="0"
                step="1"
                tooltip="Sum of squares for error (within groups)"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="SS Total"
                value={ssTotal}
                onChange={setSsTotal}
                type="number"
                min="0"
                step="1"
                tooltip="Total sum of squares (leave 0 to auto-calculate)"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="df Effect"
                value={dfEffect}
                onChange={setDfEffect}
                type="number"
                min="1"
                step="1"
                tooltip="Degrees of freedom for effect (k-1)"
              />
              <FormInput
                label="df Error"
                value={dfError}
                onChange={setDfError}
                type="number"
                min="1"
                step="1"
                tooltip="Degrees of freedom for error (N-k)"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="calculator-page theme-pink">
      <CalculatorHeader
        title="Effect Size Calculator"
        description="Calculate and interpret various effect size measures"
        icon="📊"
        navLinks={NAV_LINKS}
      />

      <main className="calculator-content">
        <div className="calculator-container">
          <div className="calculator-form-section">
            <div className="form-card">
              <h3 className="form-title">Effect Size Parameters</h3>

              <div className="form-row">
                <FormSelect
                  label="Effect Size Type"
                  value={effectType}
                  onChange={setEffectType}
                  options={EFFECT_TYPES}
                  tooltip="Select the type of effect size to calculate"
                />
              </div>

              {renderInputs()}

              <CalculatorButtons
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
            </div>

            <div className="info-card">
              <h4>Effect Size Benchmarks (Cohen)</h4>
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Measure</th>
                    <th>Small</th>
                    <th>Medium</th>
                    <th>Large</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>d / g</td><td>0.20</td><td>0.50</td><td>0.80</td></tr>
                  <tr><td>r</td><td>0.10</td><td>0.30</td><td>0.50</td></tr>
                  <tr><td>eta²</td><td>0.01</td><td>0.06</td><td>0.14</td></tr>
                  <tr><td>f</td><td>0.10</td><td>0.25</td><td>0.40</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {calculation && (
            <div className="calculator-results-section">
              <ResultsSection
                title="Effect Size Results"
                onExport={() => setShowExportModal(true)}
              >
                <ResultGrid>
                  {Object.entries(calculation.results).map(([key, value]) => (
                    <ResultCard
                      key={key}
                      label={key}
                      value={value}
                      isPrimary={key.includes("Cohen") || key.includes("Hedges") || key.includes("Odds") || key.includes("Correlation") || key.includes("Eta")}
                    />
                  ))}
                </ResultGrid>

                {/* Effect Size Comparison Chart */}
                {effectSizeChartData && (
                  <div className="chart-section" style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Effect Size Comparison</h4>
                    <EffectSizeBarChart
                      data={effectSizeChartData}
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
