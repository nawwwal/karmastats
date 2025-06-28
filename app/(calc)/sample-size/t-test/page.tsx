'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  calculateIndependentSampleSize,
  calculatePairedSampleSize,
  calculateOneSampleSampleSize,
  IndependentSampleSizeSchema,
  PairedSampleSizeSchema,
  OneSampleSampleSizeSchema,
  IndependentSampleSizeOutput,
  PairedSampleSizeOutput,
  OneSampleSampleSizeOutput
} from '@/lib/math/sample-size/tTest';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calculator, BarChart3, TrendingUp, Users, Target, AlertCircle, CheckCircle
} from 'lucide-react';

type Results = IndependentSampleSizeOutput | PairedSampleSizeOutput | OneSampleSampleSizeOutput;

const FormSchema = z.intersection(
  IndependentSampleSizeSchema.partial(),
  PairedSampleSizeSchema.partial()
).and(OneSampleSampleSizeSchema.partial());

export default function TTestPage() {
  const [activeTab, setActiveTab] = useState<'independent' | 'paired' | 'one-sample'>('independent');
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      // Common
      significanceLevel: 5,
      power: 80,
      dropoutRate: 10,

      // Independent
      group1Mean: 10,
      group2Mean: 12,
      pooledSD: 3,
      allocationRatio: 1,

      // Paired
      meanDifference: 2,
      sdDifference: 3,
      correlation: 0.5,

      // One-sample
      sampleMean: 12,
      populationMean: 10,
      populationSD: 3,
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    try {
      setError(null);
      setResults(null);
      let result: Results;

      switch (activeTab) {
        case 'independent': {
          const validatedData = IndependentSampleSizeSchema.parse(data);
          result = calculateIndependentSampleSize(validatedData);
          break;
        }
        case 'paired': {
          const validatedData = PairedSampleSizeSchema.parse(data);
          result = calculatePairedSampleSize(validatedData);
          break;
        }
        case 'one-sample': {
          const validatedData = OneSampleSampleSizeSchema.parse(data);
          result = calculateOneSampleSampleSize(validatedData);
          break;
        }
        default:
          throw new Error("Invalid tab selection");
      }
      setResults(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError("Please fill in all required fields for the selected test type.");
      } else {
        setError(err.message);
      }
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    form.reset();
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
      </div>
    );
  };

  const renderInputForm = () => (
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <EnhancedTabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
              <EnhancedTabsList className="grid w-full grid-cols-3" variant="modern">
                <EnhancedTabsTrigger value="independent" variant="modern">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Independent</span>
                  </div>
                </EnhancedTabsTrigger>
                <EnhancedTabsTrigger value="paired" variant="modern">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Paired</span>
                  </div>
                </EnhancedTabsTrigger>
                <EnhancedTabsTrigger value="one-sample" variant="modern">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>One-Sample</span>
                  </div>
                </EnhancedTabsTrigger>
              </EnhancedTabsList>

              <EnhancedTabsContent value="independent">
                <Card className="border-primary/20 bg-primary/10 dark:bg-primary/20 dark:border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Independent Samples T-Test</CardTitle>
                    <CardDescription>Compare means of two independent groups</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField name="group1Mean" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group 1 Mean</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="group2Mean" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group 2 Mean</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="pooledSD" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pooled Standard Deviation</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="allocationRatio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allocation Ratio (Group 1:Group 2)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>
              </EnhancedTabsContent>

              <EnhancedTabsContent value="paired">
                <Card className="border-success/20 bg-success/10 dark:bg-success/20 dark:border-success/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Paired Samples T-Test</CardTitle>
                    <CardDescription>Compare paired observations (before/after, matched pairs)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField name="meanDifference" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Mean Difference</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="sdDifference" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Standard Deviation of Differences</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="correlation" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correlation between Pairs</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" max="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>
              </EnhancedTabsContent>

              <EnhancedTabsContent value="one-sample">
                <Card className="border-secondary/20 bg-secondary/10 dark:bg-secondary/20 dark:border-secondary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">One-Sample T-Test</CardTitle>
                    <CardDescription>Compare sample mean to a known population value</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField name="sampleMean" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Sample Mean</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="populationMean" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Population Mean (H₀)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name="populationSD" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Population Standard Deviation</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>
              </EnhancedTabsContent>

              {/* Common Parameters */}
              <Card className="border-muted bg-muted/50 dark:bg-muted/20 dark:border-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Statistical Parameters</CardTitle>
                  <CardDescription>Configure significance level, power, and other study parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField name="significanceLevel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Significance Level (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="power" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statistical Power (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Calculate Sample Size
                </Button>
              </div>
            </EnhancedTabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

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
        {/* Input Form */}
        {renderInputForm()}

        {/* Results */}
        {results && renderResults()}
      </div>
    </ToolPageWrapper>
  );
}
