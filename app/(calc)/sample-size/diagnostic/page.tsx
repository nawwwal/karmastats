'use client';

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// jsPDF will be dynamically imported to prevent SSR issues
// pdfjs will be dynamically imported to prevent SSR issues

import {
    SingleTestSchema, calculateSingleTestSampleSize, SingleTestOutput,
    ComparativeTestSchema, calculateComparativeTestSampleSize, ComparativeTestOutput,
    ROCAnalysisSchema, calculateROCAnalysisSampleSize, ROCAnalysisOutput
} from '@/lib/diagnosticTest';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type Results = SingleTestOutput | ComparativeTestOutput | ROCAnalysisOutput;

// Create a simplified combined schema for the form
const FormSchema = z.object({
    // Single Test
    expectedSensitivity: z.number().optional(),
    expectedSpecificity: z.number().optional(),
    diseasePrevalence: z.number().optional(),
    marginOfError: z.number().optional(),
    confidenceLevel: z.number().optional(),
    dropoutRate: z.number().optional(),
    // Comparative
    studyDesign: z.enum(['paired', 'unpaired']).optional(),
    comparisonMetric: z.enum(['sensitivity', 'specificity']).optional(),
    test1Performance: z.number().optional(),
    test2Performance: z.number().optional(),
    testCorrelation: z.number().optional(),
    significanceLevel: z.number().optional(),
    power: z.number().optional(),
    // ROC
    expectedAUC: z.number().optional(),
    nullAUC: z.number().optional(),
    negativePositiveRatio: z.number().optional(),
});

export default function DiagnosticTestPage() {
    const [activeTab, setActiveTab] = useState<'single' | 'comparative' | 'roc'>('single');
    const [results, setResults] = useState<Results | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            // Single Test
            expectedSensitivity: 85,
            expectedSpecificity: 90,
            diseasePrevalence: 15,
            marginOfError: 5,
            confidenceLevel: 95,
            dropoutRate: 10,
            // Comparative
            studyDesign: 'paired',
            comparisonMetric: 'sensitivity',
            test1Performance: 85,
            test2Performance: 90,
            testCorrelation: 0.5,
            significanceLevel: 5,
            power: 80,
            // ROC
            expectedAUC: 0.85,
            nullAUC: 0.5,
            negativePositiveRatio: 1,
        },
    });

    const watchStudyDesign = form.watch('studyDesign');

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        try {
            setError(null);
            setResults(null);
            let result: Results;

            switch (activeTab) {
                case 'single':
                    result = calculateSingleTestSampleSize(SingleTestSchema.parse(data));
                    break;
                case 'comparative':
                    result = calculateComparativeTestSampleSize(ComparativeTestSchema.parse(data));
                    break;
                case 'roc':
                    result = calculateROCAnalysisSampleSize(ROCAnalysisSchema.parse(data));
                    break;
            }
            setResults(result);
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const formattedErrors = err.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ');
                setError(`Validation failed: ${formattedErrors}`);
            } else {
                setError(err.message);
            }
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Dynamic import to prevent SSR issues
                const { extractTextFromPDF } = await import('@/lib/pdf-utils');
                const textContent = await extractTextFromPDF(e.target?.result as ArrayBuffer);

                // Simplified regex - a robust solution is complex
                const extractValue = (regex: RegExp) => {
                    const match = textContent.match(regex);
                    return match ? parseFloat(match[1]) : undefined;
                };

                if (activeTab === 'single') {
                    form.setValue('expectedSensitivity', extractValue(/sensitivity of ([\d\.]+)/i));
                    form.setValue('expectedSpecificity', extractValue(/specificity of ([\d\.]+)/i));
                    form.setValue('diseasePrevalence', extractValue(/prevalence of ([\d\.]+)/i));
                } else if (activeTab === 'comparative') {
                    form.setValue('test1Performance', extractValue(/test 1 performance of ([\d\.]+)/i));
                    form.setValue('test2Performance', extractValue(/test 2 performance of ([\d\.]+)/i));
                } else if (activeTab === 'roc') {
                    form.setValue('expectedAUC', extractValue(/auc of ([\d\.]+)/i));
                }

            } catch (err: any) {
                setError(`Failed to process PDF: ${err.message}`);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const generatePdf = async () => {
        if (!results) return;

        try {
            // Dynamic import to prevent SSR issues
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(`Karmastat Diagnostic Test Report`, 105, 20, { align: 'center' });
            doc.setFontSize(12);

        let y = 40;

        if ('nSensitivity' in results) {
            doc.text('Single Test Evaluation Results', 20, y);
            y += 10;
            doc.text(`Sample Size (Sensitivity): ${results.nSensitivity}`, 25, y);
            y += 7;
            doc.text(`Sample Size (Specificity): ${results.nSpecificity}`, 25, y);
            y += 7;
            doc.text(`Required Total Sample Size: ${results.totalSize}`, 25, y);
            y += 7;
            doc.text(`Number of Disease Positive: ${results.diseasePositive}`, 25, y);
            y += 7;
            doc.text(`Number of Disease Negative: ${results.diseaseNegative}`, 25, y);
        } else if ('sampleSize' in results) {
            doc.text('Comparative Test Study Results', 20, y);
            y += 10;
            doc.text(`Required Sample Size (per group if unpaired): ${results.sampleSize}`, 25, y);
            y += 7;
            doc.text(`Total Subjects to Screen: ${results.totalSize}`, 25, y);
        } else if ('positiveSize' in results) {
            doc.text('ROC Analysis Results', 20, y);
            y += 10;
            doc.text(`Required Disease-Positive Cases: ${results.positiveSize}`, 25, y);
            y += 7;
            doc.text(`Required Disease-Negative Cases: ${results.negativeSize}`, 25, y);
            y += 7;
            doc.text(`Total Required Sample Size: ${results.totalSize}`, 25, y);
        }

            doc.save(`karmastat-diagnostic-report-${activeTab}.pdf`);
        } catch (err: any) {
            setError(`Failed to generate PDF: ${err.message}`);
        }
    }

    const renderResults = () => {
        if (!results) return null;

        let resultData: { label: string, value: any }[] = [];
        let title = '';

        if ('nSensitivity' in results) {
            title = 'Single Test Evaluation Results';
            resultData = [
                { label: 'Sample Size (Sensitivity)', value: results.nSensitivity },
                { label: 'Sample Size (Specificity)', value: results.nSpecificity },
                { label: 'Required Total Sample Size', value: results.totalSize },
                { label: 'Number of Disease Positive', value: results.diseasePositive },
                { label: 'Number of Disease Negative', value: results.diseaseNegative },
            ];
        } else if ('sampleSize' in results) {
            title = 'Comparative Test Study Results';
            resultData = [
                { label: 'Required Sample Size (per group if unpaired)', value: results.sampleSize },
                { label: 'Total Subjects to Screen', value: results.totalSize },
            ];
        } else if ('positiveSize' in results) {
            title = 'ROC Analysis Results';
            resultData = [
                { label: 'Required Disease-Positive Cases', value: results.positiveSize },
                { label: 'Required Disease-Negative Cases', value: results.negativeSize },
                { label: 'Total Required Sample Size', value: results.totalSize },
            ];
        }

        return (
            <Card>
                <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Metric</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {resultData.map(row => (
                                <TableRow key={row.label}>
                                    <TableCell className="font-medium">{row.label}</TableCell>
                                    <TableCell className="text-right">{row.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Diagnostic Test Accuracy Calculator</h1>
                <p className="text-muted-foreground mt-2">Calculate sample size for diagnostic test studies.</p>
            </div>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="single">Single Test</TabsTrigger>
                    <TabsTrigger value="comparative">Comparative</TabsTrigger>
                    <TabsTrigger value="roc">ROC Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="single">
                    <Card><CardHeader><CardTitle>Single Test Evaluation</CardTitle><CardDescription>Calculate sample size based on desired precision for sensitivity and specificity.</CardDescription></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <FormField name="expectedSensitivity" render={({ field }) => (<FormItem><FormLabel>Expected Sensitivity (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                            <FormField name="expectedSpecificity" render={({ field }) => (<FormItem><FormLabel>Expected Specificity (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                            <FormField name="diseasePrevalence" render={({ field }) => (<FormItem><FormLabel>Disease Prevalence (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                            <FormField name="marginOfError" render={({ field }) => (<FormItem><FormLabel>Margin of Error (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                            <FormField name="confidenceLevel" render={({ field }) => (<FormItem><FormLabel>Confidence Level</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="80">80%</SelectItem><SelectItem value="90">90%</SelectItem><SelectItem value="95">95%</SelectItem><SelectItem value="99">99%</SelectItem></SelectContent></Select></FormItem>)} />
                            <FormField name="dropoutRate" render={({ field }) => (<FormItem><FormLabel>Dropout Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comparative">
                    <Card><CardHeader><CardTitle>Comparative Test Study</CardTitle><CardDescription>Calculate sample size for comparing the performance of two diagnostic tests.</CardDescription></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <FormField name="studyDesign" render={({ field }) => (<FormItem><FormLabel>Study Design</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="paired">Paired</SelectItem><SelectItem value="unpaired">Unpaired</SelectItem></SelectContent></Select></FormItem>)} />
                            <FormField name="comparisonMetric" render={({ field }) => (<FormItem><FormLabel>Metric to Compare</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="sensitivity">Sensitivity</SelectItem><SelectItem value="specificity">Specificity</SelectItem></SelectContent></Select></FormItem>)} />
                            <FormField name="test1Performance" render={({ field }) => (<FormItem><FormLabel>Test 1 Performance (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                            <FormField name="test2Performance" render={({ field }) => (<FormItem><FormLabel>Test 2 Performance (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                            <FormField name="diseasePrevalence" render={({ field }) => (<FormItem><FormLabel>Disease Prevalence (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                            <FormField name="testCorrelation" render={({ field }) => (<FormItem><FormLabel>Test Correlation (ρ)</FormLabel><FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} disabled={watchStudyDesign !== 'paired'} /></FormControl></FormItem>)} />
                            <FormField name="significanceLevel" render={({ field }) => (<FormItem><FormLabel>Significance Level (α)</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">1%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="10">10%</SelectItem></SelectContent></Select></FormItem>)} />
                            <FormField name="power" render={({ field }) => (<FormItem><FormLabel>Statistical Power (%)</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="80">80%</SelectItem><SelectItem value="85">85%</SelectItem><SelectItem value="90">90%</SelectItem><SelectItem value="95">95%</SelectItem></SelectContent></Select></FormItem>)} />
                            <FormField name="dropoutRate" render={({ field }) => (<FormItem><FormLabel>Dropout Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roc">
                    <Card><CardHeader><CardTitle>ROC Curve Analysis</CardTitle><CardDescription>Calculate sample size for determining if a test is better than chance.</CardDescription></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <FormField name="expectedAUC" render={({ field }) => (<FormItem><FormLabel>Expected AUC</FormLabel><FormControl><Input type="number" step="0.05" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                            <FormField name="nullAUC" render={({ field }) => (<FormItem><FormLabel>Null Hypothesis AUC</FormLabel><FormControl><Input type="number" step="0.05" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                            <FormField name="negativePositiveRatio" render={({ field }) => (<FormItem><FormLabel>Negative to Positive Ratio</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                            <FormField name="significanceLevel" render={({ field }) => (<FormItem><FormLabel>Significance Level (α)</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">1%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="10">10%</SelectItem></SelectContent></Select></FormItem>)} />
                            <FormField name="power" render={({ field }) => (<FormItem><FormLabel>Statistical Power (%)</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="80">80%</SelectItem><SelectItem value="85">85%</SelectItem><SelectItem value="90">90%</SelectItem><SelectItem value="95">95%</SelectItem></SelectContent></Select></FormItem>)} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-center items-center gap-4">
                <Button type="submit" className="w-48">Calculate</Button>
                <div className="flex-col">
                    <Input type="file" accept=".pdf" onChange={handleFileUpload} className="w-48 mb-2" />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild><Button type="button" variant="outline" className="w-48" onClick={() => document.getElementById('pdf-upload')?.click()} >Extract from PDF</Button></TooltipTrigger>
                            <TooltipContent><p>Automatically extract parameters from a research paper.</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><Button type="button" variant="outline" className="w-48" onClick={generatePdf} disabled={!results}>Export to PDF</Button></TooltipTrigger>
                        <TooltipContent><p>Export results as a PDF report.</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {results && <div className="mt-8">{renderResults()}</div>}
        </form>
        </Form>
    );
}
