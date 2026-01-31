'use client';

import React, { useState } from 'react';

import { CrossSectionalOutput } from '@/backend/sample-size.cross-sectional';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import CrossSectionalFormFormedible from '@/components/sample-size/CrossSectionalFormFormedible';
import { BarChart, AlertCircle, Target, TrendingUp } from 'lucide-react';

export default function CrossSectionalPage() {
  const [results, setResults] = useState<CrossSectionalOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastValues, setLastValues] = useState<Record<string, unknown> | null>(
    null,
  );

  const handleReset = () => {
    setResults(null);
    setError(null);
    setShowAdvanced(false);
    setLastValues(null);
  };

  const handleResults = (
    results: CrossSectionalOutput,
    values: Record<string, unknown>
  ) => {
    setResults(results);
    setLastValues(values);
    setError(null);
  };

  // PDF export removed for MVP

  const renderResults = () => {
    if (!results || !lastValues) return null;

    const formData = lastValues;

    const enhancedResults = [
      {
        label: 'Final Required Sample Size',
        value: results.finalSize,
        format: 'integer' as const,
        category: 'primary' as const,
        highlight: true,
        interpretation: 'Total participants needed including all adjustments',
      },
      {
        label: "Base Sample Size (Cochran's)",
        value: results.baseSize,
        format: 'integer' as const,
        category: 'secondary' as const,
        interpretation: 'Basic sample size before adjustments',
      },
      {
        label: 'After Design Effect',
        value: results.designAdjustedSize,
        format: 'integer' as const,
        category: 'secondary' as const,
        interpretation: 'Sample size after design effect adjustment',
      },
      {
        label: 'After Population Correction',
        value: results.populationAdjustedSize,
        format: 'integer' as const,
        category: 'secondary' as const,
        interpretation: 'Sample size after finite population correction',
      },
    ];

    if (
      formData.clusteringEffect &&
      (formData.clusteringEffect as number) > 0
    ) {
      enhancedResults.push({
        label: 'After Clustering Adjustment',
        value: results.clusterAdjustedSize,
        format: 'integer' as const,
        category: 'secondary' as const,
        interpretation: 'Sample size after clustering effect adjustment',
      });
    }

    const visualizationData = [
      {
        label: 'Base Sample',
        value: results.baseSize,
        color: 'hsl(var(--muted))',
      },
      {
        label: 'Design Adjusted',
        value: results.designAdjustedSize - results.baseSize,
        color: 'hsl(var(--primary))',
      },
      {
        label: 'Population Corrected',
        value: results.populationAdjustedSize - results.designAdjustedSize,
        color: 'hsl(var(--secondary))',
      },
      {
        label: 'Final Adjustments',
        value: results.finalSize - results.populationAdjustedSize,
        color: 'hsl(var(--success))',
      },
    ].filter((item) => item.value > 0);

    const interpretationData = {
      effectSize: `Prevalence estimation with ${formData.marginOfError}% precision`,
      statisticalSignificance: `${formData.confidenceLevel}% confidence level`,
      clinicalSignificance: `Study can detect prevalence within ±${formData.marginOfError}% of true value`,
      recommendations: [
        'Ensure random sampling from the target population',
        'Consider stratification to improve precision for subgroups',
        'Plan for potential non-response and implement follow-up procedures',
        'Use appropriate sampling frame that covers target population',
        'Validate prevalence assumptions with pilot data if possible',
      ],
      assumptions: [
        'Simple random sampling or equivalent design',
        'Response rate assumptions are met',
        'Population size estimate is accurate (if finite)',
        'Clustering effects are correctly specified',
        'Prevalence estimate is reasonable for the population',
      ],
    };

    return (
      <div className="space-y-8">
        <EnhancedResultsDisplay
          title="Cross-Sectional Study Results"
          subtitle="Population-based prevalence study sample size analysis"
          results={enhancedResults}
          interpretation={interpretationData}
          visualizations={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvancedVisualization
                title="Sample Size Breakdown"
                type="pie"
                data={visualizationData}
                insights={[
                  {
                    key: 'Final sample size',
                    value: results.finalSize.toString(),
                    significance: 'high',
                  },
                  {
                    key: 'Precision',
                    value: `±${formData.marginOfError}%`,
                    significance: 'medium',
                  },
                ]}
              />

              <AdvancedVisualization
                title="Study Parameters"
                type="comparison"
                data={[
                  {
                    label: 'Expected Prevalence',
                    value: formData.prevalence as number,
                  },
                  {
                    label: 'Margin of Error',
                    value: formData.marginOfError as number,
                  },
                  {
                    label: 'Confidence Level',
                    value: Number(formData.confidenceLevel),
                  },
                  {
                    label: 'Design Effect',
                    value: (formData.designEffect as number) || 1,
                  },
                ]}
              />
            </div>
          }
        />

        {/* PDF export removed */}
      </div>
    );
  };

  const renderInputForm = () => (
    <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
      <CardContent className="space-y-8 pt-8">
        {error && (
          <Alert className="border-destructive/20 bg-destructive/10 text-left">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive font-bold text-left">
              Calculation Error
            </AlertTitle>
            <AlertDescription className="text-destructive text-left">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5" />
              Study Parameters
            </CardTitle>
            <CardDescription>
              Basic parameters for prevalence estimation in cross-sectional
              studies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <CrossSectionalFormFormedible
              onResults={handleResults}
              onError={setError}
              showAdvanced={showAdvanced}
            />
          </CardContent>
        </Card>

        <div className="flex items-center space-x-2">
          <Switch
            id="advanced-switch"
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
          <Label htmlFor="advanced-switch" className="text-base font-medium">
            Show Advanced Options
          </Label>
        </div>

        {showAdvanced && (
          <Card className="border-primary/20 bg-primary/10 dark:bg-primary/20 dark:border-primary/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Advanced Parameters
              </CardTitle>
              <CardDescription>
                Design effects, population corrections, and clustering
                adjustments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CrossSectionalFormFormedible
                onResults={handleResults}
                onError={setError}
                showAdvanced={showAdvanced}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ToolPageWrapper
      title="Cross-Sectional Study Sample Size Calculator"
      description="Calculate sample sizes for prevalence studies with advanced adjustments for design effects and clustering"
      icon={BarChart}
      layout="single-column"
      onReset={handleReset}
    >
      {renderInputForm()}
      {results && renderResults()}
    </ToolPageWrapper>
  );
}
