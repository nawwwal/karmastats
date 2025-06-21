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
import { FieldPopover } from "@/components/ui/field-popover";
import { getFieldExplanation } from "@/lib/field-explanations";

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
            const { generateModernPDF } = await import('@/lib/pdf-utils');
            const formData = form.getValues();

            let config: any = {
                calculatorType: `Diagnostic Test ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
                inputs: [],
                results: [],
                interpretation: {
                    recommendations: [
                        'Ensure proper randomization and blinding in diagnostic test evaluation',
                        'Consider spectrum bias when selecting patient populations',
                        'Account for verification bias in test result interpretation',
                        'Plan for adequate reference standard procedures'
                    ],
                    assumptions: [
                        'Reference standard has perfect sensitivity and specificity',
                        'Test results are independent conditional on disease status',
                        'Study population is representative of intended use population',
                        'No spectrum or verification bias present'
                    ]
                }
            };

            if ('nSensitivity' in results) {
                config.title = "Single Diagnostic Test Evaluation";
                config.subtitle = "Sensitivity and Specificity Analysis";
                config.inputs = [
                    { label: "Expected Sensitivity", value: formData.expectedSensitivity, unit: "%" },
                    { label: "Expected Specificity", value: formData.expectedSpecificity, unit: "%" },
                    { label: "Disease Prevalence", value: formData.diseasePrevalence, unit: "%" },
                    { label: "Margin of Error", value: formData.marginOfError, unit: "%" },
                    { label: "Confidence Level", value: formData.confidenceLevel, unit: "%" }
                ];
                config.results = [
                    { label: "Total Required Sample Size", value: results.totalSize, highlight: true, category: "primary", format: "integer" },
                    { label: "Disease Positive Cases Needed", value: results.diseasePositive, highlight: true, category: "primary", format: "integer" },
                    { label: "Disease Negative Cases Needed", value: results.diseaseNegative, highlight: true, category: "primary", format: "integer" },
                    { label: "Sample Size for Sensitivity", value: results.nSensitivity, category: "secondary", format: "integer" },
                    { label: "Sample Size for Specificity", value: results.nSpecificity, category: "secondary", format: "integer" }
                ];
                config.interpretation.summary = `This single test evaluation requires ${results.totalSize} total participants to adequately assess both sensitivity and specificity. The study will need ${results.diseasePositive} disease-positive and ${results.diseaseNegative} disease-negative cases based on the expected ${formData.diseasePrevalence}% prevalence.`;
            } else if ('sampleSize' in results) {
                config.title = "Comparative Diagnostic Test Study";
                config.subtitle = "Two-Test Comparison Analysis";
                config.inputs = [
                    { label: "Study Design", value: formData.studyDesign },
                    { label: "Test 1 Sensitivity", value: formData.test1Sensitivity, unit: "%" },
                    { label: "Test 2 Sensitivity", value: formData.test2Sensitivity, unit: "%" },
                    { label: "Test 1 Specificity", value: formData.test1Specificity, unit: "%" },
                    { label: "Test 2 Specificity", value: formData.test2Specificity, unit: "%" },
                    { label: "Significance Level", value: formData.alpha * 100, unit: "%" },
                    { label: "Statistical Power", value: formData.power * 100, unit: "%" }
                ];
                config.results = [
                    { label: "Required Sample Size per Group", value: results.sampleSize, highlight: true, category: "primary", format: "integer" },
                    { label: "Total Subjects to Screen", value: results.totalSize, highlight: true, category: "primary", format: "integer" }
                ];
                config.interpretation.summary = `This comparative study requires ${results.sampleSize} participants per group (if unpaired design) to detect differences between the two diagnostic tests. A total of ${results.totalSize} subjects need to be screened.`;
            } else if ('positiveSize' in results) {
                config.title = "ROC Curve Analysis Study";
                config.subtitle = "Area Under Curve Evaluation";
                config.inputs = [
                    { label: "Expected AUC", value: formData.expectedAUC },
                    { label: "Null Hypothesis AUC", value: formData.nullAUC },
                    { label: "Disease Prevalence", value: formData.diseasePrevalence, unit: "%" },
                    { label: "Significance Level", value: formData.alpha * 100, unit: "%" },
                    { label: "Statistical Power", value: formData.power * 100, unit: "%" }
                ];
                config.results = [
                    { label: "Total Required Sample Size", value: results.totalSize, highlight: true, category: "primary", format: "integer" },
                    { label: "Disease-Positive Cases", value: results.positiveSize, highlight: true, category: "primary", format: "integer" },
                    { label: "Disease-Negative Cases", value: results.negativeSize, highlight: true, category: "primary", format: "integer" }
                ];
                config.interpretation.summary = `This ROC analysis requires ${results.totalSize} total participants to detect an AUC of ${formData.expectedAUC} versus the null hypothesis of ${formData.nullAUC}. The study needs ${results.positiveSize} disease-positive and ${results.negativeSize} disease-negative cases.`;
            }

            await generateModernPDF(config);
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
                {/* PDF Upload - Move to top with proper drop zone */}
                <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>📄</span> Import from PDF (Optional)
                        </CardTitle>
                        <CardDescription>Upload a research paper to auto-extract diagnostic test parameters</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('pdf-upload-diagnostic')?.click()}
                        >
                            <div className="space-y-2">
                                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-2xl">📁</span>
                                </div>
                                <div>
                                    <p className="font-medium">Click to upload or drag and drop</p>
                                    <p className="text-sm text-muted-foreground">PDF files only, max 10MB</p>
                                </div>
                            </div>
                            <Input
                                id="pdf-upload-diagnostic"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </CardContent>
                </Card>

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
                                            <FieldPopover
                                                {...getFieldExplanation('diagnostic', 'diseasePrevalence')}
                                                side="top"
                                            >
                                                <FormLabel>Disease Prevalence (%)</FormLabel>
                                            </FieldPopover>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="marginOfError" render={({ field }) => (
                                        <FormItem>
                                            <FieldPopover
                                                {...getFieldExplanation('sampleSize', 'marginOfError')}
                                                side="top"
                                            >
                                                <FormLabel>Margin of Error (%)</FormLabel>
                                            </FieldPopover>
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
