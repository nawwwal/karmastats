export { exportToPDF, copyToClipboard } from './pdfExport';

// Validation helpers
export function validateNumber(value, min, max, name) {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`${name} must be a valid number`);
  }
  if (min !== undefined && num < min) {
    throw new Error(`${name} must be at least ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`${name} must be at most ${max}`);
  }
  return num;
}

export function validatePositive(value, name) {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
  return num;
}

export function validateProportion(value, name) {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0 || num >= 1) {
    throw new Error(`${name} must be between 0 and 1 (exclusive)`);
  }
  return num;
}

// Formatting helpers
export function formatNumber(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  if (decimals === 0) {
    return Math.round(value).toLocaleString();
  }
  return value.toFixed(decimals);
}

export function formatPercent(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
}

// Toast notification
export function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
