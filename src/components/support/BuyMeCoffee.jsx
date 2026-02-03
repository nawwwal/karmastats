import { QRCodeSVG } from 'qrcode.react';
import './BuyMeCoffee.css';

export function BuyMeCoffee() {
  // UPI payment URL - only contains payment ID, no personal details shown
  const upiUrl = 'upi://pay?pa=nidhimundra2-1@okaxis&cu=INR';

  return (
    <section className="support-section">
      <div className="support-card">
        <div className="support-icon">🍵</div>
        <h2>Buy Me a Tea</h2>
        <p className="support-tagline">Support KARMASTAT Development</p>
        <p className="support-description">
          If KARMASTAT has helped with your research, consider supporting the project!
          Your contribution helps keep this tool free and continuously improving.
        </p>

        <div className="qr-code-container">
          <div className="qr-code-wrapper">
            <QRCodeSVG
              value={upiUrl}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="qr-instruction">Scan with any UPI app to pay</p>
        </div>

        <div className="gratitude-message">
          <span className="heart-icon">❤️</span>
          <p>Every contribution, big or small, is deeply appreciated!</p>
        </div>
      </div>
    </section>
  );
}

// Floating tea button
export function TeaButton() {
  return (
    <a href="/support" className="tea-button float" title="Support KARMASTAT">
      🍵
    </a>
  );
}

// Compact support card
export function SupportCard() {
  return (
    <div className="support-card-compact">
      <span className="tea-icon">🍵</span>
      <div className="support-text">
        <h4>Buy Me a Tea</h4>
        <p>Support KARMASTAT</p>
      </div>
      <a href="/support" className="support-link">Support</a>
    </div>
  );
}

export default BuyMeCoffee;
