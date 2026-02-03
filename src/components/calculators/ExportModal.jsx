import { useState } from 'react';
import './ExportModal.css';

// Supports two patterns:
// 1. Legacy: { isOpen, onClose, onExport, lastCalculation }
// 2. New: { onClose, onExportPDF, onCopyClipboard } (isOpen determined by rendering)
export function ExportModal({ isOpen = true, onClose, onExport, lastCalculation, onExportPDF, onCopyClipboard }) {
  const [selectedTheme, setSelectedTheme] = useState('light');

  // Support legacy isOpen pattern
  if (isOpen === false) return null;

  const handleExport = () => {
    if (onExportPDF) {
      // New pattern - export function handles everything
      onExportPDF();
    } else if (onExport && lastCalculation) {
      // Legacy pattern
      onExport(selectedTheme, lastCalculation);
      onClose();
    }
  };

  const handleCopy = () => {
    if (onCopyClipboard) {
      onCopyClipboard();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Export Results</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <p className="modal-description">
          Choose how to export your calculation results:
        </p>

        <div className="theme-options">
          <div
            className={`theme-option ${selectedTheme === 'light' ? 'selected' : ''}`}
            onClick={() => setSelectedTheme('light')}
          >
            <div className="theme-option-icon">☀️</div>
            <div className="theme-option-label">Light Theme</div>
            <div className="theme-option-desc">Clean white background</div>
          </div>
          <div
            className={`theme-option ${selectedTheme === 'dark' ? 'selected' : ''}`}
            onClick={() => setSelectedTheme('dark')}
          >
            <div className="theme-option-icon">🌙</div>
            <div className="theme-option-label">Dark Theme</div>
            <div className="theme-option-desc">Dark background</div>
          </div>
        </div>

        <div className="btn-group" style={{ marginTop: '1.5rem', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handleExport} style={{ width: '100%' }}>
            Export PDF Report
          </button>
          {onCopyClipboard && (
            <button className="btn btn-secondary" onClick={handleCopy} style={{ width: '100%' }}>
              Copy to Clipboard
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
