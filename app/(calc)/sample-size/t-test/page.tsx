'use client';

import React, { useState } from 'react';
import type {
  IndependentSampleSizeOutput,
  PairedSampleSizeOutput,
  OneSampleSampleSizeOutput
} from '@/lib/math/sample-size/tTest';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, AlertCircle, Download } from 'lucide-react';
import TTestFormFormedible from '@/components/sample-size/TTestFormFormedible';

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

  const generatePdf = async () => {
    if (!results) return;

    try {
      const { generateModernPDF } = await import('@/lib/pdf-utils');
      const formData = (lastValues || {}) as any;

      let config: any = {
        calculatorType: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} T-Test`,
        inputs: [],
        results: [],
        interpretation: {
          recommendations: [
            'Ensure data meets normality assumptions or consider non-parametric alternatives',
            'For independent tests, verify homogeneity of variances (Levene test)',
            'Report the effect size (Cohen\'s d) and its confidence interval alongside p-values',
            'Consider increasing sample size by 10-20% to account for potential data quality issues'
          ],
          assumptions: [
            'Data follows a normal distribution',
            'Independent observations',
            'Equal variances between groups (for independent t-test)',
            'Continuous outcome variable'
          ]
        }
      };

      if ('totalSize' in results) {
        config.title = "Independent Samples T-Test Analysis";
        config.subtitle = "Two-Group Comparison Sample Size Calculation";
        config.inputs = [
          { label: "Group 1 Mean", value: formData.group1Mean },
          { label: "Group 2 Mean", value: formData.group2Mean },
          { label: "Pooled Standard Deviation", value: formData.pooledSD },
          { label: "Allocation Ratio", value: formData.allocationRatio },
          { label: "Significance Level", value: Number(formData.significanceLevel ?? 5), unit: "%" },
          { label: "Statistical Power", value: Number(formData.power ?? 80), unit: "%" }
        ];
        config.results = [
          { label: "Total Sample Size", value: results.totalSize, highlight: true, category: "primary", format: "integer" },
          { label: "Group 1 Sample Size", value: results.group1Size, category: "secondary", format: "integer" },
          { label: "Group 2 Sample Size", value: results.group2Size, category: "secondary", format: "integer" },
          { label: "Cohen's d (Effect Size)", value: results.cohensD, category: "statistical", format: "decimal", precision: 3 }
        ];
        config.interpretation.summary = `This independent samples t-test requires ${results.totalSize} participants total (${results.group1Size} in Group 1 and ${results.group2Size} in Group 2) to detect a difference between means of ${formData.group1Mean} and ${formData.group2Mean} with Cohen's d = ${results.cohensD.toFixed(3)} (${results.effectSizeInterpretation.toLowerCase()} effect size).`;
      } else if ('pairsSize' in results) {
        config.title = "Paired Samples T-Test Analysis";
        config.subtitle = "Matched Pairs Comparison Sample Size Calculation";
        config.inputs = [
          { label: "Expected Mean Difference", value: formData.meanDifference },
          { label: "Standard Deviation of Differences", value: formData.sdDifference },
          { label: "Correlation between Pairs", value: formData.correlation },
          { label: "Significance Level", value: Number(formData.significanceLevel ?? 5), unit: "%" },
          { label: "Statistical Power", value: Number(formData.power ?? 80), unit: "%" }
        ];
        config.results = [
          { label: "Required Number of Pairs", value: results.pairsSize, highlight: true, category: "primary", format: "integer" },
          { label: "Total Observations", value: results.totalObservations, category: "secondary", format: "integer" },
          { label: "Cohen's d (Effect Size)", value: results.cohensD, category: "statistical", format: "decimal", precision: 3 }
        ];
        config.interpretation.summary = `This paired samples t-test requires ${results.pairsSize} matched pairs (${results.totalObservations} total observations) to detect a mean difference of ${formData.meanDifference} with Cohen's d = ${results.cohensD.toFixed(3)} (${results.effectSizeInterpretation.toLowerCase()} effect size).`;
      } else if ('sampleSize' in results) {
        config.title = "One-Sample T-Test Analysis";
        config.subtitle = "Single Group vs Population Comparison Sample Size Calculation";
        config.inputs = [
          { label: "Expected Sample Mean", value: formData.sampleMean },
          { label: "Population Mean (H₀)", value: formData.populationMean },
          { label: "Population Standard Deviation", value: formData.populationSD },
          { label: "Significance Level", value: Number(formData.significanceLevel ?? 5), unit: "%" },
          { label: "Statistical Power", value: Number(formData.power ?? 80), unit: "%" }
        ];
        config.results = [
          { label: "Required Sample Size", value: results.sampleSize, highlight: true, category: "primary", format: "integer" },
          { label: "Cohen's d (Effect Size)", value: results.cohensD, category: "statistical", format: "decimal", precision: 3 }
        ];
        config.interpretation.summary = `This one-sample t-test requires ${results.sampleSize} participants to detect a difference between the sample mean of ${formData.sampleMean} and population mean of ${formData.populationMean} with Cohen's d = ${results.cohensD.toFixed(3)} (${results.effectSizeInterpretation.toLowerCase()} effect size).`;
      }

      await generateModernPDF(config);
    } catch (err: any) {
      setError(`Failed to generate PDF: ${err.message}`);
    }
  };

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

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-semibold text-lg">Export Your Results</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Download comprehensive PDF report with calculations and interpretations
                </p>
              </div>
              <Button
                onClick={generatePdf}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg px-8 py-3 text-base font-semibold shrink-0"
              >
                <Download className="h-5 w-5 mr-3" />
                Download PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>
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
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <span>T-Test Sample Size Calculator</span>
            </CardTitle>
            <CardDescription className="text-lg">
              Calculate sample sizes for independent, paired, and one-sample t-tests with power analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            <TTestFormFormedible
              activeTab={activeTab}
              onActiveTabChange={(t) => setActiveTab(t)}
              onResults={(r, vals) => {
                setResults(r);
                setLastValues(vals);
              }}
              onError={(msg) => setError(msg || null)}
            />
          </CardContent>
        </Card>

        {results && renderResults()}
      </div>
    </ToolPageWrapper>
  );
}
