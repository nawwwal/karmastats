'use client';

import React, { useState, useCallback } from 'react';
import {
  SingleTestOutput,
  ComparativeTestOutput,
  ROCAnalysisOutput,
} from '@/backend/sample-size.diagnostic';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  EnhancedTabs,
  EnhancedTabsContent,
  EnhancedTabsList,
  EnhancedTabsTrigger,
} from '@/components/ui/enhanced-tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import DiagnosticTestFormFormedible from '@/components/sample-size/DiagnosticTestFormFormedible';
import { Target, AlertCircle } from 'lucide-react';

type Results = SingleTestOutput | ComparativeTestOutput | ROCAnalysisOutput;

export default function DiagnosticTestPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'comparative' | 'roc'>(
    'single',
  );
    const [results, setResults] = useState<Results | null>(null);
    const [error, setError] = useState<string | null>(null);
  const [lastValues, setLastValues] = useState<Record<string, unknown> | null>(
    null,
  );

  const handleResults = useCallback(
    (
      results: Results,
      values: Record<string, unknown>,
      tab: 'single' | 'comparative' | 'roc',
    ) => {
      setResults(results);
      setLastValues(values);
      setActiveTab(tab);
      setError(null);
    },
    [],
  );

  // PDF export removed for MVP

    const renderResults = () => {
        if (!results) return null;

        let enhancedResults: any[] = [];
        let title = '';
        let visualizationData: any[] = [];

        if ('nSensitivity' in results) {
            title = 'Single Test Evaluation Results';
            enhancedResults = [
                {
                    label: 'Total Required Sample Size',
                    value: results.totalSize,
                    format: 'integer' as const,
                    category: 'primary' as const,
                    highlight: true,
          interpretation:
            'Total participants needed for adequate sensitivity and specificity evaluation',
                },
                {
                    label: 'Disease Positive Cases',
                    value: results.diseasePositive,
                    format: 'integer' as const,
                    category: 'secondary' as const,
          interpretation: 'Number of participants with the disease',
                },
                {
                    label: 'Disease Negative Cases',
                    value: results.diseaseNegative,
                    format: 'integer' as const,
                    category: 'secondary' as const,
          interpretation: 'Number of participants without the disease',
                },
                {
                    label: 'Sample Size for Sensitivity',
                    value: results.nSensitivity,
                    format: 'integer' as const,
                    category: 'statistical' as const,
          interpretation: 'Required sample size to estimate sensitivity',
                },
                {
                    label: 'Sample Size for Specificity',
                    value: results.nSpecificity,
                    format: 'integer' as const,
                    category: 'statistical' as const,
          interpretation: 'Required sample size to estimate specificity',
        },
            ];

            visualizationData = [
        {
          label: 'Disease Positive',
          value: results.diseasePositive,
          color: 'hsl(var(--destructive))',
        },
        {
          label: 'Disease Negative',
          value: results.diseaseNegative,
          color: 'hsl(var(--success))',
        },
            ];
        } else if ('sampleSize' in results) {
            title = 'Comparative Test Study Results';
            enhancedResults = [
                {
                    label: 'Required Sample Size per Group',
                    value: results.sampleSize,
                    format: 'integer' as const,
                    category: 'primary' as const,
                    highlight: true,
          interpretation: 'Participants needed per group (if unpaired design)',
                },
                {
                    label: 'Total Subjects to Screen',
                    value: results.totalSize,
                    format: 'integer' as const,
                    category: 'secondary' as const,
          interpretation: 'Total participants needed for the study',
        },
            ];

            visualizationData = [
        {
          label: 'Per Group Sample',
          value: results.sampleSize,
          color: 'hsl(var(--primary))',
        },
        {
          label: 'Total Sample',
          value: results.totalSize,
          color: 'hsl(var(--secondary))',
        },
            ];
        } else if ('positiveSize' in results) {
            title = 'ROC Analysis Results';
            enhancedResults = [
                {
                    label: 'Total Required Sample Size',
                    value: results.totalSize,
                    format: 'integer' as const,
                    category: 'primary' as const,
                    highlight: true,
          interpretation: 'Total participants needed for ROC curve analysis',
                },
                {
                    label: 'Disease-Positive Cases',
                    value: results.positiveSize,
                    format: 'integer' as const,
                    category: 'secondary' as const,
          interpretation: 'Number of participants with the disease',
                },
                {
                    label: 'Disease-Negative Cases',
                    value: results.negativeSize,
                    format: 'integer' as const,
                    category: 'secondary' as const,
          interpretation: 'Number of participants without the disease',
        },
            ];

            visualizationData = [
        {
          label: 'Disease Positive',
          value: results.positiveSize,
          color: 'hsl(var(--destructive))',
        },
        {
          label: 'Disease Negative',
          value: results.negativeSize,
          color: 'hsl(var(--success))',
        },
            ];
        }

        const interpretationData = {
      effectSize: `${
        activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
      } test evaluation design`,
      statisticalSignificance:
        'Adequate sample size for diagnostic test validation',
      clinicalSignificance:
        'Sample size provides reliable estimates of test performance',
            recommendations: [
            'Ensure proper randomization and blinding in diagnostic test evaluation',
            'Consider spectrum bias when selecting patient populations',
            'Account for verification bias in test result interpretation',
                'Plan for adequate reference standard procedures',
        'Validate test performance in relevant clinical populations',
            ],
            assumptions: [
            'Reference standard has perfect sensitivity and specificity',
            'Test results are independent conditional on disease status',
            'Study population is representative of intended use population',
                'No spectrum or verification bias present',
        'Disease prevalence assumptions are accurate',
      ],
        };

        return (
            <div className="space-y-8">
                <EnhancedResultsDisplay
                    title={title}
                    subtitle="Diagnostic test validation study sample size analysis"
                    results={enhancedResults}
                    interpretation={interpretationData}
                    visualizations={
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AdvancedVisualization
                                title="Sample Composition"
                                type="pie"
                                data={visualizationData}
                                insights={[
                                    {
                    key: 'Total sample',
                    value: (
                      'totalSize' in results
                        ? results.totalSize
                        : results.sampleSize
                    ).toString(),
                    significance: 'high',
                  },
                  {
                    key: 'Test type',
                                        value: activeTab.replace('-', ' '),
                    significance: 'medium',
                  },
                                ]}
                            />

                            <AdvancedVisualization
                                title="Test Performance Metrics"
                                type="comparison"
                                data={[
                  {
                    label: 'Expected Sensitivity',
                    value: (lastValues?.expectedSensitivity as number) || 0,
                  },
                  {
                    label: 'Expected Specificity',
                    value: (lastValues?.expectedSpecificity as number) || 0,
                  },
                  {
                    label: 'Disease Prevalence',
                    value: (lastValues?.diseasePrevalence as number) || 0,
                  },
                ].filter((item) => item.value > 0)}
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
            title="Diagnostic Test Sample Size Calculator"
            description="Calculate sample sizes for diagnostic test evaluation, comparison studies, and ROC analysis"
            icon={Target}
            layout="single-column"
        >
      <EnhancedTabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="space-y-4"
      >
        <EnhancedTabsList className="grid w-full grid-cols-3" variant="modern">
          <EnhancedTabsTrigger value="single" variant="modern">
            Single Test
          </EnhancedTabsTrigger>
          <EnhancedTabsTrigger value="comparative" variant="modern">
            Comparative
          </EnhancedTabsTrigger>
          <EnhancedTabsTrigger value="roc" variant="modern">
            ROC Analysis
          </EnhancedTabsTrigger>
        </EnhancedTabsList>

        <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              {activeTab === 'single'
                ? 'Single Test Evaluation'
                : activeTab === 'comparative'
                ? 'Comparative Test Study'
                : 'ROC Analysis'}
            </CardTitle>
            <CardDescription className="text-lg">
              {activeTab === 'single'
                ? 'Calculate sample size for evaluating sensitivity and specificity'
                : activeTab === 'comparative'
                ? 'Compare performance between two diagnostic tests'
                : 'Sample size for ROC curve area comparison'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert
                variant="destructive"
                className="mb-6 border-destructive/20 bg-destructive/10"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DiagnosticTestFormFormedible
              onResults={handleResults}
              onError={setError}
              activeTab={activeTab}
            />
          </CardContent>
        </Card>
      </EnhancedTabs>

            {renderResults()}
        </ToolPageWrapper>
    );
}
