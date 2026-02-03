import { useState } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons, ResultsSection, ResultGrid, ResultCard, FormulaSection, StepsSection, InterpretationBox, RecommendationsSection, ReferenceSection, ExportModal } from '../components/calculators';
import { SurvivalCurveChart } from '../components/charts';
import { useCalculator } from '../hooks/useCalculator';
import { calculateLogRank, calculateKaplanMeier, calculateCoxPH } from '../calculators/survival';
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

const CONFIDENCE_OPTIONS = [
  { value: '0.95', label: '95%' },
  { value: '0.99', label: '99%' },
  { value: '0.90', label: '90%' }
];

const ANALYSIS_TYPES = [
  { value: 'log-rank', label: 'Log-rank Test (Compare Survival Curves)' },
  { value: 'kaplan-meier', label: 'Kaplan-Meier Estimate' },
  { value: 'cox-ph', label: 'Cox Proportional Hazards' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/clinical-trials', label: 'Clinical Trials' },
  { to: '/references', label: 'References' }
];

export function SurvivalCalculator() {
  const [analysisType, setAnalysisType] = useState('log-rank');
  const [showExportModal, setShowExportModal] = useState(false);
  const { calculation, setCalculation, theme, clearCalculation } = useCalculator();

  // Log-rank inputs
  const [survivalControl, setSurvivalControl] = useState('50');
  const [survivalTreatment, setSurvivalTreatment] = useState('65');
  const [alpha, setAlpha] = useState('0.05');
  const [power, setPower] = useState('80');
  const [ratio, setRatio] = useState('1');
  const [accrualTime, setAccrualTime] = useState('12');
  const [followUpTime, setFollowUpTime] = useState('12');

  // Kaplan-Meier inputs
  const [events, setEvents] = useState('30');
  const [totalAtRisk, setTotalAtRisk] = useState('100');
  const [timePoints, setTimePoints] = useState('12');
  const [precision, setPrecision] = useState('0.05');
  const [confidence, setConfidence] = useState('0.95');

  // Cox PH inputs
  const [hazardRatio, setHazardRatio] = useState('1.5');
  const [eventProbability, setEventProbability] = useState('30');
  const [r2, setR2] = useState('0');
  const [numCovariates, setNumCovariates] = useState('1');

  const handleCalculate = () => {
    let result;
    switch (analysisType) {
      case 'log-rank':
        result = calculateLogRank({
          survivalControl, survivalTreatment, alpha, power,
          ratio, accrualTime, followUpTime
        });
        break;
      case 'kaplan-meier':
        result = calculateKaplanMeier({
          events, totalAtRisk, timePoints, precision, confidence
        });
        break;
      case 'cox-ph':
        result = calculateCoxPH({
          hazardRatio, eventProbability, alpha, power, r2, numCovariates
        });
        break;
      default:
        return;
    }
    setCalculation(result);
  };

  const handleClear = () => {
    clearCalculation();
    setSurvivalControl('50');
    setSurvivalTreatment('65');
    setAlpha('0.05');
    setPower('80');
    setRatio('1');
    setAccrualTime('12');
    setFollowUpTime('12');
    setEvents('30');
    setTotalAtRisk('100');
    setTimePoints('12');
    setPrecision('0.05');
    setConfidence('0.95');
    setHazardRatio('1.5');
    setEventProbability('30');
    setR2('0');
    setNumCovariates('1');
  };

  const renderInputs = () => {
    switch (analysisType) {
      case 'log-rank':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Control Group Survival (%)"
                value={survivalControl}
                onChange={setSurvivalControl}
                type="number"
                min="1"
                max="99"
                step="1"
                tooltip="Expected survival rate in control group"
              />
              <FormInput
                label="Treatment Group Survival (%)"
                value={survivalTreatment}
                onChange={setSurvivalTreatment}
                type="number"
                min="1"
                max="99"
                step="1"
                tooltip="Expected survival rate in treatment group"
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
            <div className="form-row">
              <FormInput
                label="Allocation Ratio (Treatment:Control)"
                value={ratio}
                onChange={setRatio}
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                tooltip="Ratio of treatment to control group sizes"
              />
              <FormInput
                label="Accrual Time (months)"
                value={accrualTime}
                onChange={setAccrualTime}
                type="number"
                min="1"
                max="120"
                step="1"
                tooltip="Duration of patient enrollment"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Follow-up Time (months)"
                value={followUpTime}
                onChange={setFollowUpTime}
                type="number"
                min="1"
                max="120"
                step="1"
                tooltip="Minimum follow-up after enrollment ends"
              />
            </div>
          </>
        );

      case 'kaplan-meier':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Number of Events"
                value={events}
                onChange={setEvents}
                type="number"
                min="1"
                step="1"
                tooltip="Observed number of events (deaths/failures)"
              />
              <FormInput
                label="Total at Risk"
                value={totalAtRisk}
                onChange={setTotalAtRisk}
                type="number"
                min="1"
                step="1"
                tooltip="Total number of subjects at risk"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Time Point (months)"
                value={timePoints}
                onChange={setTimePoints}
                type="number"
                min="1"
                step="1"
                tooltip="Time point for survival estimate"
              />
              <FormInput
                label="Desired Precision"
                value={precision}
                onChange={setPrecision}
                type="number"
                min="0.01"
                max="0.20"
                step="0.01"
                tooltip="Desired margin of error (e.g., 0.05 = ±5%)"
              />
            </div>
            <div className="form-row">
              <FormSelect
                label="Confidence Level"
                value={confidence}
                onChange={setConfidence}
                options={CONFIDENCE_OPTIONS}
                tooltip="Confidence level for interval"
              />
            </div>
          </>
        );

      case 'cox-ph':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Hazard Ratio to Detect"
                value={hazardRatio}
                onChange={setHazardRatio}
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                tooltip="Minimum hazard ratio to detect"
              />
              <FormInput
                label="Event Probability (%)"
                value={eventProbability}
                onChange={setEventProbability}
                type="number"
                min="1"
                max="99"
                step="1"
                tooltip="Expected proportion experiencing event"
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
            <div className="form-row">
              <FormInput
                label="R² with Other Covariates"
                value={r2}
                onChange={setR2}
                type="number"
                min="0"
                max="0.99"
                step="0.05"
                tooltip="Correlation with other covariates (0-1)"
              />
              <FormInput
                label="Number of Covariates"
                value={numCovariates}
                onChange={setNumCovariates}
                type="number"
                min="1"
                max="20"
                step="1"
                tooltip="Total number of covariates in model"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="calculator-page theme-red">
      <CalculatorHeader
        title="Survival Analysis"
        description="Calculate sample sizes for log-rank tests, Kaplan-Meier estimates, and Cox regression"
        icon="⏱️"
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
                  tooltip="Select the type of survival analysis"
                />
              </div>

              {renderInputs()}

              <CalculatorButtons
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
            </div>
          </div>

          {calculation && (
            <div className="calculator-results-section">
              <ResultsSection
                title="Calculation Results"
                onExport={() => setShowExportModal(true)}
              >
                <ResultGrid>
                  {Object.entries(calculation.results).map(([key, value]) => (
                    <ResultCard
                      key={key}
                      label={key}
                      value={value}
                      isPrimary={key.includes('Sample') || key.includes('Events')}
                    />
                  ))}
                </ResultGrid>

                {/* Survival Curve Visualization */}
                {analysisType === 'log-rank' && (
                  <div className="chart-section" style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Estimated Survival Curves</h4>
                    <SurvivalCurveChart
                      survivalControl={survivalControl}
                      survivalTreatment={survivalTreatment}
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
