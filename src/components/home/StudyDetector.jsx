import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudyDetector.css';

const STUDY_PATTERNS = {
  'clinical-trials': {
    regex: /randomized|rct|placebo|intervention|treatment.*comparison|drug.*trial|superiority|non-inferiority/i,
    name: 'Clinical Trials',
    url: '/calculator/clinical-trials'
  },
  'observational': {
    regex: /case.*control|cohort|risk.*factor|exposure|retrospective|prospective|odds.*ratio/i,
    name: 'Comparative Studies',
    url: '/calculator/comparative'
  },
  'diagnostic': {
    regex: /diagnostic|sensitivity|specificity|screening|biomarker|roc|predictive.*value/i,
    name: 'Diagnostic Accuracy',
    url: '/calculator/diagnostic'
  },
  'ttest': {
    regex: /compare.*mean|t.*test|before.*after|pre.*post|paired|continuous.*outcome/i,
    name: 'T-Test & Mean Comparisons',
    url: '/calculator/ttest'
  },
  'survival': {
    regex: /survival|time.*event|kaplan|cox|hazard|follow.*up|mortality/i,
    name: 'Survival Analysis',
    url: '/calculator/survival'
  },
  'descriptive': {
    regex: /prevalence|cross.*sectional|survey|descriptive|proportion/i,
    name: 'Descriptive Studies',
    url: '/calculator/descriptive'
  }
};

export function StudyDetector() {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const analyzeStudy = (desc) => {
    for (const [type, config] of Object.entries(STUDY_PATTERNS)) {
      if (config.regex.test(desc)) {
        return { type, ...config };
      }
    }
    return {
      type: 'descriptive',
      ...STUDY_PATTERNS['descriptive']
    };
  };

  const handleDetect = () => {
    if (!description.trim()) {
      alert('Please describe your research study first.');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const result = analyzeStudy(description);
      setIsAnalyzing(false);

      if (window.confirm(`Recommended Calculator: ${result.name}\n\nWould you like to proceed?`)) {
        navigate(result.url);
      }
    }, 1500);
  };

  return (
    <section className="detector">
      <div className="detector-header">
        <h2>
          <span className="detector-icon">🧠</span>
          Intelligent Study Detector
        </h2>
        <p>Describe your research and get personalized calculator recommendations</p>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Example: I want to compare the effectiveness of two treatments for diabetes in a randomized controlled trial with 200 patients..."
      />

      <div className="btn-center">
        <button
          className={`btn btn-primary ${isAnalyzing ? 'loading' : ''}`}
          onClick={handleDetect}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner"></span>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span className="search-icon">🔍</span>
              <span>Analyze Study</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export default StudyDetector;
