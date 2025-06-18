import React from 'react';
import { invertMatrix, matrixMultiply, transpose } from "./math/matrix";
import { fcdf, tcdf, erf } from "./math/statistics";
import { z } from 'zod';

// Zod validation schemas
export const LinearRegressionSchema = z.object({
  xValues: z.array(z.number()).min(2, 'At least 2 data points required'),
  yValues: z.array(z.number()).min(2, 'At least 2 data points required'),
}).refine(data => data.xValues.length === data.yValues.length, {
  message: "X and Y values must have equal length"
});

export const PolynomialRegressionSchema = z.object({
  xValues: z.array(z.number()).min(2, 'At least 2 data points required'),
  yValues: z.array(z.number()).min(2, 'At least 2 data points required'),
  degree: z.number().int().min(1).max(10, 'Degree must be between 1 and 10'),
}).refine(data => data.xValues.length === data.yValues.length, {
  message: "X and Y values must have equal length"
});

export const LogisticRegressionSchema = z.object({
  y: z.array(z.number().min(0).max(1)).min(2, 'At least 2 observations required'),
  X: z.array(z.array(z.number())).min(2, 'At least 2 observations required'),
  options: z.object({
    learningRate: z.number().positive().optional(),
    iterations: z.number().int().positive().optional(),
    tolerance: z.number().positive().optional(),
  }).optional(),
}).refine(data => data.y.length === data.X.length, {
  message: "Y and X must have equal number of observations"
});

export const MultipleRegressionSchema = z.object({
  y: z.array(z.number()).min(2, 'At least 2 observations required'),
  X: z.array(z.array(z.number())).min(2, 'At least 2 observations required'),
}).refine(data => data.y.length === data.X.length, {
  message: "Y and X must have equal number of observations"
});

export type LinearRegressionInput = z.infer<typeof LinearRegressionSchema>;
export type PolynomialRegressionInput = z.infer<typeof PolynomialRegressionSchema>;
export type LogisticRegressionInput = z.infer<typeof LogisticRegressionSchema>;
export type MultipleRegressionInput = z.infer<typeof MultipleRegressionSchema>;

// Simple Linear Regression
export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  correlation: number;
  predictedY: number[];
  residuals: number[];
  standardError: number;
  xValues: number[];
  yValues: number[];
  chartData?: any;
  chartComponent?: React.ReactNode;
}

export function linearRegression(xValues: number[], yValues: number[]): LinearRegressionResult | { error: string } {
  if (!xValues || !yValues || xValues.length !== yValues.length || xValues.length < 2) {
    return { error: "Input data must have at least 2 data points and equal number of X and Y values." };
  }
  const n = xValues.length;
  const meanX = xValues.reduce((sum, x) => sum + x, 0) / n;
  const meanY = yValues.reduce((sum, y) => sum + y, 0) / n;
  let ssXY = 0, ssXX = 0, ssYY = 0;
  for (let i = 0; i < n; i++) {
    const diffX = xValues[i] - meanX;
    const diffY = yValues[i] - meanY;
    ssXY += diffX * diffY;
    ssXX += diffX * diffX;
    ssYY += diffY * diffY;
  }
  // Check for division by zero
  if (ssXX === 0) {
    return { error: "All X values are identical - cannot calculate slope." };
  }
  if (ssYY === 0) {
    return { error: "All Y values are identical - R-squared undefined." };
  }

  const slope = ssXY / ssXX;
  const intercept = meanY - (slope * meanX);
  const rSquared = Math.pow(ssXY, 2) / (ssXX * ssYY);
  const r = Math.sqrt(rSquared) * (slope >= 0 ? 1 : -1);
  const predictedY = xValues.map(x => intercept + slope * x);
  const residuals = yValues.map((y, i) => y - predictedY[i]);
  const sumResidualSquares = residuals.reduce((sum, res) => sum + res * res, 0);
  const standardError = Math.sqrt(sumResidualSquares / (n - 2));
  return {
    slope,
    intercept,
    rSquared,
    correlation: r,
    predictedY,
    residuals,
    standardError,
    xValues,
    yValues
  };
}

// Polynomial Regression
export function polynomialRegression(xValues: number[], yValues: number[], degree: number): MultipleRegressionResult | { error: string } {
  if (degree < 1) {
    return { error: "Degree must be at least 1." };
  }
  const X_poly = xValues.map(x => {
    const row = [];
    for (let i = 1; i <= degree; i++) {
      row.push(Math.pow(x, i));
    }
    return row;
  });

  return multipleRegression(yValues, X_poly);
}

// Logistic Regression
export interface LogisticRegressionResult {
    coefficients: number[];
    standardErrors: number[];
    zStats: number[];
    pValues: number[];
    logLikelihood: number;
    aic: number;
    iterations: number;
    chartData?: any;
    chartComponent?: React.ReactNode;
}

function sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
}

export function logisticRegression(
    y: number[],
    X: number[][],
    options: { learningRate?: number; iterations?: number; tolerance?: number } = {}
): LogisticRegressionResult | { error: string } {
    const { learningRate = 0.01, iterations = 1000, tolerance = 1e-6 } = options;
    const n = X.length;
    const p = X[0].length;

    const X1 = X.map(row => [1, ...row]); // Add intercept term

    let coefficients = new Array(p + 1).fill(0);

    let lastLogLikelihood = -Infinity;

    for (let iter = 0; iter < iterations; iter++) {
        const z = X1.map(row => row.reduce((sum, val, j) => sum + val * coefficients[j], 0));
        const predictions = z.map(sigmoid);
        const errors = predictions.map((p, i) => y[i] - p);

        const gradient = X1[0].map((_, j) =>
            X1.reduce((sum, row, i) => sum + row[j] * errors[i], 0) / n
        );

        coefficients = coefficients.map((c, j) => c + learningRate * gradient[j]);

        const logLikelihood = y.reduce((sum, actual, i) =>
            sum + (actual * Math.log(predictions[i] + 1e-9) + (1 - actual) * Math.log(1 - predictions[i] + 1e-9)), 0);

        if (Math.abs(logLikelihood - lastLogLikelihood) < tolerance) {
            // Converged
            break;
        }
        lastLogLikelihood = logLikelihood;
    }

    // Fisher Information Matrix for standard errors
    const z = X1.map(row => row.reduce((sum, val, j) => sum + val * coefficients[j], 0));
    const predictions = z.map(sigmoid);
    const W = predictions.map(p => p * (1-p));

    const X1T = transpose(X1);
    const X1TW = X1T.map((row, i) => row.map((val, j) => val * W[j]));
    const FisherInfo = matrixMultiply(X1TW, X1);
    const FisherInfo_inv = invertMatrix(FisherInfo);

    if(!FisherInfo_inv) {
        return { error: "Could not compute standard errors. Matrix is singular."};
    }

    const standardErrors = FisherInfo_inv.map((row, i) => Math.sqrt(Math.abs(row[i])));
    const zStats = coefficients.map((c, i) => c / standardErrors[i]);
    const pValues = zStats.map(z => 2 * (1 - (0.5 * (1 + erf(Math.abs(z) / Math.sqrt(2)))))); // Using error function for normal CDF

    const aic = 2 * (p + 1) - 2 * lastLogLikelihood;

    return {
        coefficients,
        standardErrors,
        zStats,
        pValues,
        logLikelihood: lastLogLikelihood,
        aic,
        iterations
    };
}

// Multiple Regression
export interface MultipleRegressionResult {
  coefficients: number[];
  rSquared: number;
  adjustedRSquared: number;
  residuals: number[];
  predictedY: number[];
  stdErrors: number[];
  tStats: number[];
  pValues: number[];
  F: number;
  fPValue: number;
  n: number;
  p: number;
  X: number[][];
  y: number[];
  chartData?: any;
  chartComponent?: React.ReactNode;
}

export function multipleRegression(y: number[], X: number[][]): MultipleRegressionResult | { error: string } {
  if (y.length < 2 || X.length < 2 || X[0].length < 1) {
    return { error: "Input data must have at least 2 observations and at least 1 independent variable" };
  }

  // Additional precondition checks
  if (y.length !== X.length) {
    return { error: "Number of observations in Y and X must be equal" };
  }

  if (y.some(val => !isFinite(val))) {
    return { error: "Y values must be finite numbers" };
  }

  if (X.some(row => row.some(val => !isFinite(val)))) {
    return { error: "X values must be finite numbers" };
  }
  const n = y.length;
  const p = X[0].length;
  const X1 = X.map(row => [1, ...row]);
  const X1T = transpose(X1);
  const X1TX1 = matrixMultiply(X1T, X1);
  const X1TX1_inv = invertMatrix(X1TX1);
  if (!X1TX1_inv) {
    return { error: "Matrix inversion failed. Data might be perfectly collinear or ill-conditioned." };
  }
  const X1Ty = X1T.map(row => row.reduce((sum, val, j) => sum + val * y[j], 0));
  const coefficients = X1TX1_inv.map(row => row.reduce((sum, val, j) => sum + val * X1Ty[j], 0));
  const predictedY = X.map(row => coefficients[0] + row.reduce((sum, x, j) => sum + coefficients[j + 1] * x, 0));
  const residuals = y.map((actual, i) => actual - predictedY[i]);
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  let SST = 0, SSR = 0, SSE = 0;
  for (let i = 0; i < n; i++) {
    SST += Math.pow(y[i] - yMean, 2);
    SSR += Math.pow(predictedY[i] - yMean, 2);
    SSE += Math.pow(residuals[i], 2);
  }
  const rSquared = SSR / SST;
  const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - p - 1));
  const MSE = SSE / (n - p - 1);
  const stdErrors = X1TX1_inv.map((row, i) => Math.sqrt(MSE * row[i]));
  const tStats = coefficients.map((coef, i) => coef / stdErrors[i]);
  const pValues = tStats.map(t => {
    const df = n - p - 1;
    return 2 * (1 - tcdf(Math.abs(t), df));
  });
  const F = (SSR / p) / (SSE / (n - p - 1));
  const fPValue = 1 - fcdf(F, p, n - p - 1);
  return {
    coefficients,
    rSquared,
    adjustedRSquared,
    residuals,
    predictedY,
    stdErrors,
    tStats,
    pValues,
    F,
    fPValue,
    n,
    p,
    X,
    y
  };
}
