import { useState } from 'react';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import { FormInput, FormSelect, CalculatorButtons, ResultsSection, ResultGrid, ResultCard, FormulaSection, StepsSection, InterpretationBox, RecommendationsSection, ReferenceSection, ExportModal } from '../components/calculators';
import { DesignEffectChart } from '../components/charts';
import { useCalculator } from '../hooks/useCalculator';
import { calculateClusterContinuous, calculateClusterBinary, calculateNumberOfClusters, calculateDesignEffect } from '../calculators/cluster';
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
  { value: 'continuous', label: 'Cluster RCT - Continuous Outcome' },
  { value: 'binary', label: 'Cluster RCT - Binary Outcome' },
  { value: 'clusters', label: 'Number of Clusters' },
  { value: 'deff', label: 'Design Effect Calculator' }
];

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/clinical-trials', label: 'Clinical Trials' },
  { to: '/references', label: 'References' }
];

export function ClusterCalculator() {
  const [analysisType, setAnalysisType] = useState('continuous');
  const [showExportModal, setShowExportModal] = useState(false);
  const { calculation, setCalculation, theme, clearCalculation } = useCalculator();

  // Continuous outcome inputs
  const [mean1, setMean1] = useState('75');
  const [mean2, setMean2] = useState('70');
  const [sd, setSd] = useState('15');

  // Binary outcome inputs
  const [p1, setP1] = useState('0.30');
  const [p2, setP2] = useState('0.45');

  // Common cluster inputs
  const [icc, setIcc] = useState('0.03');
  const [clusterSize, setClusterSize] = useState('30');
  const [alpha, setAlpha] = useState('0.05');
  const [power, setPower] = useState('80');
  const [numArms, setNumArms] = useState('2');
  const [cv, setCv] = useState('0.2');
  const [numClusters, setNumClusters] = useState('20');
  const [effectSize, setEffectSize] = useState('0.3');

  const handleCalculate = () => {
    let result;
    switch (analysisType) {
      case 'continuous':
        result = calculateClusterContinuous({ mean1, mean2, sd, icc, clusterSize, alpha, power, numArms });
        break;
      case 'binary':
        result = calculateClusterBinary({ p1, p2, icc, clusterSize, alpha, power });
        break;
      case 'clusters':
        result = calculateNumberOfClusters({ effectSize, icc, clusterSize, alpha, power, cv });
        break;
      case 'deff':
        result = calculateDesignEffect({ icc, clusterSize, cv, numClusters });
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
    setSd('15');
    setP1('0.30');
    setP2('0.45');
    setIcc('0.03');
    setClusterSize('30');
    setAlpha('0.05');
    setPower('80');
    setNumArms('2');
    setCv('0.2');
    setNumClusters('20');
    setEffectSize('0.3');
  };

  const renderInputs = () => {
    switch (analysisType) {
      case 'continuous':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Mean Group 1"
                value={mean1}
                onChange={setMean1}
                type="number"
                step="0.1"
                tooltip="Expected mean in control group"
              />
              <FormInput
                label="Mean Group 2"
                value={mean2}
                onChange={setMean2}
                type="number"
                step="0.1"
                tooltip="Expected mean in treatment group"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Standard Deviation"
                value={sd}
                onChange={setSd}
                type="number"
                min="0.01"
                step="0.1"
                tooltip="Common SD (individual level)"
              />
              <FormInput
                label="Number of Arms"
                value={numArms}
                onChange={setNumArms}
                type="number"
                min="2"
                max="6"
                step="1"
                tooltip="Number of treatment arms"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="ICC"
                value={icc}
                onChange={setIcc}
                type="number"
                min="0"
                max="1"
                step="0.01"
                tooltip="Intraclass correlation coefficient"
              />
              <FormInput
                label="Cluster Size"
                value={clusterSize}
                onChange={setClusterSize}
                type="number"
                min="2"
                step="1"
                tooltip="Average individuals per cluster"
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

      case 'binary':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Control Proportion"
                value={p1}
                onChange={setP1}
                type="number"
                min="0.01"
                max="0.99"
                step="0.01"
                tooltip="Expected proportion in control group"
              />
              <FormInput
                label="Treatment Proportion"
                value={p2}
                onChange={setP2}
                type="number"
                min="0.01"
                max="0.99"
                step="0.01"
                tooltip="Expected proportion in treatment group"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="ICC"
                value={icc}
                onChange={setIcc}
                type="number"
                min="0"
                max="1"
                step="0.01"
                tooltip="Intraclass correlation coefficient"
              />
              <FormInput
                label="Cluster Size"
                value={clusterSize}
                onChange={setClusterSize}
                type="number"
                min="2"
                step="1"
                tooltip="Average individuals per cluster"
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

      case 'clusters':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="Effect Size (Cohen's d)"
                value={effectSize}
                onChange={setEffectSize}
                type="number"
                min="0.01"
                max="2"
                step="0.05"
                tooltip="Standardized effect size to detect"
              />
              <FormInput
                label="ICC"
                value={icc}
                onChange={setIcc}
                type="number"
                min="0"
                max="1"
                step="0.01"
                tooltip="Intraclass correlation coefficient"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Average Cluster Size"
                value={clusterSize}
                onChange={setClusterSize}
                type="number"
                min="2"
                step="1"
                tooltip="Expected average individuals per cluster"
              />
              <FormInput
                label="CV of Cluster Size"
                value={cv}
                onChange={setCv}
                type="number"
                min="0"
                max="1"
                step="0.05"
                tooltip="Coefficient of variation of cluster sizes (0 if equal)"
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

      case 'deff':
        return (
          <>
            <div className="form-row">
              <FormInput
                label="ICC"
                value={icc}
                onChange={setIcc}
                type="number"
                min="0"
                max="1"
                step="0.01"
                tooltip="Intraclass correlation coefficient"
              />
              <FormInput
                label="Average Cluster Size"
                value={clusterSize}
                onChange={setClusterSize}
                type="number"
                min="2"
                step="1"
                tooltip="Average individuals per cluster"
              />
            </div>
            <div className="form-row">
              <FormInput
                label="CV of Cluster Size"
                value={cv}
                onChange={setCv}
                type="number"
                min="0"
                max="1"
                step="0.05"
                tooltip="Coefficient of variation (0 if equal sizes)"
              />
              <FormInput
                label="Number of Clusters"
                value={numClusters}
                onChange={setNumClusters}
                type="number"
                min="2"
                step="1"
                tooltip="Total number of clusters"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="calculator-page theme-rose">
      <CalculatorHeader
        title="Cluster Randomized Trials"
        description="Sample size calculations accounting for clustering and intraclass correlation"
        icon="🏥"
        navLinks={NAV_LINKS}
      />

      <main className="calculator-content">
        <div className="calculator-container">
          <div className="calculator-form-section">
            <div className="form-card">
              <h3 className="form-title">Cluster Trial Parameters</h3>

              <div className="form-row">
                <FormSelect
                  label="Calculation Type"
                  value={analysisType}
                  onChange={setAnalysisType}
                  options={ANALYSIS_TYPES}
                  tooltip="Select the type of calculation"
                />
              </div>

              {renderInputs()}

              <CalculatorButtons
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
            </div>

            <div className="info-card">
              <h4>Typical ICC Values</h4>
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Setting</th>
                    <th>ICC Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Primary care practices</td><td>0.01 - 0.05</td></tr>
                  <tr><td>Hospitals/wards</td><td>0.01 - 0.10</td></tr>
                  <tr><td>Schools/classrooms</td><td>0.10 - 0.25</td></tr>
                  <tr><td>Villages/communities</td><td>0.02 - 0.15</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {calculation && (
            <div className="calculator-results-section">
              <ResultsSection
                title="Cluster Trial Results"
                onExport={() => setShowExportModal(true)}
              >
                <ResultGrid>
                  {Object.entries(calculation.results).map(([key, value]) => (
                    <ResultCard
                      key={key}
                      label={key}
                      value={value}
                      isPrimary={key.includes('Clusters') || key.includes('DEFF') || key.includes('Total')}
                    />
                  ))}
                </ResultGrid>

                {/* Design Effect Visualization */}
                <div className="chart-section" style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Design Effect by ICC</h4>
                  <DesignEffectChart
                    clusterSize={clusterSize}
                    theme={theme}
                  />
                </div>

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
