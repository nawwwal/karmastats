import { useState, useMemo } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons, ResultsSection, ResultGrid, ResultCard, FormulaSection, StepsSection, InterpretationBox, RecommendationsSection, ReferenceSection, ExportModal } from '../components/calculators';
import { PowerCurveChart } from '../components/charts';
import { useCalculator } from '../hooks/useCalculator';
import { calculatePostHocPower, calculateSampleForPower, calculateDetectableEffect, calculateANOVAPower } from '../calculators/power';
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
  { value: 'post-hoc', label: 'Post-hoc Power Analysis' },
  { value: 'sample-size', label: 'Sample Size for Power' },
  { value: 'detectable', label: 'Minimum Detectable Effect' },
  { value: 'anova', label: 'ANOVA Power Analysis' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/effect-size', label: 'Effect Size' },
  { to: '/references', label: 'References' }
];

// Helper function to calculate power
function normalCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

function normalInv(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q, r;
  if (p < pLow) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  else if (p <= pHigh) { q = p - 0.5; r = q * q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
  else { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
}

function calculatePowerValue(n, effectSize, alpha) {
  const zAlpha = normalInv(1 - alpha / 2);
  const ncp = effectSize * Math.sqrt(n / 2);
  return normalCDF(ncp - zAlpha) * 100;
}

export function PowerCalculator() {
  const [analysisType, setAnalysisType] = useState('sample-size');
  const [showExportModal, setShowExportModal] = useState(false);
  const { calculation, setCalculation, theme, clearCalculation } = useCalculator();

  // Common inputs
  const [alpha, setAlpha] = useState('0.05');
  const [power, setPower] = useState('80');
  const [effectSize, setEffectSize] = useState('0.5');
  const [ratio, setRatio] = useState('1');

  // Sample size inputs
  const [n1, setN1] = useState('50');
  const [n2, setN2] = useState('50');

  // ANOVA inputs
  const [groups, setGroups] = useState('3');
  const [nPerGroup, setNPerGroup] = useState('30');

  // Generate power curve data
  const powerCurveData = useMemo(() => {
    if (!calculation) return [];

    const d = parseFloat(effectSize) || 0.5;
    const alphaVal = parseFloat(alpha) || 0.05;

    // Generate power for different sample sizes
    const data = [];
    const sampleSizes = [10, 20, 30, 50, 75, 100, 150, 200, 300, 500];

    for (const n of sampleSizes) {
      const powerVal = calculatePowerValue(n, d, alphaVal);
      data.push({
        param: n.toString(),
        power: powerVal.toFixed(1)
      });
    }

    return data;
  }, [calculation, effectSize, alpha]);

  const handleCalculate = () => {
    let result;
    switch (analysisType) {
      case 'post-hoc':
        result = calculatePostHocPower({ n1, n2, effectSize, alpha });
        break;
      case 'sample-size':
        result = calculateSampleForPower({ effectSize, alpha, power, ratio });
        break;
      case 'detectable':
        result = calculateDetectableEffect({ n1, n2, alpha, power });
        break;
      case 'anova':
        result = calculateANOVAPower({ groups, nPerGroup, effectSize, alpha });
        break;
      default:
        return;
    }
    setCalculation(result);
  };

  const handleClear = () => {
    clearCalculation();
    setAlpha('0.05');
    setPower('80');
    setEffectSize('0.5');
    setRatio('1');
    setN1('50');
    setN2('50');
    setGroups('3');
    setNPerGroup('30');
  };

  const renderInputs = () => {
    switch (analysisType) {
      case 'post-hoc':
        return (
          <>
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
            <div className="form-row">
              <FormInput
                label="Effect Size (Cohen's d)"
                value={effectSize}
                onChange={setEffectSize}
                type="number"
                min="0.01"
                max="3"
                step="0.1"
                tooltip="0.2=small, 0.5=medium, 0.8=large"
              />
              <FormSelect
                label="Significance Level (α)"
                value={alpha}
                onChange={setAlpha}
                options={ALPHA_OPTIONS}
                tooltip="Type I error rate"
              />
            </div>
          </>
        );

      case 'sample-size':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Effect Size (Cohen's d)"
                value={effectSize}
                onChange={setEffectSize}
                type="number"
                min="0.01"
                max="3"
                step="0.1"
                tooltip="0.2=small, 0.5=medium, 0.8=large"
              />
              <FormInput
                label="Allocation Ratio"
                value={ratio}
                onChange={setRatio}
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                tooltip="Ratio of n2 to n1 (1 = equal groups)"
              />
            </div>
            <div className="form-row">
              <FormSelect
                label="Significance Level (α)"
                value={alpha}
                onChange={setAlpha}
                options={ALPHA_OPTIONS}
                tooltip="Type I error rate"
              />
              <FormSelect
                label="Desired Power (1-β)"
                value={power}
                onChange={setPower}
                options={POWER_OPTIONS}
                tooltip="Probability of detecting true effect"
              />
            </div>
          </>
        );

      case 'detectable':
        return (
          <>
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
            <div className="form-row">
              <FormSelect
                label="Significance Level (α)"
                value={alpha}
                onChange={setAlpha}
                options={ALPHA_OPTIONS}
                tooltip="Type I error rate"
              />
              <FormSelect
                label="Desired Power (1-β)"
                value={power}
                onChange={setPower}
                options={POWER_OPTIONS}
                tooltip="Probability of detecting true effect"
              />
            </div>
          </>
        );

      case 'anova':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Number of Groups"
                value={groups}
                onChange={setGroups}
                type="number"
                min="2"
                max="20"
                step="1"
                tooltip="Number of groups/levels"
              />
              <FormInput
                label="Sample Size per Group"
                value={nPerGroup}
                onChange={setNPerGroup}
                type="number"
                min="2"
                step="1"
                tooltip="Number of participants per group"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Effect Size (Cohen's f)"
                value={effectSize}
                onChange={setEffectSize}
                type="number"
                min="0.01"
                max="2"
                step="0.05"
                tooltip="0.10=small, 0.25=medium, 0.40=large"
              />
              <FormSelect
                label="Significance Level (α)"
                value={alpha}
                onChange={setAlpha}
                options={ALPHA_OPTIONS}
                tooltip="Type I error rate"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="calculator-page theme-purple">
      <CalculatorHeader
        title="Power Analysis"
        description="Calculate statistical power, sample sizes, and minimum detectable effects"
        icon="⚡"
        navLinks={NAV_LINKS}
      />

      <main className="calculator-content">
        <div className="calculator-container">
          <div className="calculator-form-section">
            <div className="form-card">
              <h3 className="form-title">Analysis Parameters</h3>

              <div className="form-row">
                <FormSelect
                  label="Analysis Type"
                  value={analysisType}
                  onChange={setAnalysisType}
                  options={ANALYSIS_TYPES}
                  tooltip="Select the type of power analysis"
                />
              </div>

              {renderInputs()}

              <CalculatorButtons
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
            </div>

            <div className="info-card">
              <h4>Effect Size Guidelines (Cohen)</h4>
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Cohen's d</th>
                    <th>Cohen's f</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Small</td><td>0.20</td><td>0.10</td></tr>
                  <tr><td>Medium</td><td>0.50</td><td>0.25</td></tr>
                  <tr><td>Large</td><td>0.80</td><td>0.40</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {calculation && (
            <div className="calculator-results-section">
              <ResultsSection
                title="Power Analysis Results"
                onExport={() => setShowExportModal(true)}
              >
                <ResultGrid>
                  {Object.entries(calculation.results).map(([key, value]) => (
                    <ResultCard
                      key={key}
                      label={key}
                      value={value}
                      isPrimary={key.includes('Power') || key.includes('Sample') || key.includes('Effect')}
                    />
                  ))}
                </ResultGrid>

                {/* Power Curve Chart */}
                {powerCurveData.length > 0 && (
                  <div className="chart-section" style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Power vs Sample Size</h4>
                    <PowerCurveChart
                      data={powerCurveData}
                      analysisType="sample-size"
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
