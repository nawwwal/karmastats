import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export function ThemeToggle({ variant = 'header' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'floating') {
    return (
      <button
        className="theme-toggle-floating"
        onClick={toggleTheme}
        title="Toggle dark/light mode"
        aria-label="Toggle theme"
      >
        <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
      </button>
    );
  }

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      <span className="theme-icon">{isDark ? '☀' : '🌙'}</span>
      <span className="theme-text">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}

export default ThemeToggle;
