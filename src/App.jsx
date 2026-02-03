import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PageLoader } from './components/common';
import {
  // Core Pages
  Home,
  Contact,
  Support,
  References,
  // Core Calculators
  DescriptiveCalculator,
  TTestCalculator,
  ComparativeCalculator,
  DiagnosticCalculator,
  ClinicalTrialsCalculator,
  SurvivalCalculator,
  // Advanced Calculators
  PowerCalculator,
  EffectSizeCalculator,
  MetaAnalysisCalculator,
  ClusterCalculator,
  BayesianCalculator,
  AgreementCalculator,
  // Tools
  ReportGenerator,
  SensitivityAnalysis,
  Checklists
} from './pages';
import './styles/global.css';

// Simple test component
function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ color: '#0F766E' }}>KARMASTAT is Working!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <a href="/calculator/descriptive">Go to Descriptive Calculator</a>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <PageLoader minDuration={1000} />
        <Routes>
          {/* Test route */}
          <Route path="/test" element={<TestPage />} />

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Core Calculators */}
          <Route path="/calculator/descriptive" element={<DescriptiveCalculator />} />
          <Route path="/calculator/ttest" element={<TTestCalculator />} />
          <Route path="/calculator/comparative" element={<ComparativeCalculator />} />
          <Route path="/calculator/diagnostic" element={<DiagnosticCalculator />} />
          <Route path="/calculator/clinical-trials" element={<ClinicalTrialsCalculator />} />
          <Route path="/calculator/survival" element={<SurvivalCalculator />} />

          {/* Advanced Calculators */}
          <Route path="/calculator/power-analysis" element={<PowerCalculator />} />
          <Route path="/calculator/effect-size" element={<EffectSizeCalculator />} />
          <Route path="/calculator/meta-analysis" element={<MetaAnalysisCalculator />} />
          <Route path="/calculator/cluster-multilevel" element={<ClusterCalculator />} />
          <Route path="/calculator/bayesian" element={<BayesianCalculator />} />
          <Route path="/calculator/agreement" element={<AgreementCalculator />} />

          {/* Tools */}
          <Route path="/tools/report-generator" element={<ReportGenerator />} />
          <Route path="/tools/sensitivity-analysis" element={<SensitivityAnalysis />} />
          <Route path="/tools/checklists" element={<Checklists />} />

          {/* Other Pages */}
          <Route path="/references" element={<References />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />

          {/* Catch-all */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
