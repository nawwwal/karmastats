import { useState, useCallback, useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

export function useCalculator(initialValues = {}) {
  const [inputs, setInputs] = useState(initialValues);
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculation, setLastCalculation] = useState(null);
  const [calculation, setCalculation] = useState(null);

  // Get theme from context - safe to use even if not in provider
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || 'light';

  const updateInput = useCallback((name, value) => {
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const resetInputs = useCallback(() => {
    setInputs(initialValues);
    setResults(null);
    setLastCalculation(null);
  }, [initialValues]);

  const clearCalculation = useCallback(() => {
    setCalculation(null);
    setResults(null);
    setLastCalculation(null);
  }, []);

  const calculate = useCallback(async (calculationFn) => {
    setIsCalculating(true);

    // Simulate calculation delay for UX
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      const result = calculationFn(inputs);
      setResults(result.results);
      setLastCalculation(result);
      setCalculation(result);
      return result;
    } catch (error) {
      console.error('Calculation error:', error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, [inputs]);

  return {
    inputs,
    setInputs,
    updateInput,
    results,
    setResults,
    isCalculating,
    lastCalculation,
    setLastCalculation,
    calculate,
    resetInputs,
    // New properties for newer calculator pattern
    calculation,
    setCalculation,
    theme,
    clearCalculation
  };
}

// Helper function to get confidence level from Z-score
export function getConfidenceLevel(zScore) {
  const z = parseFloat(zScore);
  if (z === 1.96) return '95%';
  if (z === 2.576) return '99%';
  if (z === 1.645) return '90%';
  return z.toFixed(3);
}

// Helper for rounding to specified decimal places
export function roundUp(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) return value;
  if (decimals === 0) {
    return Math.ceil(value);
  }
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// Helper for formatting numbers
export function formatNumber(num, decimals = 0) {
  if (typeof num !== 'number' || isNaN(num)) return '-';
  return decimals === 0
    ? Math.round(num).toLocaleString()
    : num.toFixed(decimals);
}

export default useCalculator;
