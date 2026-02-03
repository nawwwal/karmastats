import { useState } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons, ResultsSection, ResultGrid, ResultCard, FormulaSection, InterpretationBox, RecommendationsSection } from '../components/calculators';
import { PowerCurveChart, EffectSizeBarChart } from '../components/charts';
import { useCalculator } from '../hooks/useCalculator';
import { exportToPDF, copyToClipboard } from '../utils/pdfExport';
import '../components/calculators/CalculatorForm.css';

const ANALYSIS_TYPES = [
  { value: 'sample-size', label: 'Sample Size Sensitivity' },
  { value: 'effect-size', label: 'Effect Size Sensitivity' },
  { value: 'power', label: 'Power Sensitivity' },
  { value: 'dropout', label: 'Dropout Rate Sensitivity' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/power', label: 'Power Analysis' },
  { to: '/references', label: 'References' }
];

export function SensitivityAnalysis() {
  const [analysisType, setAnalysisType] = useState('sample-size');
  const [showExportModal, setShowExportModal] = useState(false);
  const { calculation, setCalculation, theme, clearCalculation } = useCalculator();

  // Base parameters
  const [baseN, setBaseN] = useState('100');
  const [basePower, setBasePower] = useState('80');
  const [baseEffect, setBaseEffect] = useState('0.5');
  const [baseAlpha, setBaseAlpha] = useState('0.05');
  const [baseDropout, setBaseDropout] = useState('10');

  // Range parameters
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [rangeSteps, setRangeSteps] = useState('5');

  const normalInv = (p) => {
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
  };

  const normalCDF = (x) => {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1.0 + sign * y);
  };

  const calculatePower = (n, d, alpha) => {
    const zAlpha = normalInv(1 - alpha / 2);
    const ncp = d * Math.sqrt(n / 2);
    return normalCDF(ncp - zAlpha) * 100;
  };

  const calculateSampleSize = (power, d, alpha) => {
    const zAlpha = normalInv(1 - alpha / 2);
    const zBeta = normalInv(power / 100);
    return Math.ceil(2 * Math.pow((zAlpha + zBeta) / d, 2));
  };

  const handleCalculate = () => {
    const n = parseInt(baseN);
    const power = parseFloat(basePower);
    const d = parseFloat(baseEffect);
    const alpha = parseFloat(baseAlpha);
    const dropout = parseFloat(baseDropout);
    const steps = parseInt(rangeSteps);

    let results = [];
    let sensitivityData = [];
    let paramName = '';
    let baseValue = 0;

    switch (analysisType) {
      case 'sample-size': {
        paramName = 'Sample Size';
        baseValue = n;
        const min = parseInt(rangeMin) || Math.round(n * 0.5);
        const max = parseInt(rangeMax) || Math.round(n * 2);
        const step = (max - min) / (steps - 1);

        for (let i = 0; i < steps; i++) {
          const testN = Math.round(min + i * step);
          const testPower = calculatePower(testN, d, alpha);
          sensitivityData.push({ param: testN, power: testPower.toFixed(1) });
        }
        break;
      }
      case 'effect-size': {
        paramName = 'Effect Size (d)';
        baseValue = d;
        const min = parseFloat(rangeMin) || 0.2;
        const max = parseFloat(rangeMax) || 1.0;
        const step = (max - min) / (steps - 1);

        for (let i = 0; i < steps; i++) {
          const testD = min + i * step;
          const testPower = calculatePower(n, testD, alpha);
          sensitivityData.push({ param: testD.toFixed(2), power: testPower.toFixed(1) });
        }
        break;
      }
      case 'power': {
        paramName = 'Power (%)';
        baseValue = power;
        const min = parseFloat(rangeMin) || 70;
        const max = parseFloat(rangeMax) || 95;
        const step = (max - min) / (steps - 1);

        for (let i = 0; i < steps; i++) {
          const testPower = min + i * step;
          const testN = calculateSampleSize(testPower, d, alpha);
          sensitivityData.push({ param: testPower.toFixed(0), sampleSize: testN });
        }
        break;
      }
      case 'dropout': {
        paramName = 'Dropout Rate (%)';
        baseValue = dropout;
        const min = parseFloat(rangeMin) || 0;
        const max = parseFloat(rangeMax) || 30;
        const step = (max - min) / (steps - 1);

        for (let i = 0; i < steps; i++) {
          const testDropout = min + i * step;
          const adjustedN = Math.ceil(n / (1 - testDropout / 100));
          sensitivityData.push({ param: testDropout.toFixed(0), adjustedN: adjustedN });
        }
        break;
      }
    }

    const result = {
      studyType: 'Sensitivity Analysis',
      type: 'sensitivity-' + analysisType,
      method: `Sensitivity Analysis - ${paramName}`,
      inputs: {
        'Base Sample Size': n,
        'Base Power': `${power}%`,
        'Base Effect Size': d,
        'Alpha Level': alpha,
        'Dropout Rate': `${dropout}%`,
        'Analysis Variable': paramName
      },
      formula: 'Varying ' + paramName + ' to assess impact on study parameters',
      formulaExplanation: 'Systematic variation of input parameters to understand sensitivity',
      steps: sensitivityData.map((item, i) => ({
        title: `Scenario ${i + 1}`,
        calc: analysisType === 'power'
          ? `${paramName} = ${item.param}% -> N = ${item.sampleSize}`
          : analysisType === 'dropout'
          ? `${paramName} = ${item.param}% -> Adjusted N = ${item.adjustedN}`
          : `${paramName} = ${item.param} -> Power = ${item.power}%`
      })),
      results: {
        'Analysis Type': paramName,
        'Base Value': baseValue,
        'Scenarios Tested': steps,
        'Min Value Tested': sensitivityData[0].param,
        'Max Value Tested': sensitivityData[sensitivityData.length - 1].param
      },
      interpretation: `Sensitivity analysis shows how ${paramName.toLowerCase()} affects study outcomes. ${
        analysisType === 'sample-size'
          ? `Power ranges from ${sensitivityData[0].power}% to ${sensitivityData[sensitivityData.length-1].power}% across the sample size range.`
          : analysisType === 'effect-size'
          ? `Smaller effect sizes require substantially larger samples to maintain power.`
          : analysisType === 'power'
          ? `Higher power requirements increase sample size needs significantly.`
          : `Higher dropout rates require larger initial enrollment to maintain final sample size.`
      }`,
      recommendations: [
        'Use sensitivity analysis to plan for uncertainty',
        'Consider worst-case scenarios in planning',
        'Document assumptions and their impact',
        'Plan adaptive designs if high uncertainty'
      ],
      reference: 'Sackett, D. L. (1979). Bias in analytic research. Journal of Chronic Diseases, 32(1-2), 51-63.',
      sensitivityTable: sensitivityData
    };

    setCalculation(result);
  };

  const handleClear = () => {
    clearCalculation();
    setBaseN('100');
    setBasePower('80');
    setBaseEffect('0.5');
    setBaseAlpha('0.05');
    setBaseDropout('10');
    setRangeMin('');
    setRangeMax('');
    setRangeSteps('5');
  };

  const getDefaultRange = () => {
    switch (analysisType) {
      case 'sample-size': return { min: Math.round(parseInt(baseN) * 0.5), max: Math.round(parseInt(baseN) * 2) };
      case 'effect-size': return { min: 0.2, max: 1.0 };
      case 'power': return { min: 70, max: 95 };
      case 'dropout': return { min: 0, max: 30 };
      default: return { min: 0, max: 100 };
    }
  };

  return (
    <div className="calculator-page theme-amber">
      <CalculatorHeader
        title="Sensitivity Analysis Tool"
        description="Explore how varying parameters affect your study design"
        icon="🔍"
        navLinks={NAV_LINKS}
      />

      <main className="calculator-content">
        <div className="calculator-container">
          <div className="calculator-form-section">
            <div className="form-card">
              <h3 className="form-title">Base Parameters</h3>

              <div className="form-row">
                <FormInput
                  label="Base Sample Size"
                  value={baseN}
                  onChange={setBaseN}
                  type="number"
                  min="10"
                  tooltip="Starting sample size"
                />
                <FormInput
                  label="Base Power (%)"
                  value={basePower}
                  onChange={setBasePower}
                  type="number"
                  min="50"
                  max="99"
                  tooltip="Target statistical power"
                />
              </div>

              <div className="form-row">
                <FormInput
                  label="Effect Size (Cohen's d)"
                  value={baseEffect}
                  onChange={setBaseEffect}
                  type="number"
                  min="0.1"
                  step="0.1"
                  tooltip="Expected effect size"
                />
                <FormInput
                  label="Alpha Level"
                  value={baseAlpha}
                  onChange={setBaseAlpha}
                  type="number"
                  min="0.001"
                  max="0.1"
                  step="0.01"
                  tooltip="Significance level"
                />
              </div>

              <div className="form-row">
                <FormInput
                  label="Expected Dropout (%)"
                  value={baseDropout}
                  onChange={setBaseDropout}
                  type="number"
                  min="0"
                  max="50"
                  tooltip="Anticipated dropout rate"
                />
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-title">Sensitivity Parameters</h3>

              <div className="form-row">
                <FormSelect
                  label="Variable to Analyze"
                  value={analysisType}
                  onChange={(val) => {
                    setAnalysisType(val);
                    setRangeMin('');
                    setRangeMax('');
                  }}
                  options={ANALYSIS_TYPES}
                  tooltip="Select parameter to vary"
                />
              </div>

              <div className="form-row">
                <FormInput
                  label="Range Minimum"
                  value={rangeMin}
                  onChange={setRangeMin}
                  type="number"
                  placeholder={getDefaultRange().min.toString()}
                  tooltip="Minimum value to test"
                />
                <FormInput
                  label="Range Maximum"
                  value={rangeMax}
                  onChange={setRangeMax}
                  type="number"
                  placeholder={getDefaultRange().max.toString()}
                  tooltip="Maximum value to test"
                />
              </div>

              <div className="form-row">
                <FormInput
                  label="Number of Scenarios"
                  value={rangeSteps}
                  onChange={setRangeSteps}
                  type="number"
                  min="3"
                  max="10"
                  tooltip="How many scenarios to evaluate"
                />
              </div>

              <CalculatorButtons
                onCalculate={handleCalculate}
                onClear={handleClear}
                calculateLabel="Run Sensitivity Analysis"
              />
            </div>
          </div>

          {calculation && (
            <div className="calculator-results-section">
              <ResultsSection
                title="Sensitivity Analysis Results"
                onExport={() => exportToPDF(theme, calculation)}
              >
                <ResultGrid>
                  {Object.entries(calculation.results).map(([key, value]) => (
                    <ResultCard
                      key={key}
                      label={key}
                      value={value}
                      isPrimary={key.includes('Type')}
                    />
                  ))}
                </ResultGrid>

                {/* Power Curve Chart */}
                <div className="chart-section">
                  <h4>Sensitivity Visualization</h4>
                  <PowerCurveChart
                    data={calculation.sensitivityTable}
                    analysisType={analysisType}
                    theme={theme}
                  />
                </div>

                {/* Show bar chart for effect size analysis */}
                {analysisType === 'effect-size' && (
                  <div className="chart-section">
                    <h4>Effect Size Comparison</h4>
                    <EffectSizeBarChart
                      data={calculation.sensitivityTable}
                      theme={theme}
                    />
                  </div>
                )}

                <div className="sensitivity-table-container">
                  <h4>Sensitivity Table</h4>
                  <table className="sensitivity-table">
                    <thead>
                      <tr>
                        <th>Scenario</th>
                        <th>{calculation.results['Analysis Type']}</th>
                        <th>{analysisType === 'power' ? 'Sample Size' : analysisType === 'dropout' ? 'Adjusted N' : 'Power (%)'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculation.sensitivityTable.map((row, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{row.param}{analysisType === 'power' || analysisType === 'dropout' ? '%' : ''}</td>
                          <td>{row.power || row.sampleSize || row.adjustedN}{row.power ? '%' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <FormulaSection
                  formula={calculation.formula}
                  explanation={calculation.formulaExplanation}
                />

                <InterpretationBox text={calculation.interpretation} />

                <RecommendationsSection recommendations={calculation.recommendations} />
              </ResultsSection>
            </div>
          )}
        </div>
      </main>

      <SimpleFooter />
      <ThemeToggle />

      <style>{`
        .chart-section {
          margin: 1.5rem 0;
          padding: 1.5rem;
          background: var(--bg-card);
          border-radius: var(--radius);
          border: 1px solid var(--border-color);
        }
        .chart-section h4 {
          color: var(--primary);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        .chart-container {
          background: var(--bg-secondary);
          border-radius: var(--radius);
          padding: 1rem;
        }
        .sensitivity-table-container {
          margin: 1.5rem 0;
          padding: 1rem;
          background: var(--bg-card);
          border-radius: var(--radius);
          border: 1px solid var(--border-color);
        }
        .sensitivity-table-container h4 {
          color: var(--primary);
          margin-bottom: 1rem;
        }
        .sensitivity-table {
          width: 100%;
          border-collapse: collapse;
        }
        .sensitivity-table th,
        .sensitivity-table td {
          padding: 0.75rem;
          text-align: center;
          border-bottom: 1px solid var(--border-color);
        }
        .sensitivity-table th {
          background: var(--bg-secondary);
          color: var(--primary);
          font-weight: 600;
        }
        .sensitivity-table td {
          color: var(--text-primary);
        }
        .sensitivity-table tr:hover td {
          background: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
}
