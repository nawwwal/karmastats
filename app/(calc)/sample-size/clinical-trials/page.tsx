'use client';

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";

import {
    SuperiorityBinarySchema, calculateSuperiorityBinary, SuperiorityBinaryOutput,
    SuperiorityContinuousSchema, calculateSuperiorityContinuous, SuperiorityContinuousOutput,
    NonInferioritySchema, calculateNonInferiority, NonInferiorityOutput,
    EquivalenceSchema, calculateEquivalence, EquivalenceOutput
} from '@/lib/clinicalTrial';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { StatisticalSummary } from '@/components/ui/statistical-summary';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import { Label } from "@/components/ui/label";
import {
  Activity, Target, BarChart3, TrendingUp, Users, Shield,
  FileUp, Download, Calculator, AlertCircle, CheckCircle
} from 'lucide-react';
import {
  StatisticalFormField,
  PowerField,
  AlphaField,
  PercentageField,
  EffectSizeField,
  AllocationRatioField
} from '@/components/ui/enhanced-form-field';

type Results = SuperiorityBinaryOutput | SuperiorityContinuousOutput | NonInferiorityOutput | EquivalenceOutput;

const FormSchema = z.object({
    superiorityOutcome: z.enum(['binary', 'continuous']).optional(),
    // Allow all fields to be optional for the combined form
    alpha: z.string().optional(),
    power: z.string().optional(),
    allocationRatio: z.number().optional(),
    dropoutRate: z.number().optional(),
    // Superiority binary
    controlRate: z.number().optional(),
    treatmentRate: z.number().optional(),
    // Superiority continuous
    meanDifference: z.number().optional(),
    stdDev: z.number().optional(),
    // Non-inferiority
    margin: z.number().optional(),
    // Equivalence
    referenceRate: z.number().optional(),
    testRate: z.number().optional(),
});

export default function ClinicalTrialsPage() {
    const [activeTab, setActiveTab] = useState<'superiority' | 'non-inferiority' | 'equivalence'>('superiority');
    const [results, setResults] = useState<Results | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            superiorityOutcome: 'binary',
            alpha: '5',
            power: '80',
            allocationRatio: 1,
            dropoutRate: 15,
            // Superiority Binary - Realistic clinical trial scenario (success rates)
            controlRate: 60, // 60% success rate in control group (standard therapy)
            treatmentRate: 75, // 75% success rate in treatment group (improved therapy)
            // Superiority Continuous - Realistic continuous outcome scenario
            meanDifference: 2.5, // Clinically meaningful difference (e.g., pain scale)
            stdDev: 6.0, // Typical variability
            // Non-inferiority - Conservative margin
            margin: 5, // 5% non-inferiority margin
            // Equivalence - Same rates scenario
            referenceRate: 20, // 20% reference rate
            testRate: 18, // 18% test rate (close for equivalence)
        },
    });

    const superiorityOutcome = form.watch('superiorityOutcome');

    // Auto-calculate with default values on component mount
    React.useEffect(() => {
        if (!results && !error) {
            // Small delay to ensure form is properly initialized
            const timer = setTimeout(() => {
                const defaultData = form.getValues();
                onSubmit(defaultData);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        try {
            setError(null);
            setResults(null);
            let result: Results;



            switch (activeTab) {
                case 'superiority':
                    if (superiorityOutcome === 'binary') {
                        const validatedData = SuperiorityBinarySchema.parse(data);
                        result = calculateSuperiorityBinary(validatedData);
                    } else {
                        result = calculateSuperiorityContinuous(SuperiorityContinuousSchema.parse(data));
                    }
                    break;
                case 'non-inferiority':
                    result = calculateNonInferiority(NonInferioritySchema.parse(data));
                    break;
                case 'equivalence':
                    result = calculateEquivalence(EquivalenceSchema.parse(data));
                    break;
            }
            setResults(result);
            // Clear any existing form errors on successful calculation
            form.clearErrors();
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                // Set form errors for individual fields
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
                // Dynamic import to prevent SSR issues
                const { extractTextFromPDF, extractParameters } = await import('@/lib/pdf-utils');
                const textContent = await extractTextFromPDF(e.target?.result as ArrayBuffer);

                const patterns = {
                    alpha: [/alpha of ([\d\.]+)/i, /significance level of ([\d\.]+)/i],
                    power: [/power of ([\d\.]+)/i, /statistical power of ([\d\.]+)/i],
                    controlRate: [/control group rate of ([\d\.]+)/i, /event rate in control group of ([\d\.]+)/i],
                    treatmentRate: [/treatment group rate of ([\d\.]+)/i, /event rate in treatment group of ([\d\.]+)/i],
                    meanDifference: [/mean difference of ([\d\.]+)/i],
                    stdDev: [/standard deviation of ([\d\.]+)/i],
                    margin: [/margin of ([\d\.]+)/i, /(non-inferiority|equivalence) margin of ([\d\.]+)/i],
                    allocationRatio: [/allocation ratio of ([\d\.:]+)/i]
                };

                const values = extractParameters(textContent, patterns);

                if (values.alpha) form.setValue('alpha', values.alpha.toString());
                if (values.power) form.setValue('power', values.power.toString());
                if (values.allocationRatio) form.setValue('allocationRatio', values.allocationRatio);

                if (activeTab === 'superiority') {
                    if (superiorityOutcome === 'binary') {
                        if (values.controlRate) form.setValue('controlRate', values.controlRate);
                        if (values.treatmentRate) form.setValue('treatmentRate', values.treatmentRate);
                    } else {
                        if (values.meanDifference) form.setValue('meanDifference', values.meanDifference);
                        if (values.stdDev) form.setValue('stdDev', values.stdDev);
                    }
                } else if (activeTab === 'non-inferiority' || activeTab === 'equivalence') {
                    if (values.margin) form.setValue('margin', values.margin);
                    if (activeTab === 'equivalence' && values.controlRate) {
                        form.setValue('referenceRate', values.controlRate);
                        form.setValue('testRate', values.controlRate); // Assume same for equivalence unless specified
                    }
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
                calculatorType: `Clinical Trial ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
                inputs: [],
                results: [],
                interpretation: {
                    recommendations: [],
                    assumptions: []
                }
            };

            if ('nnt' in results) { // Superiority Binary
                config.title = "Superiority Clinical Trial Design";
                config.subtitle = "Binary Outcome Analysis";
                config.inputs = [
                    { label: "Control Group Event Rate", value: formData.controlRate, unit: "%" },
                    { label: "Treatment Group Event Rate", value: formData.treatmentRate, unit: "%" },
                    { label: "Allocation Ratio", value: formData.allocationRatio },
                    { label: "Significance Level", value: (Number(formData.alpha) || 0) * 100, unit: "%" },
                    { label: "Statistical Power", value: (Number(formData.power) || 0) * 100, unit: "%" },
                    { label: "Dropout Rate", value: formData.dropoutRate, unit: "%" }
                ];
                config.results = [
                    { label: "Total Required Sample Size", value: results.totalSize, highlight: true, category: "primary", format: "integer" },
                    { label: "Number Needed to Treat (NNT)", value: results.nnt, highlight: true, category: "primary", format: "decimal", precision: 1 },
                    { label: "Treatment Group Size", value: results.treatmentSize, category: "secondary", format: "integer" },
                    { label: "Control Group Size", value: results.controlSize, category: "secondary", format: "integer" }
                ];
                config.interpretation.summary = `This superiority trial requires ${results.totalSize} participants total to detect a difference between ${formData.controlRate}% and ${formData.treatmentRate}% event rates. The Number Needed to Treat (NNT = ${results.nnt.toFixed(1)}) indicates you need to treat ${Math.round(results.nnt)} patients to prevent one additional adverse event.`;
            }

            await generateModernPDF(config);
        } catch (err: any) {
            setError(`Failed to generate PDF: ${err.message}`);
        }
    };

    const renderResults = () => {
        if (!results) return null;

        const getTrialTypeIcon = () => {
            switch (activeTab) {
                case 'superiority': return <TrendingUp className="h-5 w-5" />;
                case 'non-inferiority': return <Shield className="h-5 w-5" />;
                case 'equivalence': return <Target className="h-5 w-5" />;
                default: return <Calculator className="h-5 w-5" />;
            }
        };

        const getTrialTypeName = () => {
            switch (activeTab) {
                case 'superiority': return 'Superiority Trial';
                case 'non-inferiority': return 'Non-Inferiority Trial';
                case 'equivalence': return 'Equivalence Trial';
                default: return 'Clinical Trial';
            }
        };

        // Prepare enhanced results based on trial type
        let enhancedResults: any[] = [];
        let visualizationData: any[] = [];
        let interpretationData: any = {};

        // Calculate benefit difference for binary outcomes (treatment - control)
        const formValues = form.getValues();
        const benefitDifference = (Number(formValues.treatmentRate) || 0) - (Number(formValues.controlRate) || 0);

        if ('nnt' in results) { // Superiority Binary

            enhancedResults = [
                {
                    label: "Total Sample Size",
                    value: results.totalSize,
                    format: "integer" as const,
                    category: "primary" as const,
                    highlight: true,
                    interpretation: "Total participants needed for adequate power"
                },
                {
                    label: "Number Needed to Treat (NNT)",
                    value: results.nnt,
                    format: "decimal" as const,
                    category: "primary" as const,
                    highlight: true,
                    interpretation: "Patients needed to treat to prevent one event"
                },
                {
                    label: "Treatment Group Size",
                    value: results.treatmentSize,
                    format: "integer" as const,
                    category: "secondary" as const
                },
                {
                    label: "Control Group Size",
                    value: results.controlSize,
                    format: "integer" as const,
                    category: "secondary" as const
                },
                {
                    label: "Effect Size (Benefit Difference)",
                    value: benefitDifference,
                    format: "decimal" as const,
                    category: "statistical" as const,
                    unit: "%"
                }
            ];

            visualizationData = [
                            { label: "Treatment Group", value: results.treatmentSize, color: "hsl(var(--success))" },
            { label: "Control Group", value: results.controlSize, color: "hsl(var(--primary))" }
            ];

            interpretationData = {
                effectSize: `Benefit difference of ${benefitDifference.toFixed(1)}% between treatment and control groups`,
                statisticalSignificance: `NNT = ${results.nnt.toFixed(1)} indicates moderate treatment effect`,
                clinicalSignificance: `Trial requires ${results.totalSize} participants to detect meaningful clinical difference`,
                recommendations: [
                    "Ensure balanced randomization between groups",
                    "Plan for adequate follow-up duration",
                    "Consider interim analyses for safety monitoring",
                    "Account for potential dropout with 10-20% inflation",
                    "Validate outcome measurement procedures"
                ],
                assumptions: [
                    "Binary outcome with expected event rates",
                    "Independent observations between participants",
                    "Fixed treatment allocation ratio",
                    "No interim efficacy analyses planned",
                    "Adequate blinding procedures possible"
                ]
            };
        } else if ('totalSize' in results) { // Other trial types
            enhancedResults = [
                {
                    label: "Total Sample Size",
                    value: results.totalSize,
                    format: "integer" as const,
                    category: "primary" as const,
                    highlight: true,
                    interpretation: "Total participants needed for adequate power"
                }
            ];

            if ('treatmentSize' in results) {
                enhancedResults.push({
                    label: "Treatment Group Size",
                    value: results.treatmentSize,
                    format: "integer" as const,
                    category: "secondary" as const
                });
            }

            if ('controlSize' in results) {
                enhancedResults.push({
                    label: "Control Group Size",
                    value: results.controlSize,
                    format: "integer" as const,
                    category: "secondary" as const
                });
            }

            visualizationData = [
                { label: "Required Sample", value: results.totalSize, color: "hsl(var(--primary))" }
            ];
        }

        return (
            <div className="space-y-8">
                <EnhancedResultsDisplay
                    title={`${getTrialTypeName()} Results`}
                    subtitle="Clinical trial design and sample size analysis"
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
                                        key: "Total participants",
                                        value: results.totalSize.toString(),
                                        significance: "high"
                                    },
                                    {
                                        key: "Study design",
                                        value: getTrialTypeName(),
                                        significance: "medium"
                                    }
                                ]}
                            />

                            {'nnt' in results && (
                                <AdvancedVisualization
                                    title="Treatment Effectiveness"
                                    type="comparison"
                                    data={[
                                        { label: "Control Success Rate", value: form.getValues('controlRate') || 0 },
                                        { label: "Treatment Success Rate", value: form.getValues('treatmentRate') || 0 },
                                        { label: "Absolute Benefit Increase", value: benefitDifference },
                                        { label: "Number Needed to Treat", value: results.nnt }
                                    ]}
                                />
                            )}
                        </div>
                    }
                />

                {/* Download Results Button */}
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center sm:text-left">
                                <h3 className="font-semibold text-lg">Export Your Results</h3>
                                <p className="text-sm text-muted-foreground">
                                    Download a comprehensive PDF report with all calculations and interpretations
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={generatePdf}
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-base font-semibold"
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
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
                <CardTitle className="text-2xl flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <span>Clinical Trial Design Calculator</span>
                </CardTitle>
                <CardDescription className="text-lg">
                    Calculate sample sizes for superiority, non-inferiority, and equivalence trials with realistic clinical scenarios
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {error && (
                    <Alert className="border-destructive/20 bg-destructive/10 text-left">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <AlertTitle className="text-destructive font-bold">Calculation Error</AlertTitle>
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
                        <CardDescription>Upload a research protocol to auto-extract trial parameters</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('pdf-upload-clinical')?.click()}
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
                                id="pdf-upload-clinical"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </CardContent>
                </Card>

                <EnhancedTabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'superiority' | 'non-inferiority' | 'equivalence')} className="space-y-8">
                    <EnhancedTabsList className="grid w-full grid-cols-3" variant="modern">
                        <EnhancedTabsTrigger value="superiority" variant="modern">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4" />
                                <span>Superiority</span>
                            </div>
                        </EnhancedTabsTrigger>
                        <EnhancedTabsTrigger value="non-inferiority" variant="modern">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Non-Inferiority</span>
                            </div>
                        </EnhancedTabsTrigger>
                        <EnhancedTabsTrigger value="equivalence" variant="modern">
                            <div className="flex items-center space-x-2">
                                <Target className="h-4 w-4" />
                                <span>Equivalence</span>
                            </div>
                        </EnhancedTabsTrigger>
                    </EnhancedTabsList>



                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Common Parameters - Enhanced with better UX */}
                            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                                <CardHeader>
                                    <CardTitle className="text-xl">Study Design Parameters</CardTitle>
                                    <CardDescription>
                                        Standard statistical parameters for clinical trial design
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <AlphaField
                                    control={form.control}
                                    name="alpha"
                                            calculatorType="clinical-trial"
                                            size="md"
                                        />
                                        <PowerField
                                    control={form.control}
                                    name="power"
                                            calculatorType="clinical-trial"
                                            size="md"
                                />
                            </div>
                                    <AllocationRatioField
                                        control={form.control}
                                        name="allocationRatio"
                                        calculatorType="clinical-trial"
                                        size="md"
                                    />
                                </CardContent>
                            </Card>

                            {/* Tab-specific content with enhanced form fields */}
                            <EnhancedTabsContent value="superiority">
                                <Card className="border-primary/20 bg-primary/10 dark:bg-primary/20 dark:border-primary/30">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Superiority Trial Design</CardTitle>
                                        <CardDescription>
                                            Demonstrate that the new treatment is significantly better than control. Example scenario: Testing a new treatment to achieve higher cure rates than standard therapy.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <StatisticalFormField
                                            control={form.control}
                                            name="superiorityOutcome"
                                            label="Primary Outcome Type"
                                            description="Choose the type of primary outcome measure for your trial"
                                            fieldType="select"
                                            calculatorType="clinical-trial"
                                            selectOptions={[
                                                {
                                                  value: "binary",
                                                  label: "Binary (Success Rates)",
                                                  description: "e.g., Cure Rate, Treatment Response, Recovery"
                                                },
                                                {
                                                  value: "continuous",
                                                  label: "Continuous (Measurements)",
                                                  description: "e.g., Blood Pressure, Pain Score, Lab Values"
                                                }
                                            ]}
                                            size="md"
                                        />

                                        {superiorityOutcome === 'binary' && (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <PercentageField
                                                    control={form.control}
                                                    name="controlRate"
                                                        label="Control Group Success Rate (%)"
                                                        description="Expected percentage of participants in control group achieving the primary outcome (e.g., 60% cure rate with standard therapy)"
                                                        calculatorType="clinical-trial"
                                                        size="md"
                                                    />
                                                    <PercentageField
                                                    control={form.control}
                                                    name="treatmentRate"
                                                        label="Treatment Group Success Rate (%)"
                                                        description="Expected percentage of participants in treatment group achieving the primary outcome (e.g., 75% cure rate with new therapy - 25% relative improvement)"
                                                        calculatorType="clinical-trial"
                                                        size="md"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {superiorityOutcome === 'continuous' && (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <EffectSizeField
                                                    control={form.control}
                                                    name="meanDifference"
                                                    label="Expected Mean Difference"
                                                    description="Clinically meaningful difference between treatment and control groups (e.g., 2.5 point reduction in pain scale)"
                                                    calculatorType="clinical-trial"
                                                    size="md"
                                                />
                                                <StatisticalFormField
                                                    control={form.control}
                                                    name="stdDev"
                                                    label="Standard Deviation"
                                                    description="Expected variability in the outcome measure (e.g., 6.0 for pain scale with typical variability)"
                                                    fieldType="continuous"
                                                    calculatorType="clinical-trial"
                                                    size="md"
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </EnhancedTabsContent>

                            <EnhancedTabsContent value="non-inferiority">
                                <Card className="border-success/20 bg-success/10 dark:bg-success/20 dark:border-success/30">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Non-Inferiority Trial Design</CardTitle>
                                        <CardDescription>
                                            Show that the new treatment is not worse than control by more than a predefined margin. Example: Testing a generic drug to ensure it's not significantly worse than the brand name.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <StatisticalFormField
                                            control={form.control}
                                            name="margin"
                                            label="Non-Inferiority Margin (%)"
                                            description="Maximum acceptable difference - if new treatment is within this margin, it's considered non-inferior (e.g., 5% margin means new treatment can be up to 5% worse)"
                                            fieldType="percentage"
                                            calculatorType="clinical-trial"
                                            size="md"
                                        />
                                    </CardContent>
                                </Card>
                            </EnhancedTabsContent>

                            <EnhancedTabsContent value="equivalence">
                                <Card className="border-secondary/20 bg-secondary/10 dark:bg-secondary/20 dark:border-secondary/30">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Equivalence Trial Design</CardTitle>
                                        <CardDescription>
                                            Demonstrate that two treatments are equivalent within specified limits. Example: Comparing two antibiotics to show they have similar efficacy.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <PercentageField
                                                control={form.control}
                                                name="referenceRate"
                                                label="Reference Treatment Rate (%)"
                                                description="Expected event rate for the reference/standard treatment (e.g., 20% cure rate for standard antibiotic)"
                                                calculatorType="clinical-trial"
                                                size="md"
                                            />
                                            <PercentageField
                                                control={form.control}
                                                name="testRate"
                                                label="Test Treatment Rate (%)"
                                                description="Expected event rate for the test treatment (e.g., 18% cure rate for new antibiotic - should be close to reference)"
                                                calculatorType="clinical-trial"
                                                size="md"
                                            />
                                        </div>
                                        <StatisticalFormField
                                            control={form.control}
                                            name="margin"
                                            label="Equivalence Margin (%)"
                                            description="Maximum acceptable difference for treatments to be considered equivalent (e.g., 5% margin means treatments are equivalent if within ±5%)"
                                            fieldType="percentage"
                                            calculatorType="clinical-trial"
                                            size="md"
                                        />
                                    </CardContent>
                                </Card>
                            </EnhancedTabsContent>

                            {/* Dropout Rate - Enhanced */}
                            <Card className="border-warning/20 bg-warning/5">
                                <CardHeader>
                                    <CardTitle className="text-lg">Study Implementation</CardTitle>
                                    <CardDescription>
                                        Account for practical aspects of conducting the clinical trial
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PercentageField
                                        control={form.control}
                                        name="dropoutRate"
                                        label="Expected Dropout Rate (%)"
                                        description="Percentage of participants expected to drop out or be lost to follow-up during the study (15% is typical for most clinical trials)"
                                        calculatorType="clinical-trial"
                                        size="md"
                                    />
                                </CardContent>
                            </Card>

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
                </EnhancedTabs>
            </CardContent>
        </Card>
    );

    return (
        <ToolPageWrapper
            title="Clinical Trial Sample Size Calculator"
            description="Design superior, non-inferiority, and equivalence trials with comprehensive sample size calculations and advanced visualizations"
            backHref="/"
            backLabel="Sample Size Calculator"
            onReset={handleReset}
            icon={Activity}
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
