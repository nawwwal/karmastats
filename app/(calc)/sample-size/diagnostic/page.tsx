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
import { EnhancedTabs, EnhancedTabsContent, EnhancedTabsList, EnhancedTabsTrigger } from '@/components/ui/enhanced-tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { FieldPopover } from '@/components/ui/field-popover';
import { getFieldExplanation } from '@/lib/field-explanations';
import {
  PowerField,
  AlphaField,
  PercentageField,
  StatisticalFormField
} from '@/components/ui/enhanced-form-field';
import { Target, Calculator, AlertCircle, FileUp, Download, Activity } from "lucide-react";

type Results = SingleTestOutput | ComparativeTestOutput | ROCAnalysisOutput;

// Create a simplified combined schema for the form
const FormSchema = z.object({
    // Single Test
    expectedSensitivity: z.number().min(1, "Sensitivity must be at least 1%").max(100, "Sensitivity cannot exceed 100%").optional(),
    expectedSpecificity: z.number().min(1, "Specificity must be at least 1%").max(100, "Specificity cannot exceed 100%").optional(),
    diseasePrevalence: z.number().min(0.1, "Prevalence must be at least 0.1%").max(99.9, "Prevalence cannot exceed 99.9%").optional(),
    marginOfError: z.number().min(0.1, "Margin of error must be at least 0.1%").max(50, "Margin of error cannot exceed 50%").optional(),
    alpha: z.string().min(1, "Alpha level is required").optional(),
    dropoutRate: z.number().min(0, "Dropout rate cannot be negative").max(50, "Dropout rate cannot exceed 50%").optional(),
    // Comparative
    studyDesign: z.enum(['paired', 'unpaired']).optional(),
    comparisonMetric: z.enum(['sensitivity', 'specificity']).optional(),
    test1Performance: z.number().min(1, "Test 1 performance must be at least 1%").max(100, "Test 1 performance cannot exceed 100%").optional(),
    test2Performance: z.number().min(1, "Test 2 performance must be at least 1%").max(100, "Test 2 performance cannot exceed 100%").optional(),
    testCorrelation: z.number().min(0, "Correlation cannot be negative").max(1, "Correlation cannot exceed 1").optional(),
    power: z.string().min(1, "Power is required").optional(),
    // ROC
    expectedAUC: z.number().min(0.5, "AUC must be at least 0.5").max(1, "AUC cannot exceed 1").optional(),
    nullAUC: z.number().min(0.5, "Null AUC must be at least 0.5").max(1, "Null AUC cannot exceed 1").optional(),
    negativePositiveRatio: z.number().min(0.1, "Ratio must be at least 0.1").max(10, "Ratio cannot exceed 10").optional(),
});

export default function DiagnosticTestPage() {
    const [activeTab, setActiveTab] = useState<'single' | 'comparative' | 'roc'>('single');
    const [results, setResults] = useState<Results | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            // Single Test
            expectedSensitivity: 85, // 85% sensitivity (realistic for diagnostic tests)
            expectedSpecificity: 90, // 90% specificity (good specificity)
            diseasePrevalence: 20, // 20% prevalence (moderate prevalence)
            marginOfError: 5, // 5% margin of error (typical precision)
            alpha: '5', // 5% alpha level
            dropoutRate: 10, // 10% dropout rate
            // Comparative
            studyDesign: 'paired',
            comparisonMetric: 'sensitivity',
            test1Performance: 80, // 80% performance for test 1
            test2Performance: 90, // 90% performance for test 2 (detectable difference)
            testCorrelation: 0.5, // Moderate correlation
            power: '80', // 80% power
            // ROC
            expectedAUC: 0.80, // 80% AUC (good discriminative ability)
            nullAUC: 0.5, // 50% null hypothesis
            negativePositiveRatio: 1, // 1:1 ratio
        },
    });

    // Auto-calculate with default values on mount
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const defaultData = form.getValues();
            onSubmit(defaultData);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const watchStudyDesign = form.watch('studyDesign');

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        try {
            setError(null);
            setResults(null);
            let result: Results;

            // Convert string fields to numbers where needed
            const processedData = {
                ...data,
                alpha: data.alpha ? parseFloat(data.alpha) / 100 : undefined,
                power: data.power ? parseFloat(data.power) / 100 : undefined,
            };

            switch (activeTab) {
                case 'single':
                    const singleData = {
                        expectedSensitivity: processedData.expectedSensitivity,
                        expectedSpecificity: processedData.expectedSpecificity,
                        diseasePrevalence: processedData.diseasePrevalence,
                        marginOfError: processedData.marginOfError,
                        confidenceLevel: processedData.alpha ? (1 - processedData.alpha) * 100 : 95,
                        dropoutRate: processedData.dropoutRate,
                    };
                    result = calculateSingleTestSampleSize(SingleTestSchema.parse(singleData));
                    break;
                case 'comparative':
                    const comparativeData = {
                        studyDesign: processedData.studyDesign,
                        comparisonMetric: processedData.comparisonMetric,
                        test1Performance: processedData.test1Performance,
                        test2Performance: processedData.test2Performance,
                        testCorrelation: processedData.testCorrelation,
                        significanceLevel: processedData.alpha ? processedData.alpha * 100 : 5,
                        power: processedData.power || 0.8,
                    };
                    result = calculateComparativeTestSampleSize(ComparativeTestSchema.parse(comparativeData));
                    break;
                case 'roc':
                    const rocData = {
                        expectedAUC: processedData.expectedAUC,
                        nullAUC: processedData.nullAUC,
                        diseasePrevalence: processedData.diseasePrevalence,
                        negativePositiveRatio: processedData.negativePositiveRatio,
                        significanceLevel: processedData.alpha ? processedData.alpha * 100 : 5,
                        power: processedData.power || 0.8,
                    };
                    result = calculateROCAnalysisSampleSize(ROCAnalysisSchema.parse(rocData));
                    break;
            }
            setResults(result);
            form.clearErrors();

        } catch (err: any) {
            if (err instanceof z.ZodError) {
                err.errors.forEach((error) => {
                    if (error.path.length > 0) {
                        form.setError(error.path[0] as any, {
                            type: 'validation',
                            message: error.message,
                        });
                    }
                });
                setError(`Please check the highlighted fields: ${err.errors.map(e => e.message).join(', ')}`);
            } else {
                setError(err.message);
            }
        }
    };

    const handleReset = () => {
        setResults(null);
        setError(null);
        form.clearErrors();
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
                    { label: "Test 1 Performance", value: formData.test1Performance, unit: "%" },
                    { label: "Test 2 Performance", value: formData.test2Performance, unit: "%" },
                    { label: "Test Correlation", value: formData.testCorrelation },
                    { label: "Significance Level", value: formData.significanceLevel, unit: "%" },
                    { label: "Statistical Power", value: (formData.power ?? 0) * 100, unit: "%" }
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
                    { label: "Significance Level", value: formData.significanceLevel, unit: "%" },
                    { label: "Statistical Power", value: (formData.power ?? 0) * 100, unit: "%" }
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
                    interpretation: 'Total participants needed for adequate sensitivity and specificity evaluation'
                },
                {
                    label: 'Disease Positive Cases',
                    value: results.diseasePositive,
                    format: 'integer' as const,
                    category: 'secondary' as const,
                    interpretation: 'Number of participants with the disease'
                },
                {
                    label: 'Disease Negative Cases',
                    value: results.diseaseNegative,
                    format: 'integer' as const,
                    category: 'secondary' as const,
                    interpretation: 'Number of participants without the disease'
                },
                {
                    label: 'Sample Size for Sensitivity',
                    value: results.nSensitivity,
                    format: 'integer' as const,
                    category: 'statistical' as const,
                    interpretation: 'Required sample size to estimate sensitivity'
                },
                {
                    label: 'Sample Size for Specificity',
                    value: results.nSpecificity,
                    format: 'integer' as const,
                    category: 'statistical' as const,
                    interpretation: 'Required sample size to estimate specificity'
                }
            ];

            visualizationData = [
                { label: 'Disease Positive', value: results.diseasePositive, color: 'hsl(var(--destructive))' },
                { label: 'Disease Negative', value: results.diseaseNegative, color: 'hsl(var(--success))' }
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
                    interpretation: 'Participants needed per group (if unpaired design)'
                },
                {
                    label: 'Total Subjects to Screen',
                    value: results.totalSize,
                    format: 'integer' as const,
                    category: 'secondary' as const,
                    interpretation: 'Total participants needed for the study'
                }
            ];

            visualizationData = [
                { label: 'Per Group Sample', value: results.sampleSize, color: 'hsl(var(--primary))' },
                { label: 'Total Sample', value: results.totalSize, color: 'hsl(var(--secondary))' }
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
                    interpretation: 'Total participants needed for ROC curve analysis'
                },
                {
                    label: 'Disease-Positive Cases',
                    value: results.positiveSize,
                    format: 'integer' as const,
                    category: 'secondary' as const,
                    interpretation: 'Number of participants with the disease'
                },
                {
                    label: 'Disease-Negative Cases',
                    value: results.negativeSize,
                    format: 'integer' as const,
                    category: 'secondary' as const,
                    interpretation: 'Number of participants without the disease'
                }
            ];

            visualizationData = [
                { label: 'Disease Positive', value: results.positiveSize, color: 'hsl(var(--destructive))' },
                { label: 'Disease Negative', value: results.negativeSize, color: 'hsl(var(--success))' }
            ];
        }

        const interpretationData = {
            effectSize: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} test evaluation design`,
            statisticalSignificance: 'Adequate sample size for diagnostic test validation',
            clinicalSignificance: 'Sample size provides reliable estimates of test performance',
            recommendations: [
            'Ensure proper randomization and blinding in diagnostic test evaluation',
            'Consider spectrum bias when selecting patient populations',
            'Account for verification bias in test result interpretation',
                'Plan for adequate reference standard procedures',
                'Validate test performance in relevant clinical populations'
            ],
            assumptions: [
            'Reference standard has perfect sensitivity and specificity',
            'Test results are independent conditional on disease status',
            'Study population is representative of intended use population',
                'No spectrum or verification bias present',
                'Disease prevalence assumptions are accurate'
            ]
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
                                        key: "Total sample",
                                        value: ('totalSize' in results ? results.totalSize : results.sampleSize).toString(),
                                        significance: "high"
                                    },
                                    {
                                        key: "Test type",
                                        value: activeTab.replace('-', ' '),
                                        significance: "medium"
                                    }
                                ]}
                            />

                            <AdvancedVisualization
                                title="Test Performance Metrics"
                                type="comparison"
                                data={[
                                    { label: "Expected Sensitivity", value: form.getValues('expectedSensitivity') || 0 },
                                    { label: "Expected Specificity", value: form.getValues('expectedSpecificity') || 0 },
                                    { label: "Disease Prevalence", value: form.getValues('diseasePrevalence') || 0 }
                                ].filter(item => item.value > 0)}
                            />
                        </div>
                    }
                />

                {/* PDF Export Card */}
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <CardContent className="py-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-2 text-center sm:text-left">
                                <h3 className="font-semibold text-lg">Export Your Results</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Download comprehensive PDF report with diagnostic test calculations
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

                <EnhancedTabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
                <EnhancedTabsList className="grid w-full grid-cols-3" variant="modern">
                    <EnhancedTabsTrigger value="single" variant="modern">Single Test</EnhancedTabsTrigger>
                    <EnhancedTabsTrigger value="comparative" variant="modern">Comparative</EnhancedTabsTrigger>
                    <EnhancedTabsTrigger value="roc" variant="modern">ROC Analysis</EnhancedTabsTrigger>
                </EnhancedTabsList>

                <EnhancedTabsContent value="single">
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
                </EnhancedTabsContent>

                <EnhancedTabsContent value="comparative">
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
                </EnhancedTabsContent>

                <EnhancedTabsContent value="roc">
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
                </EnhancedTabsContent>
            </EnhancedTabs>

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
            title="Diagnostic Test Sample Size Calculator"
            description="Calculate sample sizes for diagnostic test evaluation, comparison studies, and ROC analysis"
            icon={Target}
            layout="single-column"
        >
            {renderInputForm()}
            {renderResults()}
        </ToolPageWrapper>
    );
}
