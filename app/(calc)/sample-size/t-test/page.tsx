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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { ResultsDisplay } from '@/components/ui/results-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      // Scroll to top to show results
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    let resultItems: any[] = [];
    let title = '';
    let interpretation: any = {};

    if ('totalSize' in results) {
      title = 'Independent Samples t-Test Results';
      resultItems = [
        { label: 'Required Sample Size (Group 1)', value: results.group1Size, category: 'primary', highlight: true, format: 'integer' },
        { label: 'Required Sample Size (Group 2)', value: results.group2Size, category: 'primary', highlight: true, format: 'integer' },
        { label: 'Total Required Sample Size', value: results.totalSize, category: 'primary', highlight: true, format: 'integer' },
        { label: "Cohen's d (Effect Size)", value: results.cohensD, category: 'statistical', format: 'decimal' },
      ];
      interpretation.effectSize = results.effectSizeInterpretation;
    } else if ('pairsSize' in results) {
      title = 'Paired Samples t-Test Results';
      resultItems = [
        { label: 'Required Number of Pairs', value: results.pairsSize, category: 'primary', highlight: true, format: 'integer' },
        { label: 'Total Observations', value: results.totalObservations, category: 'secondary', format: 'integer' },
        { label: "Cohen's d (Effect Size)", value: results.cohensD, category: 'statistical', format: 'decimal' },
      ];
      interpretation.effectSize = results.effectSizeInterpretation;
    } else if ('sampleSize' in results) {
      title = 'One-Sample t-Test Results';
      resultItems = [
        { label: 'Required Sample Size', value: results.sampleSize, category: 'primary', highlight: true, format: 'integer' },
        { label: "Cohen's d (Effect Size)", value: results.cohensD, category: 'statistical', format: 'decimal' },
      ];
      interpretation.effectSize = results.effectSizeInterpretation;
    }

    interpretation.recommendations = [
      'Ensure data meets normality assumptions or consider non-parametric alternatives (e.g., Wilcoxon test).',
      'For independent tests, verify homogeneity of variances (Levene\'s test).',
      'Report the effect size (Cohen\'s d) and its confidence interval alongside p-values.',
      'Consider increasing sample size by 10-20% to account for potential data quality issues.'
    ];

    interpretation.assumptions = [
      'Data follows a normal distribution',
      'Independent observations',
      'Equal variances between groups (for independent t-test)',
      'Continuous outcome variable'
    ];

    return (
      <ResultsDisplay
        title={title}
        results={resultItems}
        interpretation={interpretation}
        showInterpretation={true}
      />
    );
  };

  const renderInputForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="independent">Independent</TabsTrigger>
            <TabsTrigger value="paired">Paired</TabsTrigger>
            <TabsTrigger value="one-sample">One-Sample</TabsTrigger>
          </TabsList>

          <TabsContent value="independent">
            <Card>
              <CardHeader>
                <CardTitle>Independent Samples T-Test</CardTitle>
                <CardDescription>Compare means of two independent groups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                      <FormLabel>Allocation Ratio (n2/n1)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paired">
            <Card>
              <CardHeader>
                <CardTitle>Paired Samples T-Test</CardTitle>
                <CardDescription>Compare paired observations (before/after)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField name="meanDifference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Mean Difference</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
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
                      <FormLabel>Correlation Coefficient</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" max="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="one-sample">
            <Card>
              <CardHeader>
                <CardTitle>One-Sample T-Test</CardTitle>
                <CardDescription>Compare sample mean to population mean</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      <FormLabel>Population Mean</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField name="populationSD" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Population Standard Deviation</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Common Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Study Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormLabel>Power (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div>
              <FormField name="dropoutRate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dropout Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" size="lg">
          Calculate Sample Size
        </Button>
      </form>
    </Form>
  );

  return (
    <ToolPageWrapper
      title="T-Test Sample Size Calculator"
      description="Calculate sample size for Independent, Paired, and One-Sample T-Tests"
      category="Sample Size Calculator"
      onReset={handleReset}
      resultsSection={renderResults()}
    >
      {renderInputForm()}
    </ToolPageWrapper>
  );
}
