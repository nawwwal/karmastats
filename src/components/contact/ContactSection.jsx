import './ContactSection.css';

export function ContactSection() {
  return (
    <section className="contact-section">
      <div className="contact-card">
        <div className="contact-icon">✉️</div>
        <h2>Get in Touch</h2>
        <p className="contact-description">
          Have questions about sample size calculations, statistical methods, or need help with your research?
          Feel free to reach out!
        </p>

        <div className="contact-info">
          <a href="mailto:ruchitnaval03@gmail.com" className="contact-email-link">
            <span className="email-icon-large">📧</span>
            <div className="email-details">
              <span className="email-label">Email</span>
              <span className="email-address">ruchitnaval03@gmail.com</span>
            </div>
          </a>
        </div>

        <div className="contact-features">
          <div className="feature">
            <span className="feature-icon">💡</span>
            <span>Statistical Consultation</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔧</span>
            <span>Feature Requests</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🐛</span>
            <span>Bug Reports</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📚</span>
            <span>Educational Resources</span>
          </div>
        </div>

        <p className="response-note">
          I typically respond within 24-48 hours.
        </p>
      </div>
    </section>
  );
}

// Compact contact card for footer or sidebars
export function ContactCard() {
  return (
    <div className="contact-card-compact">
      <h4>Contact</h4>
      <a href="mailto:ruchitnaval03@gmail.com">
        <span className="email-icon">✉</span>
        ruchitnaval03@gmail.com
      </a>
    </div>
  );
}

export default ContactSection;
