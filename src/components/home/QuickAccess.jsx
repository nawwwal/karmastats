import { Link } from 'react-router-dom';
import './QuickAccess.css';

const QUICK_LINKS = [
  { icon: '📊', label: 'Descriptive', url: '/calculator/descriptive' },
  { icon: '📈', label: 'T-Test', url: '/calculator/ttest' },
  { icon: '🧪', label: 'Clinical Trials', url: '/calculator/clinical-trials' },
  { icon: '⚖️', label: 'Comparative', url: '/calculator/comparative' },
  { icon: '🩺', label: 'Diagnostic', url: '/calculator/diagnostic' },
  { icon: '💓', label: 'Survival', url: '/calculator/survival' },
  { icon: '⚡', label: 'Power', url: '/calculator/power-analysis' },
  { icon: '📏', label: 'Effect Size', url: '/calculator/effect-size' },
  { icon: '📖', label: 'References', url: '/references' }
];

export function QuickAccess() {
  return (
    <section className="quick-access">
      <h3>
        <span className="bolt-icon">⚡</span>
        Quick Access
      </h3>
      <div className="quick-links">
        {QUICK_LINKS.map((link, index) => (
          <Link key={index} to={link.url} className="quick-link">
            <span className="link-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default QuickAccess;
