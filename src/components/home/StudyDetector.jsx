import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectStudyDesign } from '../../utils/studyDetector';
import './StudyDetector.css';

const EXAMPLES = [
  'Randomly assign patients to a new drug or placebo and compare response rates at 6 months.',
  'Follow smokers and non-smokers over 10 years to compare lung-cancer incidence.',
  'Estimate the prevalence of hypertension among adults in a cross-sectional survey.',
  'Evaluate the sensitivity and specificity of a rapid test against PCR.',
];

export function StudyDetector() {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleDetect = () => {
    if (description.trim().length < 15) {
      setResult({ tooShort: true });
      return;
    }
    setIsAnalyzing(true);
    // brief delay purely for the spinner; the analysis itself is synchronous
    setTimeout(() => {
      setResult(detectStudyDesign(description));
      setIsAnalyzing(false);
    }, 350);
  };

  const confidenceColor = (c) =>
    c >= 70 ? '#16a34a' : c >= 50 ? '#0F766E' : c >= 35 ? '#d97706' : '#dc2626';

  return (
    <section className="detector">
      <div className="detector-header">
        <h2>
          <span className="detector-icon">🧠</span>
          Intelligent Study Detector
        </h2>
        <p>Describe your research question and get a ranked, explained calculator recommendation</p>
      </div>

      <textarea
        value={description}
        onChange={(e) => { setDescription(e.target.value); setResult(null); }}
        placeholder="Example: I want to compare the mean HbA1c between a diet group and an exercise group in a randomized trial of 200 patients..."
      />

      <div className="detector-examples">
        {EXAMPLES.map((ex, i) => (
          <button key={i} type="button" className="example-chip" onClick={() => { setDescription(ex); setResult(null); }}>
            {ex.length > 52 ? ex.slice(0, 50) + '…' : ex}
          </button>
        ))}
      </div>

      <div className="btn-center">
        <button
          className={`btn btn-primary ${isAnalyzing ? 'loading' : ''}`}
          onClick={handleDetect}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <><span className="spinner"></span><span>Analyzing…</span></>
          ) : (
            <><span className="search-icon">🔍</span><span>Analyze Study</span></>
          )}
        </button>
      </div>

      {result && result.tooShort && (
        <p className="detector-hint">Please describe your study in a sentence or two (at least 15 characters).</p>
      )}

      {result && !result.tooShort && (
        <div className="detector-results">
          {result.recommendations.length === 0 ? (
            <div className="detector-ambiguous">
              <strong>Not enough signal to recommend a design.</strong>
              <ul>{result.clarifyingQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </div>
          ) : (
            <>
              {result.ambiguous && (
                <div className="detector-ambiguous">
                  <strong>⚠️ Ambiguous description</strong> — the best match is shown, but please confirm:
                  <ul>{result.clarifyingQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                </div>
              )}

              {result.recommendations.map((rec, i) => (
                <div key={rec.key} className={`rec-card ${i === 0 ? 'rec-primary' : ''}`}>
                  <div className="rec-head">
                    <span className="rec-name">{i === 0 ? '⭐ ' : ''}{rec.name}</span>
                    <span className="rec-conf" style={{ background: confidenceColor(rec.confidence) }}>
                      {rec.confidence}% match
                    </span>
                  </div>
                  <p className="rec-blurb">{rec.blurb}</p>
                  {rec.why.length > 0 && (
                    <div className="rec-why">
                      {rec.why.slice(0, 5).map((w, j) => <span key={j} className="why-chip">{w}</span>)}
                    </div>
                  )}
                  <button className="btn btn-outline rec-go" onClick={() => navigate(rec.route)}>
                    Open the {rec.name} calculator →
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default StudyDetector;
