'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
    CrossSectionalSchema,
    calculateCrossSectionalSampleSize,
    CrossSectionalOutput,
    CrossSectionalInput
} from '@/lib/crossSectional';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import {
  PercentageField,
  StatisticalFormField
} from '@/components/ui/enhanced-form-field';
import { BarChart, Calculator, AlertCircle, FileUp, Download, Target, TrendingUp } from 'lucide-react';

export default function CrossSectionalPage() {
    const [results, setResults] = useState<CrossSectionalOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const form = useForm<CrossSectionalInput>({
        resolver: zodResolver(CrossSectionalSchema),
        defaultValues: {
            prevalence: 30, // 30% prevalence (realistic for cross-sectional studies)
            marginOfError: 3, // 3% margin of error (typical precision)
            confidenceLevel: 95,
            populationSize: undefined,
            designEffect: 1,
            nonResponseRate: 15, // 15% non-response rate (realistic)
            clusteringEffect: 0,
        },
    });

    const onSubmit = useCallback((data: CrossSectionalInput) => {
        try {
            setError(null);
            const result = calculateCrossSectionalSampleSize(data);
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
    }, [form]);

    // Auto-calculate with default values on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            const defaultData = form.getValues();
            onSubmit(defaultData);
        }, 100);
        return () => clearTimeout(timer);
    }, [form, onSubmit]);

    const handleReset = () => {
        setResults(null);
        setError(null);
        form.clearErrors();
        form.reset();
        setShowAdvanced(false);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const { extractTextFromPDF, extractParameters } = await import('@/lib/pdf-utils');
                const textContent = await extractTextFromPDF(e.target?.result as ArrayBuffer);

                const patterns = {
                    prevalence: [/prevalence of ([\d\.]+)/i, /estimated prevalence ([\d\.]+)/i],
                    marginOfError: [/margin of error of ([\d\.]+)/i, /precision of ([\d\.]+)/i],
                    confidenceLevel: [/confidence level of ([\d\.]+)/i, /([\d\.]+)% confidence/i],
                    populationSize: [/population size of ([\d,\.]+)/i, /total population ([\d,\.]+)/i],
                    designEffect: [/design effect of ([\d\.]+)/i, /DEFF of ([\d\.]+)/i],
                    nonResponseRate: [/non.{0,5}response rate of ([\d\.]+)/i, /response rate ([\d\.]+)/i]
                };

                const values = extractParameters(textContent, patterns);
                if (values.prevalence) form.setValue('prevalence', values.prevalence);
                if (values.marginOfError) form.setValue('marginOfError', values.marginOfError);
                if (values.confidenceLevel) form.setValue('confidenceLevel', values.confidenceLevel);
                if (values.populationSize) {
                    form.setValue('populationSize', values.populationSize);
                    setShowAdvanced(true);
                }
                if (values.designEffect) {
                    form.setValue('designEffect', values.designEffect);
                    setShowAdvanced(true);
                }
                if (values.nonResponseRate) {
                    form.setValue('nonResponseRate', values.nonResponseRate);
                    setShowAdvanced(true);
                }

                // Trigger calculation with new values
                const updatedData = form.getValues();
                onSubmit(updatedData);
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

            const config = {
                title: "Cross-Sectional Study Sample Size Analysis",
                subtitle: "Population-Based Prevalence Study Design",
                calculatorType: "Cross-Sectional Study",
                inputs: [
                    { label: "Expected Prevalence", value: formData.prevalence, unit: "%" },
                    { label: "Margin of Error", value: formData.marginOfError, unit: "%" },
                    { label: "Confidence Level", value: formData.confidenceLevel, unit: "%" },
                    { label: "Population Size", value: formData.populationSize || "Not specified" },
                    { label: "Design Effect (DEFF)", value: formData.designEffect || 1.0 },
                    { label: "Non-Response Rate", value: formData.nonResponseRate || 0, unit: "%" },
                    { label: "Clustering Effect (ICC)", value: formData.clusteringEffect || 0 }
                ],
                results: [
                    {
                        label: "Final Required Sample Size",
                        value: results.finalSize,
                        highlight: true,
                        category: "primary" as const,
                        format: "integer" as const
                    },
                    {
                        label: "Base Sample Size (Cochran's)",
                        value: results.baseSize,
                        category: "secondary" as const,
                        format: "integer" as const
                    },
                    {
                        label: "After Design Effect",
                        value: results.designAdjustedSize,
                        category: "secondary" as const,
                        format: "integer" as const
                    },
                    {
                        label: "After Population Correction",
                        value: results.populationAdjustedSize,
                        category: "secondary" as const,
                        format: "integer" as const
                    }
                ],
                interpretation: {
                    summary: `This cross-sectional study requires ${results.finalSize} participants to estimate a prevalence of ${formData.prevalence}% with a margin of error of ±${formData.marginOfError}% at ${formData.confidenceLevel}% confidence level.`,
                    recommendations: [
                        'Ensure random sampling from the target population',
                        'Consider stratification to improve precision for subgroups',
                        'Plan for potential non-response and implement follow-up procedures',
                        'Use appropriate sampling frame that covers target population',
                        'Validate prevalence assumptions with pilot data if possible'
                    ],
                    assumptions: [
                        'Simple random sampling or equivalent design',
                        'Response rate assumptions are met',
                        'Population size estimate is accurate (if finite)',
                        'Clustering effects are correctly specified',
                        'Prevalence estimate is reasonable for the population'
                    ]
                }
            };

            await generateModernPDF(config);
        } catch (err: any) {
            setError(`Failed to generate PDF: ${err.message}`);
        }
    };

    const renderResults = () => {
        if (!results) return null;

        const formData = form.getValues();

        const enhancedResults = [
            {
                label: "Final Required Sample Size",
                value: results.finalSize,
                format: "integer" as const,
                category: "primary" as const,
                highlight: true,
                interpretation: "Total participants needed including all adjustments"
            },
            {
                label: "Base Sample Size (Cochran's)",
                value: results.baseSize,
                format: "integer" as const,
                category: "secondary" as const,
                interpretation: "Basic sample size before adjustments"
            },
            {
                label: "After Design Effect",
                value: results.designAdjustedSize,
                format: "integer" as const,
                category: "secondary" as const,
                interpretation: "Sample size after design effect adjustment"
            },
            {
                label: "After Population Correction",
                value: results.populationAdjustedSize,
                format: "integer" as const,
                category: "secondary" as const,
                interpretation: "Sample size after finite population correction"
            }
        ];

        // Add clustering adjustment if applicable
        if (formData.clusteringEffect && formData.clusteringEffect > 0) {
            enhancedResults.push({
                label: "After Clustering Adjustment",
                value: results.clusterAdjustedSize,
                format: "integer" as const,
                category: "statistical" as const,
                interpretation: "Sample size after clustering effect adjustment"
            });
        }

        const visualizationData = [
            { label: "Base Sample", value: results.baseSize, color: "hsl(var(--muted))" },
            { label: "Design Adjusted", value: results.designAdjustedSize - results.baseSize, color: "hsl(var(--primary))" },
            { label: "Population Corrected", value: results.populationAdjustedSize - results.designAdjustedSize, color: "hsl(var(--secondary))" },
            { label: "Final Adjustments", value: results.finalSize - results.populationAdjustedSize, color: "hsl(var(--success))" }
        ].filter(item => item.value > 0);

        const interpretationData = {
            effectSize: `Prevalence estimation with ${formData.marginOfError}% precision`,
            statisticalSignificance: `${formData.confidenceLevel}% confidence level`,
            clinicalSignificance: `Study can detect prevalence within ±${formData.marginOfError}% of true value`,
            recommendations: [
                'Ensure random sampling from the target population',
                'Consider stratification to improve precision for subgroups',
                'Plan for potential non-response and implement follow-up procedures',
                'Use appropriate sampling frame that covers target population',
                'Validate prevalence assumptions with pilot data if possible'
            ],
            assumptions: [
                'Simple random sampling or equivalent design',
                'Response rate assumptions are met',
                'Population size estimate is accurate (if finite)',
                'Clustering effects are correctly specified',
                'Prevalence estimate is reasonable for the population'
            ]
        };

        return (
            <div className="space-y-8">
                <EnhancedResultsDisplay
                    title="Cross-Sectional Study Results"
                    subtitle="Population-based prevalence study sample size analysis"
                    results={enhancedResults}
                    interpretation={interpretationData}
                    visualizations={
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AdvancedVisualization
                                title="Sample Size Breakdown"
                                type="pie"
                                data={visualizationData}
                                insights={[
                                    {
                                        key: "Final sample size",
                                        value: results.finalSize.toString(),
                                        significance: "high"
                                    },
                                    {
                                        key: "Precision",
                                        value: `±${formData.marginOfError}%`,
                                        significance: "medium"
                                    }
                                ]}
                            />

                            <AdvancedVisualization
                                title="Study Parameters"
                                type="comparison"
                                data={[
                                    { label: "Expected Prevalence", value: formData.prevalence },
                                    { label: "Margin of Error", value: formData.marginOfError },
                                    { label: "Confidence Level", value: formData.confidenceLevel },
                                    { label: "Design Effect", value: formData.designEffect || 1 }
                                ]}
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

    const renderInputForm = () => (
        <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="space-y-8 pt-8">
                {error && (
                    <Alert className="border-destructive/20 bg-destructive/10 text-left">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <AlertTitle className="text-destructive font-bold text-left">Calculation Error</AlertTitle>
                        <AlertDescription className="text-destructive text-left">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileUp className="h-5 w-5 text-primary" />
                            <span>Import from PDF (Optional)</span>
                        </CardTitle>
                        <CardDescription>Upload research protocol to auto-extract study parameters</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('pdf-upload-cross-sectional')?.click()}
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
                                id="pdf-upload-cross-sectional"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Basic Parameters Card */}
                        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Study Parameters
                                </CardTitle>
                                <CardDescription>
                                    Basic parameters for prevalence estimation in cross-sectional studies
                                </CardDescription>
                    </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <PercentageField
                                        control={form.control}
                                        name="prevalence"
                                        label="Expected Prevalence"
                                        description="Expected proportion of the population with the condition or characteristic of interest"
                                        calculatorType="cross-sectional"
                                        size="md"
                                        placeholder="30"
                                        min={0.1}
                                        max={99.9}
                                        step={0.1}
                                    />
                                    <PercentageField
                                        control={form.control}
                                        name="marginOfError"
                                        label="Margin of Error"
                                        description="Acceptable precision around the prevalence estimate (half-width of confidence interval)"
                                        calculatorType="cross-sectional"
                                        size="md"
                                        placeholder="3"
                                        min={0.1}
                                        max={50}
                                        step={0.1}
                                    />
                        </div>

                                <StatisticalFormField
                                    control={form.control}
                                    name="confidenceLevel"
                                    fieldType="select"
                                    label="Confidence Level"
                                    description="Level of confidence for the prevalence estimate"
                                    calculatorType="cross-sectional"
                                    size="md"
                                    selectOptions={[
                                        { value: "80", label: "80%" },
                                        { value: "90", label: "90%" },
                                        { value: "95", label: "95%" },
                                        { value: "99", label: "99%" },
                                        { value: "99.9", label: "99.9%" }
                                    ]}
                                />
                    </CardContent>
                </Card>

                        {/* Advanced Options Toggle */}
                <div className="flex items-center space-x-2">
                            <Switch
                                id="advanced-switch"
                                checked={showAdvanced}
                                onCheckedChange={setShowAdvanced}
                            />
                            <Label htmlFor="advanced-switch" className="text-base font-medium">
                                Show Advanced Options
                            </Label>
                </div>

                {showAdvanced && (
                            <Card className="border-primary/20 bg-primary/10 dark:bg-primary/20 dark:border-primary/30">
                        <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Advanced Parameters
                                    </CardTitle>
                                    <CardDescription>
                                        Design effects, population corrections, and clustering adjustments
                                    </CardDescription>
                        </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <StatisticalFormField
                                            control={form.control}
                                            name="populationSize"
                                            fieldType="number"
                                            label="Population Size (Optional)"
                                            description="Total size of the target population (leave empty for infinite population)"
                                            calculatorType="cross-sectional"
                                            size="md"
                                            placeholder="Leave empty for infinite"
                                            min={1}
                                            step={1}
                                        />
                                        <StatisticalFormField
                                            control={form.control}
                                            name="designEffect"
                                            fieldType="number"
                                            label="Design Effect (DEFF)"
                                            description="Factor to account for complex sampling design (1.0 for simple random sampling)"
                                            calculatorType="cross-sectional"
                                            size="md"
                                            placeholder="1.0"
                                            min={0.1}
                                            step={0.1}
                                        />
                                        <PercentageField
                                            control={form.control}
                                            name="nonResponseRate"
                                            label="Non-Response Rate"
                                            description="Expected percentage of participants who will not respond"
                                            calculatorType="cross-sectional"
                                            size="md"
                                            placeholder="15"
                                            min={0}
                                            max={99}
                                            step={0.1}
                                        />
                                        <StatisticalFormField
                                            control={form.control}
                                            name="clusteringEffect"
                                            fieldType="number"
                                            label="Clustering Effect (ICC)"
                                            description="Intracluster correlation coefficient for clustered sampling (0 for independent sampling)"
                                            calculatorType="cross-sectional"
                                            size="md"
                                            placeholder="0"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                        />
                            </div>
                        </CardContent>
                    </Card>
                )}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-6">
                            <Button
                                type="submit"
                                size="lg"
                                className="px-12 py-4 text-lg font-semibold h-14"
                            >
                                <Calculator className="h-5 w-5 mr-3" />
                    Calculate Sample Size
                </Button>
                        </div>
            </form>
        </Form>
            </CardContent>
        </Card>
    );

    return (
        <ToolPageWrapper
            title="Cross-Sectional Study Sample Size Calculator"
            description="Calculate sample sizes for prevalence studies with advanced adjustments for design effects and clustering"
            icon={BarChart}
            layout="single-column"
            onReset={handleReset}
        >
            {renderInputForm()}
            {renderResults()}
        </ToolPageWrapper>
    );
}
