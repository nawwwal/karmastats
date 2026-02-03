import { ButtonSpinner } from '../common/PageLoader';
import './CalculatorForm.css';

// Form input component - supports both old (name, value) and new (value) patterns
export function FormInput({
  label,
  name,
  type = 'number',
  value,
  onChange,
  required = false,
  min,
  max,
  step,
  helpText,
  tooltip, // alias for helpText
  placeholder
}) {
  const handleChange = (e) => {
    const newValue = type === 'number'
      ? (parseFloat(e.target.value) || e.target.value)
      : e.target.value;

    // Support both patterns: onChange(name, value) and onChange(value)
    if (name && onChange.length >= 2) {
      onChange(name, newValue);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="form-group">
      <label className={required ? 'required' : ''}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
      {(helpText || tooltip) && <p className="help-text">{helpText || tooltip}</p>}
    </div>
  );
}

// Form select component - supports both old (name, value) and new (value) patterns
export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  helpText,
  tooltip // alias for helpText
}) {
  const handleChange = (e) => {
    const newValue = e.target.value;

    // Support both patterns: onChange(name, value) and onChange(value)
    if (name && onChange.length >= 2) {
      onChange(name, newValue);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="form-group">
      <label className={required ? 'required' : ''}>
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {(helpText || tooltip) && <p className="help-text">{helpText || tooltip}</p>}
    </div>
  );
}

// Calculate button
export function CalculateButton({ onClick, isLoading, label = 'Calculate Sample Size' }) {
  return (
    <button
      className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={isLoading}
    >
      <span className="btn-text">{label}</span>
      {isLoading && <ButtonSpinner />}
    </button>
  );
}

// Reset button
export function ResetButton({ onClick }) {
  return (
    <button className="btn btn-secondary" onClick={onClick}>
      Reset
    </button>
  );
}

// Button group for calculators - supports both onReset and onClear
export function CalculatorButtons({ onCalculate, onReset, onClear, isLoading, calculateLabel }) {
  // Support both onReset and onClear prop names
  const handleReset = onReset || onClear;

  return (
    <div className="btn-group" style={{ marginTop: '2rem' }}>
      <CalculateButton
        onClick={onCalculate}
        isLoading={isLoading}
        label={calculateLabel}
      />
      {handleReset && <ResetButton onClick={handleReset} />}
    </div>
  );
}

// No default export - use named exports above
