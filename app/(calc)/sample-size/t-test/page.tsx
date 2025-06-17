'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


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

  const renderResults = () => {
    if(!results) return null;

    let resultData: {label: string, value: string | number | undefined}[] = [];
    let title = '';

    if ('totalSize' in results) {
        title = 'Independent Samples t-Test Results';
        resultData = [
            { label: 'Required Sample Size (Group 1)', value: results.group1Size },
            { label: 'Required Sample Size (Group 2)', value: results.group2Size },
            { label: 'Total Required Sample Size', value: results.totalSize },
            { label: "Cohen's d (Effect Size)", value: results.cohensD.toFixed(4) },
            { label: 'Effect Size Interpretation', value: results.effectSizeInterpretation },
        ];
    } else if ('pairsSize' in results) {
        title = 'Paired Samples t-Test Results';
        resultData = [
            { label: 'Required Number of Pairs', value: results.pairsSize },
            { label: 'Total Observations', value: results.totalObservations },
            { label: "Cohen's d (Effect Size)", value: results.cohensD.toFixed(4) },
            { label: 'Effect Size Interpretation', value: results.effectSizeInterpretation },
        ];
    } else if ('sampleSize' in results) {
        title = 'One-Sample t-Test Results';
        resultData = [
            { label: 'Required Sample Size', value: results.sampleSize },
            { label: "Cohen's d (Effect Size)", value: results.cohensD.toFixed(4) },
            { label: 'Effect Size Interpretation', value: results.effectSizeInterpretation },
        ];
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Metric</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resultData.map(row => (
                            <TableRow key={row.label}>
                                <TableCell className="font-medium">{row.label}</TableCell>
                                <TableCell className="text-right">{row.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <div className="mt-6 text-sm text-muted-foreground">
                    <p><strong>Methodological Recommendations:</strong></p>
                    <ul className="list-disc pl-5 mt-2">
                        <li>Ensure data meets normality assumptions or consider non-parametric alternatives (e.g., Wilcoxon test).</li>
                        <li>For independent tests, verify homogeneity of variances (Levene's test).</li>
                        <li>Report the effect size (Cohen's d) and its confidence interval alongside p-values.</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Form {...form}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">T-Test Sample Size Calculator</h1>
        <p className="text-muted-foreground mb-8">Calculate sample size for Independent, Paired, and One-Sample T-Tests.</p>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="independent">Independent Samples</TabsTrigger>
            <TabsTrigger value="paired">Paired Samples</TabsTrigger>
            <TabsTrigger value="one-sample">One-Sample</TabsTrigger>
          </TabsList>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <TabsContent value="independent">
              <Card>
                <CardHeader>
                  <CardTitle>Independent Samples T-Test</CardTitle>
                  <CardDescription>Inputs for comparing the means of two independent groups.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="group1Mean" render={({ field }) => (<FormItem><FormLabel>Group 1 Mean</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="group2Mean" render={({ field }) => (<FormItem><FormLabel>Group 2 Mean</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="pooledSD" render={({ field }) => (<FormItem><FormLabel>Pooled Standard Deviation</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="allocationRatio" render={({ field }) => (<FormItem><FormLabel>Allocation Ratio (n2/n1)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paired">
              <Card>
                 <CardHeader>
                  <CardTitle>Paired Samples T-Test</CardTitle>
                  <CardDescription>Inputs for comparing means from the same group at different times.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="meanDifference" render={({ field }) => (<FormItem><FormLabel>Mean Difference</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="sdDifference" render={({ field }) => (<FormItem><FormLabel>Standard Deviation of Differences</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="correlation" render={({ field }) => (<FormItem><FormLabel>Correlation Coefficient</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="one-sample">
              <Card>
                 <CardHeader>
                  <CardTitle>One-Sample T-Test</CardTitle>
                  <CardDescription>Inputs for comparing the mean of a single group to a known mean.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="sampleMean" render={({ field }) => (<FormItem><FormLabel>Sample Mean</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="populationMean" render={({ field }) => (<FormItem><FormLabel>Population Mean</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="populationSD" render={({ field }) => (<FormItem><FormLabel>Population Standard Deviation</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </TabsContent>

            <Card>
              <CardHeader>
                <CardTitle>Common Parameters</CardTitle>
                 <CardDescription>Significance, power, and dropout rate for the test.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField name="significanceLevel" render={({ field }) => (<FormItem><FormLabel>Significance Level (α) (%)</FormLabel><FormControl><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="10">10%</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                <FormField name="power" render={({ field }) => (<FormItem><FormLabel>Statistical Power (1-β) (%)</FormLabel><FormControl><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="80">80%</SelectItem><SelectItem value="85">85%</SelectItem><SelectItem value="90">90%</SelectItem><SelectItem value="95">95%</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                <FormField name="dropoutRate" render={({ field }) => (<FormItem><FormLabel>Dropout Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>

             <div className="flex justify-center">
                <Button type="submit">Calculate Sample Size</Button>
             </div>
          </form>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && renderResults()}
      </div>
    </Form>
  );
}
