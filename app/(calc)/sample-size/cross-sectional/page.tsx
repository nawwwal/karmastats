'use client';

import { useState, useEffect } from 'react';
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
import { FieldPopover } from "@/components/ui/field-popover";
import { getFieldExplanation } from "@/lib/field-explanations";
import { Label } from "@/components/ui/label";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { ResultsDisplay } from '@/components/ui/results-display';

export default function CrossSectionalPage() {
    const [results, setResults] = useState<CrossSectionalOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const form = useForm<CrossSectionalInput>({
        resolver: zodResolver(CrossSectionalSchema),
        defaultValues: {
            prevalence: 50,
            marginOfError: 5,
            confidenceLevel: 95,
            populationSize: undefined,
            designEffect: 1,
            nonResponseRate: 10,
            clusteringEffect: 0,
        },
    });

    const onSubmit = (data: CrossSectionalInput) => {
        try {
            setError(null);
            const result = calculateCrossSectionalSampleSize(data);
            setResults(result);
            // Scroll to top to show results
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                setError(`Validation failed: ${err.errors.map(e => e.message).join(', ')}`);
            } else {
                setError(err.message);
            }
        }
    };

    const handleReset = () => {
        setResults(null);
        setError(null);
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
                    prevalence: [/prevalence of ([\d\.]+)/i],
                    marginOfError: [/margin of error of ([\d\.]+)/i],
                    populationSize: [/population size of ([\d\.]+)/i]
                };

                const values = extractParameters(textContent, patterns);
                if (values.prevalence) form.setValue('prevalence', values.prevalence);
                if (values.marginOfError) form.setValue('marginOfError', values.marginOfError);
                if (values.populationSize) form.setValue('populationSize', values.populationSize);

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
                    },
                    {
                        label: "After Clustering Adjustment",
                        value: results.clusterAdjustedSize,
                        category: "secondary" as const,
                        format: "integer" as const
                    }
                ],
                interpretation: {
                    summary: `This cross-sectional study requires ${results.finalSize} participants to estimate a prevalence of ${formData.prevalence}% with a margin of error of ±${formData.marginOfError}% at ${formData.confidenceLevel}% confidence level. The calculation accounts for design effects, finite population correction (if applicable), clustering effects, and expected non-response.`,
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

        const resultItems = [
            { label: 'Base Sample Size (Cochran\'s)', value: results.baseSize, category: 'secondary' as const, format: 'integer' as const },
            { label: 'After Design Effect', value: results.designAdjustedSize, category: 'secondary' as const, format: 'integer' as const },
            { label: 'After Finite Population Correction', value: results.populationAdjustedSize, category: 'secondary' as const, format: 'integer' as const },
            { label: 'After Clustering Adjustment', value: results.clusterAdjustedSize, category: 'secondary' as const, format: 'integer' as const },
            { label: 'Final Required Sample Size', value: results.finalSize, category: 'primary' as const, highlight: true, format: 'integer' as const },
        ];

        const interpretation = {
            recommendations: [
                'Ensure random sampling from the target population',
                'Consider stratification to improve precision for subgroups',
                'Plan for potential non-response and implement follow-up procedures',
                'Use appropriate sampling frame that covers target population'
            ],
            assumptions: [
                'Simple random sampling or equivalent design',
                'Response rate assumptions are met',
                'Population size estimate is accurate (if finite)',
                'Clustering effects are correctly specified'
            ]
        };

        return (
            <ResultsDisplay
                title="Cross-Sectional Study Sample Size"
                results={resultItems}
                interpretation={interpretation}
                showInterpretation={true}
            />
        );
    };

    const renderInputForm = () => (
        <Form {...(form as any)}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* PDF Upload - Move to top with proper drop zone */}
                <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>📄</span> Import from PDF (Optional)
                        </CardTitle>
                        <CardDescription>Upload a research paper to auto-extract study parameters</CardDescription>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Study Parameters</CardTitle>
                        <CardDescription>Basic parameters for prevalence estimation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="prevalence" render={({ field }) => (
                                <FormItem>
                                    <FieldPopover
                                        {...getFieldExplanation('sampleSize', 'prevalence')}
                                        side="top"
                                    >
                                        <FormLabel>Expected Prevalence (%)</FormLabel>
                                    </FieldPopover>
                                    <FormControl>
                                        <Input type="number" step="0.1" min="0" max="100" {...field} />
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
                                        <Input type="number" step="0.1" min="0.1" max="50" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div>
                            <FormField name="confidenceLevel" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confidence Level</FormLabel>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="80">80%</SelectItem>
                                            <SelectItem value="90">90%</SelectItem>
                                            <SelectItem value="95">95%</SelectItem>
                                            <SelectItem value="99">99%</SelectItem>
                                            <SelectItem value="99.9">99.9%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center space-x-2">
                    <Switch id="advanced-switch" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                    <Label htmlFor="advanced-switch">Show Advanced Options</Label>
                </div>

                {showAdvanced && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Parameters</CardTitle>
                            <CardDescription>Design effects, population corrections, and clustering adjustments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField name="populationSize" render={({ field }) => (
                                    <FormItem>
                                        <FieldPopover
                                            {...getFieldExplanation('crossSectional', 'populationSize')}
                                            side="top"
                                        >
                                            <FormLabel>Population Size (Optional)</FormLabel>
                                        </FieldPopover>
                                        <FormControl>
                                            <Input type="number" step="1" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField name="designEffect" render={({ field }) => (
                                    <FormItem>
                                        <FieldPopover
                                            {...getFieldExplanation('crossSectional', 'designEffect')}
                                            side="top"
                                        >
                                            <FormLabel>Design Effect (DEFF)</FormLabel>
                                        </FieldPopover>
                                        <FormControl>
                                            <Input type="number" step="0.1" min="0.1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField name="nonResponseRate" render={({ field }) => (
                                    <FormItem>
                                        <FieldPopover
                                            {...getFieldExplanation('crossSectional', 'nonResponseRate')}
                                            side="top"
                                        >
                                            <FormLabel>Non-Response Rate (%)</FormLabel>
                                        </FieldPopover>
                                        <FormControl>
                                            <Input type="number" step="0.1" min="0" max="99" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField name="clusteringEffect" render={({ field }) => (
                                    <FormItem>
                                        <FieldPopover
                                            {...getFieldExplanation('crossSectional', 'clusteringEffect')}
                                            side="top"
                                        >
                                            <FormLabel>Clustering Effect (ICC)</FormLabel>
                                        </FieldPopover>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" max="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>
                )}

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
            title="Cross-Sectional Study Sample Size"
            description="Calculate sample sizes for prevalence studies with advanced adjustments for design effects and clustering"
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
