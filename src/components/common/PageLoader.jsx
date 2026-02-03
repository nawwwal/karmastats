import { useState, useEffect } from 'react';
import './PageLoader.css';

export function PageLoader({ minDuration = 1000 }) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHidden(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  return (
    <div className={`karma-page-loader ${isHidden ? 'hidden' : ''}`} id="pageLoader">
      <div className="loader-content">
        <div className="karma-infinity">
          <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.7 }} />
                <stop offset="50%" style={{ stopColor: '#ffffff' }} />
                <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.7 }} />
              </linearGradient>
            </defs>
            <path
              className="karma-path"
              d="M20 35 C20 12, 45 12, 70 35 C95 58, 120 58, 120 35 C120 12, 95 12, 70 35 C45 58, 20 58, 20 35"
              fill="none"
              stroke="url(#loaderGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle className="karma-point" cx="20" cy="35" r="6" fill="#FCD34D" />
            <circle className="karma-point" cx="70" cy="35" r="8" fill="white" />
            <circle className="karma-point" cx="120" cy="35" r="6" fill="#FCD34D" />
          </svg>
        </div>
        <div className="loader-text">KARMASTAT</div>
        <div className="loader-tagline">Where Selfless Work Meets Calculated Precision</div>
      </div>
    </div>
  );
}

// Button spinner component
export function ButtonSpinner() {
  return (
    <span className="karma-spinner">
      <svg viewBox="0 0 24 24">
        <path
          className="spinner-path"
          d="M4 12 C4 7, 8 7, 12 12 C16 17, 20 17, 20 12 C20 7, 16 7, 12 12 C8 17, 4 17, 4 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

// Inline loading indicator
export function LoadingSpinner({ size = 'medium', color }) {
  const sizeClass = `spinner-${size}`;
  return (
    <div className={`loading-spinner ${sizeClass}`} style={color ? { color } : {}}>
      <svg viewBox="0 0 24 24">
        <circle
          className="spinner-circle"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export default PageLoader;
