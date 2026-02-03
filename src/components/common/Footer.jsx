import { Link } from 'react-router-dom';
import { KarmastatLogoFooter } from '../../assets/logo/KarmastatLogo';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <KarmastatLogoFooter size={50} />
            <div className="footer-logo">KARMASTAT</div>
          </div>
          <p className="footer-tagline">Where Selfless Work Meets Calculated Precision</p>
          <p className="footer-blessing">Jai Shri Ram</p>

          <div className="footer-links">
            <Link to="/references">References & Citations</Link>
            <span className="divider">|</span>
            <Link to="/contact">Contact</Link>
            <span className="divider">|</span>
            <Link to="/support">Support</Link>
          </div>

          <div className="footer-contact">
            <a href="mailto:ruchitnaval03@gmail.com" className="contact-email">
              <span className="email-icon">✉</span>
              ruchitnaval03@gmail.com
            </a>
          </div>

          <p className="footer-credits">Made with selfless dedication by <strong>KARMAYOGI</strong></p>
        </div>
      </div>
    </footer>
  );
}

// Simple footer for calculator pages
export function SimpleFooter() {
  return (
    <footer className="footer simple-footer">
      <div className="container">
        <p className="footer-brand-text">KARMASTAT - Professional Statistical Calculator</p>
        <p>Made with love by <strong>Karmayogi</strong> | <Link to="/references">References & Citations</Link></p>
        <p className="footer-tagline">Jai Shri Ram</p>
      </div>
    </footer>
  );
}

export default Footer;
