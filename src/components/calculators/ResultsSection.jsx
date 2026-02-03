import './ResultsSection.css';

// Main results display
export function ResultsSection({ show = true, children, title = 'Calculation Results', onExport }) {
  return (
    <div className={`results ${show ? 'show' : ''}`}>
      <div className="results-header">
        <div className="results-header-left">
          <span className="results-icon">✨</span>
          <h3>{title}</h3>
        </div>
        {onExport && (
          <button className="btn btn-export" onClick={onExport}>
            Export PDF
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// Result card grid
export function ResultGrid({ children }) {
  return <div className="result-grid">{children}</div>;
}

// Individual result card
export function ResultCard({ value, label, isPrimary = false }) {
  return (
    <div className={`result-card ${isPrimary ? 'primary' : ''}`}>
      <div className="result-value">{value}</div>
      <div className="result-label">{label}</div>
    </div>
  );
}

// Formula section
export function FormulaSection({ formula, explanation }) {
  return (
    <div className="formula-section">
      <h4>📐 Formula Used</h4>
      <div className="formula-box">
        <div className="formula-main">{formula}</div>
        {explanation && (
          <div className="formula-explanation">
            Where:<br />
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
}

// Step-by-step calculation
export function StepsSection({ steps }) {
  return (
    <div className="steps-section">
      <h4>📝 Step-by-Step Calculation</h4>
      {steps.map((step, index) => (
        <div key={index} className="step">
          <div className="step-number">{index + 1}</div>
          <div className="step-content">
            <div className="step-title">{step.title}</div>
            <div className="step-calc">{step.calc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Interpretation box
export function InterpretationBox({ text }) {
  return (
    <div className="interpretation-box">
      <h4>💡 Interpretation</h4>
      <p>{text}</p>
    </div>
  );
}

// Recommendations section
export function RecommendationsSection({ recommendations }) {
  return (
    <div className="recommendations-section">
      <h4>📋 Recommendations</h4>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
}

// Reference citation
export function ReferenceSection({ reference }) {
  return (
    <div className="reference-section">
      <h4>📚 Reference</h4>
      <p className="reference-text">{reference}</p>
    </div>
  );
}

export default ResultsSection;
