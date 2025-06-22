"use client";

import React from 'react';
import { ModernResultsDisplay } from './modern-results-display';

// Helper function to determine statistical significance
const getStatisticalSignificance = (pValue?: number) => {
  if (!pValue) return { level: 'low' as const, indicator: 'Not available' };

  if (pValue < 0.001) return { level: 'critical' as const, indicator: 'p < 0.001 (****)' };
  if (pValue < 0.01) return { level: 'high' as const, indicator: 'p < 0.01 (***)' };
  if (pValue < 0.05) return { level: 'medium' as const, indicator: 'p < 0.05 (**)' };
  return { level: 'low' as const, indicator: `p = ${pValue.toFixed(3)} (ns)` };
};

// Helper function to determine effect size interpretation
const getEffectSizeInterpretation = (value: number, type: 'correlation' | 'rsquared' | 'cohen') => {
  switch (type) {
    case 'correlation':
      const absCorr = Math.abs(value);
      if (absCorr >= 0.7) return { level: 'high' as const, indicator: 'Strong relationship' };
      if (absCorr >= 0.3) return { level: 'medium' as const, indicator: 'Moderate relationship' };
      return { level: 'low' as const, indicator: 'Weak relationship' };

    case 'rsquared':
      if (value >= 0.7) return { level: 'high' as const, indicator: 'Strong model fit' };
      if (value >= 0.5) return { level: 'medium' as const, indicator: 'Moderate model fit' };
      if (value >= 0.3) return { level: 'low' as const, indicator: 'Weak model fit' };
      return { level: 'critical' as const, indicator: 'Poor model fit' };

    case 'cohen':
      const absCohen = Math.abs(value);
      if (absCohen >= 0.8) return { level: 'high' as const, indicator: 'Large effect' };
      if (absCohen >= 0.5) return { level: 'medium' as const, indicator: 'Medium effect' };
      if (absCohen >= 0.2) return { level: 'low' as const, indicator: 'Small effect' };
      return { level: 'critical' as const, indicator: 'Negligible effect' };

    default:
      return { level: 'low' as const, indicator: 'No interpretation' };
  }
};

interface StatisticalSummaryProps {
  results: any; // The statistical results object
  type: 'regression' | 'ttest' | 'correlation' | 'sample-size' | 'disease-model';
  title?: string;
  className?: string;
}

export function StatisticalSummary({ results, type, title, className }: StatisticalSummaryProps) {
  const convertToModernMetrics = () => {
    switch (type) {
      case 'regression':
        return [
          {
            label: 'R-Squared',
            value: (results.rSquared || 0) * 100,
            format: 'percentage' as const,
            category: 'primary' as const,
            significance: getEffectSizeInterpretation(results.rSquared || 0, 'rsquared'),
            trend: (results.rSquared || 0) >= 0.5 ? 'up' as const : 'down' as const,
            comparison: {
              baseline: 50,
              label: 'vs. acceptable threshold'
            }
          },
          ...(results.adjustedRSquared !== undefined ? [{
            label: 'Adjusted R²',
            value: results.adjustedRSquared * 100,
            format: 'percentage' as const,
            category: 'secondary' as const,
            significance: getEffectSizeInterpretation(results.adjustedRSquared, 'rsquared'),
            change: {
              value: Math.abs(((results.adjustedRSquared - (results.rSquared || 0)) / (results.rSquared || 1)) * 100),
              type: results.adjustedRSquared > (results.rSquared || 0) ? 'increase' as const : 'decrease' as const,
              label: 'adjustment effect'
            }
          }] : []),
          ...(results.correlation !== undefined ? [{
            label: 'Correlation',
            value: results.correlation,
            format: 'decimal' as const,
            category: 'info' as const,
            significance: getEffectSizeInterpretation(results.correlation, 'correlation'),
            trend: results.correlation > 0 ? 'up' as const : 'down' as const
          }] : []),
          ...(results.fPValue !== undefined ? [{
            label: 'F-Statistic',
            value: results.F || 0,
            format: 'decimal' as const,
            category: results.fPValue < 0.05 ? 'success' as const : 'warning' as const,
            significance: getStatisticalSignificance(results.fPValue),
          }] : [])
        ];

      case 'disease-model':
        const attackRate = results.metrics?.attackRate || 0;
        const r0 = results.metrics?.r0 || 0;

        return [
          {
            label: 'Peak Infections',
            value: results.metrics?.peakInfected || 0,
            format: 'integer' as const,
            category: 'destructive' as const,
            trend: 'up' as const,
            comparison: {
              baseline: results.populationSize * 0.1,
              label: 'vs. 10% population'
            }
          },
          {
            label: 'R₀ (Reproduction Number)',
            value: r0,
            format: 'decimal' as const,
            category: r0 > 1 ? 'warning' as const : 'success' as const,
            significance: {
              level: r0 > 2 ? 'critical' as const : r0 > 1 ? 'high' as const : 'low' as const,
              indicator: r0 > 1 ? 'Epidemic spread' : 'Disease containment'
            },
            comparison: {
              baseline: 1,
              label: 'vs. epidemic threshold'
            }
          },
          {
            label: 'Attack Rate',
            value: attackRate * 100,
            format: 'percentage' as const,
            category: attackRate > 0.5 ? 'destructive' as const : 'warning' as const,
            trend: attackRate > 0.3 ? 'up' as const : 'down' as const,
          },
          {
            label: 'Total Deaths',
            value: results.metrics?.totalDeaths || 0,
            format: 'integer' as const,
            category: 'destructive' as const,
            change: {
              value: ((results.metrics?.mortalityRate || 0) * 100),
              type: 'neutral' as const,
              label: 'mortality rate'
            }
          }
        ];

      case 'sample-size':
        return [
          {
            label: 'Required Sample Size',
            value: results.totalSize || results.sampleSize || 0,
            format: 'integer' as const,
            category: 'primary' as const,
            trend: 'up' as const,
          },
          ...(results.power ? [{
            label: 'Statistical Power',
            value: results.power * 100,
            format: 'percentage' as const,
            category: results.power >= 0.8 ? 'success' as const : 'warning' as const,
            significance: {
              level: results.power >= 0.9 ? 'high' as const : results.power >= 0.8 ? 'medium' as const : 'low' as const,
              indicator: results.power >= 0.8 ? 'Adequate power' : 'Underpowered'
            },
            comparison: {
              baseline: 80,
              label: 'vs. minimum standard'
            }
          }] : []),
          ...(results.alpha ? [{
            label: 'Significance Level',
            value: results.alpha * 100,
            format: 'percentage' as const,
            category: 'info' as const,
            significance: {
              level: 'medium' as const,
              indicator: 'Type I error rate'
            }
          }] : []),
          ...(results.effectSize ? [{
            label: 'Effect Size',
            value: results.effectSize,
            format: 'decimal' as const,
            category: 'secondary' as const,
            significance: getEffectSizeInterpretation(results.effectSize, 'cohen')
          }] : [])
        ];

      default:
        return [];
    }
  };

  const metrics = convertToModernMetrics();

  if (metrics.length === 0) {
    return null;
  }

  return (
    <ModernResultsDisplay
      title={title}
      metrics={metrics}
      layout="grid-2"
      animated={true}
      showComparisons={true}
      className={className}
    />
  );
}
