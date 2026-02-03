import { Link } from 'react-router-dom';
import { KarmastatLogoIcon } from '../../assets/logo/KarmastatLogo';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

export function Navbar() {
  return (
    <header className="header">
      <div className="header-bg-pattern"></div>
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <KarmastatLogoIcon size={66} color="white" />
            </div>
            <h1>KARMASTAT <span className="version-badge">2.0</span></h1>
          </Link>
          <p className="tagline">Where Selfless Work Meets Calculated Precision</p>
          <p className="subtitle">Advanced Statistical Sample Size Calculator Suite for Medical Research Excellence</p>
        </div>
        <ThemeToggle variant="header" />
      </div>
    </header>
  );
}

// Calculator page header variant
export function CalculatorHeader({ title, subtitle, description, icon, navLinks = [], themeClass = '' }) {
  // Support both subtitle and description props
  const displaySubtitle = subtitle || description;

  return (
    <header className={`header calculator-header ${themeClass}`}>
      <div className="header-bg-pattern"></div>
      <div className="header-content">
        <div className="header-title-row">
          {icon && <span className="header-icon">{icon}</span>}
          <h1>{title}</h1>
        </div>
        <p className="subtitle">{displaySubtitle}</p>
        <div className="brand-mini">
          <KarmastatLogoIcon size={40} color="white" />
          <span>KARMASTAT</span>
        </div>
        {navLinks.length > 0 && (
          <nav className="nav-buttons">
            {navLinks.map((link, index) => (
              <Link key={index} to={link.to} className="nav-btn">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;
