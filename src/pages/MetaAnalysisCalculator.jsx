import { useState, useMemo } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons, ResultsSection, ResultGrid, ResultCard, FormulaSection, StepsSection, InterpretationBox, RecommendationsSection, ReferenceSection, ExportModal } from '../components/calculators';
import { ForestPlotChart } from '../components/charts';
import { useCalculator } from '../hooks/useCalculator';
import { calculateFixedEffects, calculateRandomEffects, calculateMetaAnalysisSampleSize } from '../calculators/metaAnalysis';
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
  { value: 'fixed', label: 'Fixed Effects Model' },
  { value: 'random', label: 'Random Effects (DerSimonian-Laird)' },
  { value: 'sample-size', label: 'Sample Size Planning' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/effect-size', label: 'Effect Size' },
  { to: '/references', label: 'References' }
];

export function MetaAnalysisCalculator() {
  const [analysisType, setAnalysisType] = useState('fixed');
  const [showExportModal, setShowExportModal] = useState(false);
  const { calculation, setCalculation, theme, clearCalculation } = useCalculator();

  // Effect size inputs (comma-separated)
  const [effects, setEffects] = useState('0.45, 0.52, 0.38, 0.61, 0.49');
  const [variances, setVariances] = useState('0.04, 0.05, 0.03, 0.06, 0.04');
  const [studyNames, setStudyNames] = useState('Study A, Study B, Study C, Study D, Study E');

  // Sample size planning inputs
  const [expectedEffect, setExpectedEffect] = useState('0.5');
  const [expectedTau2, setExpectedTau2] = useState('0.02');
  const [withinStudyVar, setWithinStudyVar] = useState('0.04');
  const [alpha, setAlpha] = useState('0.05');
  const [power, setPower] = useState('80');
  const [precision, setPrecision] = useState('0.1');

  const handleCalculate = () => {
    let result;
    switch (analysisType) {
      case 'fixed':
        result = calculateFixedEffects({ effects, variances, studyNames });
        break;
      case 'random':
        result = calculateRandomEffects({ effects, variances, studyNames });
        break;
      case 'sample-size':
        result = calculateMetaAnalysisSampleSize({
          expectedEffect, expectedTau2, withinStudyVar, alpha, power, precision
        });
        break;
      default:
        return;
    }
    setCalculation(result);
  };

  const handleClear = () => {
    clearCalculation();
    setEffects('0.45, 0.52, 0.38, 0.61, 0.49');
    setVariances('0.04, 0.05, 0.03, 0.06, 0.04');
    setStudyNames('Study A, Study B, Study C, Study D, Study E');
    setExpectedEffect('0.5');
    setExpectedTau2('0.02');
    setWithinStudyVar('0.04');
    setAlpha('0.05');
    setPower('80');
    setPrecision('0.1');
  };

  // Generate forest plot data from inputs
  const forestPlotData = useMemo(() => {
    if (!calculation || analysisType === 'sample-size') return null;

    const effectArray = effects.split(',').map(e => parseFloat(e.trim())).filter(e => !isNaN(e));
    const varianceArray = variances.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const nameArray = studyNames.split(',').map(n => n.trim());

    if (effectArray.length === 0) return null;

    const studies = effectArray.map((effect, i) => {
      const variance = varianceArray[i] || 0.04;
      const se = Math.sqrt(variance);
      return {
        name: nameArray[i] || `Study ${i + 1}`,
        effect: effect,
        lower: effect - 1.96 * se,
        upper: effect + 1.96 * se,
        weight: 1 / variance
      };
    });

    // Normalize weights
    const totalWeight = studies.reduce((sum, s) => sum + s.weight, 0);
    studies.forEach(s => s.weight = (s.weight / totalWeight) * 100);

    // Extract pooled effect from calculation
    const pooledEffect = parseFloat(calculation.results['Pooled Effect']) || 0.5;

    return { studies, overallEffect: pooledEffect };
  }, [calculation, effects, variances, studyNames, analysisType]);

  const renderInputs = () => {
    switch (analysisType) {
      case 'fixed':
      case 'random':
        return (
          <>
            <div className="form-group full-width">
              <label>Effect Sizes (comma-separated)</label>
              <input
                type="text"
                value={effects}
                onChange={(e) => setEffects(e.target.value)}
                placeholder="e.g., 0.45, 0.52, 0.38"
                className="form-input"
              />
              <span className="help-text">Enter effect sizes for each study</span>
            </div>
            <div className="form-group full-width">
              <label>Variances (comma-separated)</label>
              <input
                type="text"
                value={variances}
                onChange={(e) => setVariances(e.target.value)}
                placeholder="e.g., 0.04, 0.05, 0.03"
                className="form-input"
              />
              <span className="help-text">Enter variance of effect size for each study</span>
            </div>
            <div className="form-group full-width">
              <label>Study Names (optional, comma-separated)</label>
              <input
                type="text"
                value={studyNames}
                onChange={(e) => setStudyNames(e.target.value)}
                placeholder="e.g., Study A, Study B, Study C"
                className="form-input"
              />
            </div>
          </>
        );

      case 'sample-size':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Expected Effect Size"
                value={expectedEffect}
                onChange={setExpectedEffect}
                type="number"
                min="0.01"
                step="0.01"
                tooltip="Anticipated pooled effect size"
              />
              <FormInput
                label="Expected tau² (Between-study Var)"
                value={expectedTau2}
                onChange={setExpectedTau2}
                type="number"
                min="0"
                step="0.01"
                tooltip="Expected heterogeneity variance"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Typical Within-study Variance"
                value={withinStudyVar}
                onChange={setWithinStudyVar}
                type="number"
                min="0.001"
                step="0.01"
                tooltip="Average variance within studies"
              />
              <FormInput
                label="Desired Precision (±)"
                value={precision}
                onChange={setPrecision}
                type="number"
                min="0.01"
                step="0.01"
                tooltip="Desired margin of error"
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
                label="Power (1-β)"
                value={power}
                onChange={setPower}
                options={POWER_OPTIONS}
                tooltip="Probability of detecting true effect"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="calculator-page theme-indigo">
      <CalculatorHeader
        title="Meta-Analysis Calculator"
        description="Pool effect sizes across studies using fixed or random effects models"
        icon="📚"
        navLinks={NAV_LINKS}
      />

      <main className="calculator-content">
        <div className="calculator-container">
          <div className="calculator-form-section">
            <div className="form-card">
              <h3 className="form-title">Meta-Analysis Parameters</h3>

              <div className="form-row">
                <FormSelect
                  label="Analysis Type"
                  value={analysisType}
                  onChange={setAnalysisType}
                  options={ANALYSIS_TYPES}
                  tooltip="Select the meta-analysis model"
                />
              </div>

              {renderInputs()}

              <CalculatorButtons
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
            </div>

            <div className="info-card">
              <h4>Heterogeneity Interpretation (I²)</h4>
              <ul className="info-list">
                <li><strong>0-25%:</strong> Low heterogeneity</li>
                <li><strong>25-75%:</strong> Moderate heterogeneity</li>
                <li><strong>75%+:</strong> Substantial heterogeneity</li>
              </ul>
              <p className="info-note">High I² suggests random effects model may be more appropriate.</p>
            </div>
          </div>

          {calculation && (
            <div className="calculator-results-section">
              <ResultsSection
                title="Meta-Analysis Results"
                onExport={() => setShowExportModal(true)}
              >
                <ResultGrid>
                  {Object.entries(calculation.results).map(([key, value]) => (
                    <ResultCard
                      key={key}
                      label={key}
                      value={value}
                      isPrimary={key.includes('Pooled') || key.includes('Recommended')}
                    />
                  ))}
                </ResultGrid>

                {/* Forest Plot Visualization */}
                {forestPlotData && (
                  <div className="chart-section" style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Forest Plot</h4>
                    <ForestPlotChart
                      studies={forestPlotData.studies}
                      overallEffect={forestPlotData.overallEffect}
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
