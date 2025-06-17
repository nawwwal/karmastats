/**
 * Centralized Statistical Constants for KARMASTAT
 * All statistical lookup tables and constants used across calculators
 */

// Standard significance levels for statistical tests
export const SIGNIFICANCE_LEVELS = [0.01, 0.05, 0.10] as const;

// Standard statistical power levels
export const POWER_LEVELS = [0.80, 0.85, 0.90, 0.95] as const;

// Z-scores for different significance levels (two-tailed)
export const Z_SCORES_ALPHA = {
  0.01: 2.576,
  0.05: 1.96,
  0.10: 1.645
} as const;

// Z-scores for different power levels (one-tailed)
export const Z_SCORES_BETA = {
  0.80: 0.842,
  0.85: 1.036,
  0.90: 1.282,
  0.95: 1.645
} as const;

// Critical values for t-distribution (commonly used degrees of freedom)
export const T_CRITICAL_VALUES = {
  1: { 0.05: 12.706, 0.01: 63.657, 0.10: 6.314 },
  2: { 0.05: 4.303, 0.01: 9.925, 0.10: 2.920 },
  3: { 0.05: 3.182, 0.01: 5.841, 0.10: 2.353 },
  4: { 0.05: 2.776, 0.01: 4.604, 0.10: 2.132 },
  5: { 0.05: 2.571, 0.01: 4.032, 0.10: 2.015 },
  10: { 0.05: 2.228, 0.01: 3.169, 0.10: 1.812 },
  15: { 0.05: 2.131, 0.01: 2.947, 0.10: 1.753 },
  20: { 0.05: 2.086, 0.01: 2.845, 0.10: 1.725 },
  30: { 0.05: 2.042, 0.01: 2.750, 0.10: 1.697 },
  60: { 0.05: 2.000, 0.01: 2.660, 0.10: 1.671 },
  120: { 0.05: 1.980, 0.01: 2.617, 0.10: 1.658 },
  Infinity: { 0.05: 1.960, 0.01: 2.576, 0.10: 1.645 }
} as const;

// Cohen's effect size conventions
export const COHENS_EFFECT_SIZES = {
  small: 0.2,
  medium: 0.5,
  large: 0.8
} as const;

// Common correlation effect sizes
export const CORRELATION_EFFECT_SIZES = {
  small: 0.1,
  medium: 0.3,
  large: 0.5
} as const;

// Design effect multipliers for cluster sampling
export const DESIGN_EFFECTS = {
  simple_random: 1.0,
  cluster_small: 1.5,
  cluster_medium: 2.0,
  cluster_large: 3.0
} as const;

// Mathematical constants for statistical calculations
export const MATH_CONSTANTS = {
  SQRT_2: Math.sqrt(2),
  SQRT_2_PI: Math.sqrt(2 * Math.PI),
  LOG_2_PI: Math.log(2 * Math.PI),
  EULER_GAMMA: 0.5772156649015329,
  GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2
} as const;

// Convergence criteria for iterative algorithms
export const CONVERGENCE_CRITERIA = {
  DEFAULT_TOLERANCE: 1e-6,
  HIGH_PRECISION_TOLERANCE: 1e-9,
  LOW_PRECISION_TOLERANCE: 1e-4,
  MAX_ITERATIONS: 1000,
  BETA_FUNCTION_MAX_ITERATIONS: 100,
  NEWTON_RAPHSON_MAX_ITERATIONS: 50
} as const;

// Type definitions for better type safety
export type SignificanceLevel = typeof SIGNIFICANCE_LEVELS[number];
export type PowerLevel = typeof POWER_LEVELS[number];
export type EffectSizeCategory = keyof typeof COHENS_EFFECT_SIZES;

// Helper functions for common statistical operations
export function getZScoreForAlpha(alpha: SignificanceLevel): number {
  return Z_SCORES_ALPHA[alpha];
}

export function getZScoreForBeta(power: PowerLevel): number {
  return Z_SCORES_BETA[power];
}

export function isValidSignificanceLevel(level: number): level is SignificanceLevel {
  return SIGNIFICANCE_LEVELS.includes(level as SignificanceLevel);
}

export function isValidPowerLevel(power: number): power is PowerLevel {
  return POWER_LEVELS.includes(power as PowerLevel);
}

// Effect size calculators
export function classifyEffectSize(effectSize: number, type: 'cohen' | 'correlation' = 'cohen'): string {
  const thresholds = type === 'cohen' ? COHENS_EFFECT_SIZES : CORRELATION_EFFECT_SIZES;

  if (Math.abs(effectSize) >= thresholds.large) return 'Large';
  if (Math.abs(effectSize) >= thresholds.medium) return 'Medium';
  if (Math.abs(effectSize) >= thresholds.small) return 'Small';
  return 'Negligible';
}
