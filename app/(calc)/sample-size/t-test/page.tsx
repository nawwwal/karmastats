'use client';

import React, { useState } from 'react';
import type {
  IndependentSampleSizeOutput,
  PairedSampleSizeOutput,
  OneSampleSampleSizeOutput
} from '@/backend/sample-size.t-test';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, AlertCircle } from 'lucide-react';
import TTestFormFormedible from '@/components/sample-size/TTestFormFormedible';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger } from '@/components/ui/enhanced-tabs';

type Results = IndependentSampleSizeOutput | PairedSampleSizeOutput | OneSampleSampleSizeOutput;

export default function TTestPage() {
  const [activeTab, setActiveTab] = useState<'independent' | 'paired' | 'one-sample'>('independent');
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastValues, setLastValues] = useState<Record<string, unknown> | null>(null);

  const handleReset = () => {
    setResults(null);
    setError(null);
    setLastValues(null);
  };

  // PDF export removed for MVP

  const renderResults = () => {
    if (!results) return null;

    let enhancedResults: any[] = [];
    let title = '';
    let interpretationData: any = {};
    let visualizationData: any[] = [];

    if ('totalSize' in results) {
      title = 'Independent Samples t-Test Results';
      enhancedResults = [
        {
          label: 'Total Sample Size',
          value: results.totalSize,
          category: 'primary',
          highlight: true,
          format: 'integer',
          interpretation: 'Total participants needed across both groups'
        },
        {
          label: 'Group 1 Sample Size',
          value: results.group1Size,
          category: 'secondary',
          format: 'integer'
        },
        {
          label: 'Group 2 Sample Size',
          value: results.group2Size,
          category: 'secondary',
          format: 'integer'
        },
        {
          label: "Cohen's d (Effect Size)",
          value: results.cohensD,
          category: 'statistical',
          format: 'decimal',
          interpretation: results.effectSizeInterpretation
        },
      ];

      visualizationData = [
        { label: "Group 1", value: results.group1Size, color: "hsl(var(--primary))" },
        { label: "Group 2", value: results.group2Size, color: "hsl(var(--success))" }
      ];

      interpretationData.effectSize = results.effectSizeInterpretation;
    } else if ('pairsSize' in results) {
      title = 'Paired Samples t-Test Results';
      enhancedResults = [
        {
          label: 'Required Number of Pairs',
          value: results.pairsSize,
          category: 'primary',
          highlight: true,
          format: 'integer',
          interpretation: 'Matched pairs needed for adequate power'
        },
        {
          label: 'Total Observations',
          value: results.totalObservations,
          category: 'secondary',
          format: 'integer'
        },
        {
          label: "Cohen's d (Effect Size)",
          value: results.cohensD,
          category: 'statistical',
          format: 'decimal',
          interpretation: results.effectSizeInterpretation
        },
      ];

      visualizationData = [
        { label: "Pairs Required", value: results.pairsSize, color: "hsl(var(--primary))" },
        { label: "Total Observations", value: results.totalObservations, color: "hsl(var(--success))" }
      ];

      interpretationData.effectSize = results.effectSizeInterpretation;
    } else if ('sampleSize' in results) {
      title = 'One-Sample t-Test Results';
      enhancedResults = [
        {
          label: 'Required Sample Size',
          value: results.sampleSize,
          category: 'primary',
          highlight: true,
          format: 'integer',
          interpretation: 'Participants needed to detect the specified effect'
        },
        {
          label: "Cohen's d (Effect Size)",
          value: results.cohensD,
          category: 'statistical',
          format: 'decimal',
          interpretation: results.effectSizeInterpretation
        },
      ];

      visualizationData = [
        { label: "Sample Size", value: results.sampleSize, color: "hsl(var(--primary))" }
      ];

      interpretationData.effectSize = results.effectSizeInterpretation;
    }

    const effectSizeData = [
      { label: "Small Effect (d=0.2)", value: 0.2 },
      { label: "Medium Effect (d=0.5)", value: 0.5 },
      { label: "Large Effect (d=0.8)", value: 0.8 },
      { label: "Current Study", value: results.cohensD }
    ];

    interpretationData.statisticalSignificance = `Cohen's d = ${results.cohensD.toFixed(3)} indicates ${results.effectSizeInterpretation.toLowerCase()} effect size`;
    interpretationData.recommendations = [
      'Ensure data meets normality assumptions or consider non-parametric alternatives (e.g., Wilcoxon test).',
      'For independent tests, verify homogeneity of variances (Levene test).',
      'Report the effect size (Cohen\'s d) and its confidence interval alongside p-values.',
      'Consider increasing sample size by 10-20% to account for potential data quality issues.'
    ];
    interpretationData.assumptions = [
      'Data follows a normal distribution',
      'Independent observations',
      'Equal variances between groups (for independent t-test)',
      'Continuous outcome variable'
    ];

    return (
      <div className="space-y-8">
        <EnhancedResultsDisplay
          title={title}
          subtitle="Statistical power analysis and sample size determination"
          results={enhancedResults}
          interpretation={interpretationData}
          visualizations={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvancedVisualization
                title="Sample Size Distribution"
                type="pie"
                data={visualizationData}
                insights={[
                  {
                    key: "Total required",
                    value: ('totalSize' in results ? results.totalSize :
                           'pairsSize' in results ? results.pairsSize :
                           results.sampleSize).toString(),
                    significance: "high"
                  },
                  {
                    key: "Effect size",
                    value: results.effectSizeInterpretation,
                    significance: "medium"
                  }
                ]}
              />

              <AdvancedVisualization
                title="Effect Size Comparison"
                type="comparison"
                data={effectSizeData}
                insights={[
                  {
                    key: "Cohen's d",
                    value: results.cohensD.toFixed(3),
                    significance: "high"
                  },
                  {
                    key: "Interpretation",
                    value: results.effectSizeInterpretation,
                    significance: "medium"
                  }
                ]}
              />
            </div>
          }
        />

        {/* PDF export removed */}
      </div>
    );
  };

  return (
    <ToolPageWrapper
      title="T-Test Sample Size Calculator"
      description="Calculate sample sizes for independent, paired, and one-sample t-tests with comprehensive power analysis and advanced visualizations"
      backHref="/"
      backLabel="Sample Size Calculator"
      onReset={handleReset}
      icon={Calculator}
      layout="single-column"
    >
      <div className="space-y-8">
        <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
          <CardContent>
            {error && (
              <Alert className="mb-6 border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <EnhancedTabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
                <EnhancedTabsList className="grid w-full grid-cols-3" variant="modern">
                  <EnhancedTabsTrigger value="independent" variant="modern">Independent</EnhancedTabsTrigger>
                  <EnhancedTabsTrigger value="paired" variant="modern">Paired</EnhancedTabsTrigger>
                  <EnhancedTabsTrigger value="one-sample" variant="modern">One-Sample</EnhancedTabsTrigger>
                </EnhancedTabsList>
              </EnhancedTabs>

              <TTestFormFormedible
                activeTab={activeTab}
                onResults={(r, vals) => {
                  setResults(r);
                  setLastValues(vals);
                }}
                onError={(msg) => setError(msg || null)}
              />
            </div>
          </CardContent>
        </Card>

        {results && renderResults()}
      </div>
    </ToolPageWrapper>
  );
}
