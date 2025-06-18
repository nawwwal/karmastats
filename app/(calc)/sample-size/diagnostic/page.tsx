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
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { ResultsDisplay } from '@/components/ui/results-display';

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
            // Scroll to top to show results
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const formattedErrors = err.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ');
                setError(`Validation failed: ${formattedErrors}`);
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const { extractTextFromPDF, extractParameters } = await import('@/lib/pdf-utils');
                const textContent = await extractTextFromPDF(e.target?.result as ArrayBuffer);

                const basePatterns = {
                    expectedSensitivity: [/sensitivity of ([\d\.]+)/i],
                    expectedSpecificity: [/specificity of ([\d\.]+)/i],
                    diseasePrevalence: [/prevalence of ([\d\.]+)/i],
                    test1Performance: [/test 1 performance of ([\d\.]+)/i],
                    test2Performance: [/test 2 performance of ([\d\.]+)/i],
                    expectedAUC: [/auc of ([\d\.]+)/i]
                };

                const values = extractParameters(textContent, basePatterns);

                if (activeTab === 'single') {
                    if (values.expectedSensitivity) form.setValue('expectedSensitivity', values.expectedSensitivity);
                    if (values.expectedSpecificity) form.setValue('expectedSpecificity', values.expectedSpecificity);
                    if (values.diseasePrevalence) form.setValue('diseasePrevalence', values.diseasePrevalence);
                } else if (activeTab === 'comparative') {
                    if (values.test1Performance) form.setValue('test1Performance', values.test1Performance);
                    if (values.test2Performance) form.setValue('test2Performance', values.test2Performance);
                } else if (activeTab === 'roc') {
                    if (values.expectedAUC) form.setValue('expectedAUC', values.expectedAUC);
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

        let resultItems: any[] = [];
        let title = '';
        let interpretation: any = {};

        if ('nSensitivity' in results) {
            title = 'Single Test Evaluation Results';
            resultItems = [
                { label: 'Sample Size (Sensitivity)', value: results.nSensitivity, category: 'primary', highlight: true, format: 'integer' },
                { label: 'Sample Size (Specificity)', value: results.nSpecificity, category: 'primary', highlight: true, format: 'integer' },
                { label: 'Total Required Sample Size', value: results.totalSize, category: 'primary', highlight: true, format: 'integer' },
                { label: 'Disease Positive Cases', value: results.diseasePositive, category: 'secondary', format: 'integer' },
                { label: 'Disease Negative Cases', value: results.diseaseNegative, category: 'secondary', format: 'integer' },
            ];
        } else if ('sampleSize' in results) {
            title = 'Comparative Test Study Results';
            resultItems = [
                { label: 'Required Sample Size (per group if unpaired)', value: results.sampleSize, category: 'primary', highlight: true, format: 'integer' },
                { label: 'Total Subjects to Screen', value: results.totalSize, category: 'primary', highlight: true, format: 'integer' },
            ];
        } else if ('positiveSize' in results) {
            title = 'ROC Analysis Results';
            resultItems = [
                { label: 'Disease-Positive Cases', value: results.positiveSize, category: 'primary', highlight: true, format: 'integer' },
                { label: 'Disease-Negative Cases', value: results.negativeSize, category: 'primary', highlight: true, format: 'integer' },
                { label: 'Total Required Sample Size', value: results.totalSize, category: 'primary', highlight: true, format: 'integer' },
            ];
        }

        interpretation.recommendations = [
            'Ensure proper randomization and blinding in diagnostic test evaluation',
            'Consider spectrum bias when selecting patient populations',
            'Account for verification bias in test result interpretation',
            'Plan for adequate reference standard procedures'
        ];

        interpretation.assumptions = [
            'Reference standard has perfect sensitivity and specificity',
            'Test results are independent conditional on disease status',
            'Study population is representative of intended use population',
            'No spectrum or verification bias present'
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
                    <TabsTrigger value="single">Single Test</TabsTrigger>
                    <TabsTrigger value="comparative">Comparative</TabsTrigger>
                    <TabsTrigger value="roc">ROC Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="single">
                        <Card>
                            <CardHeader>
                                <CardTitle>Single Test Evaluation</CardTitle>
                                <CardDescription>Calculate sample size for evaluating sensitivity and specificity</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField name="expectedSensitivity" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected Sensitivity (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="expectedSpecificity" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected Specificity (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="diseasePrevalence" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Disease Prevalence (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="marginOfError" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Margin of Error (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div>
                                    <FormField name="confidenceLevel" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confidence Level (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comparative">
                        <Card>
                            <CardHeader>
                                <CardTitle>Comparative Test Study</CardTitle>
                                <CardDescription>Compare performance between two diagnostic tests</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField name="studyDesign" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Study Design</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="paired">Paired</SelectItem>
                                                    <SelectItem value="unpaired">Unpaired</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="comparisonMetric" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Comparison Metric</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="sensitivity">Sensitivity</SelectItem>
                                                    <SelectItem value="specificity">Specificity</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField name="test1Performance" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Test 1 Performance (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="test2Performance" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Test 2 Performance (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                {watchStudyDesign === 'paired' && (
                                    <FormField name="testCorrelation" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Test Correlation</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" min="0" max="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roc">
                        <Card>
                            <CardHeader>
                                <CardTitle>ROC Analysis</CardTitle>
                                <CardDescription>Sample size for ROC curve area comparison</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="expectedAUC" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected AUC</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" min="0" max="1" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="nullAUC" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Null AUC</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" min="0" max="1" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div>
                                    <FormField name="negativePositiveRatio" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Negative:Positive Ratio</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
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
                                        <Input type="number" step="0.1" {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="power" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Power (%)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="1" {...field} className="w-full" />
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
                                        <Input type="number" step="0.1" {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                {/* File Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Import from PDF</CardTitle>
                        <CardDescription>Upload a PDF file to auto-extract parameters</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="cursor-pointer"
                        />
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
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
            title="Diagnostic Test Sample Size"
            description="Calculate sample sizes for diagnostic test evaluation, comparison studies, and ROC analysis"
            category="Sample Size Calculator"
            onReset={handleReset}
            onExportPDF={generatePdf}
            showExportButton={!!results}
            resultsSection={renderResults()}
        >
            {renderInputForm()}
        </ToolPageWrapper>
    );
}
