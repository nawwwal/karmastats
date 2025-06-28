'use client';

import { useState } from 'react';
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
            dropoutRate: 10,
            // Superiority Binary
            controlRate: 20,
            treatmentRate: 30,
            // Superiority Continuous
            meanDifference: 5,
            stdDev: 10,
            // Non-inferiority
            margin: 5,
            // Equivalence
            referenceRate: 20,
            testRate: 20,
        },
    });

    const superiorityOutcome = form.watch('superiorityOutcome');

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        try {
            setError(null);
            setResults(null);
            let result: Results;

            switch (activeTab) {
                case 'superiority':
                    if (superiorityOutcome === 'binary') {
                        result = calculateSuperiorityBinary(SuperiorityBinarySchema.parse(data));
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
                    controlRate: [/control group rate of ([\d\.]+)/i],
                    treatmentRate: [/treatment group rate of ([\d\.]+)/i],
                    meanDifference: [/mean difference of ([\d\.]+)/i],
                    stdDev: [/standard deviation of ([\d\.]+)/i],
                    margin: [/margin of ([\d\.]+)/i]
                };

                const values = extractParameters(textContent, patterns);

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

        // Calculate risk difference for binary outcomes
        const formValues = form.getValues();
        const riskDifference = (Number(formValues.treatmentRate) || 0) - (Number(formValues.controlRate) || 0);

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
                    label: "Effect Size (Risk Difference)",
                    value: riskDifference,
                    format: "decimal" as const,
                    category: "statistical" as const,
                    unit: "%"
                }
            ];

            visualizationData = [
                { label: "Treatment Group", value: results.treatmentSize, color: "#10b981" },
                { label: "Control Group", value: results.controlSize, color: "#3b82f6" }
            ];

            interpretationData = {
                effectSize: `Risk difference of ${riskDifference.toFixed(1)}% between treatment and control groups`,
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
                { label: "Required Sample", value: results.totalSize, color: "#3b82f6" }
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
                                        { label: "Control Event Rate", value: form.getValues('controlRate') || 0 },
                                        { label: "Treatment Event Rate", value: form.getValues('treatmentRate') || 0 },
                                        { label: "Absolute Risk Reduction", value: riskDifference },
                                        { label: "Number Needed to Treat", value: results.nnt }
                                    ]}
                                />
                            )}
                        </div>
                    }
                />
            </div>
        );
    };

    const renderInputForm = () => (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <span>Clinical Trial Design Calculator</span>
                </CardTitle>
                <CardDescription className="text-lg">
                    Calculate sample sizes for superiority, non-inferiority, and equivalence trials
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">Calculation Error</AlertTitle>
                        <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                )}

                <EnhancedTabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'superiority' | 'non-inferiority' | 'equivalence')} className="space-y-6">
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

                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('pdf-upload')?.click()}
                            className="flex items-center space-x-2"
                        >
                            <FileUp className="h-4 w-4" />
                            <span>Upload PDF</span>
                        </Button>
                        <input
                            id="pdf-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        {results && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={generatePdf}
                                className="flex items-center space-x-2"
                            >
                                <Download className="h-4 w-4" />
                                <span>Download Results</span>
                            </Button>
                        )}
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Common Parameters */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="alpha"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Significance Level (α) (%)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="power"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Statistical Power (%)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="80" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Tab-specific content */}
                            <EnhancedTabsContent value="superiority">
                                <Card className="border-blue-200 bg-blue-50/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Superiority Trial Parameters</CardTitle>
                                        <CardDescription>
                                            Design a trial to demonstrate that the new treatment is better than control
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="superiorityOutcome"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Outcome Type</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            className="flex flex-col space-y-2"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="binary" id="binary" />
                                                                <Label htmlFor="binary">Binary (event rates)</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="continuous" id="continuous" />
                                                                <Label htmlFor="continuous">Continuous (means)</Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {superiorityOutcome === 'binary' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="controlRate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Control Group Event Rate (%)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="20"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="treatmentRate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Treatment Group Event Rate (%)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="30"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {superiorityOutcome === 'continuous' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="meanDifference"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Expected Mean Difference</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="5"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="stdDev"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Standard Deviation</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="10"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </EnhancedTabsContent>

                            <EnhancedTabsContent value="non-inferiority">
                                <Card className="border-green-200 bg-green-50/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Non-Inferiority Trial Parameters</CardTitle>
                                        <CardDescription>
                                            Design a trial to show the new treatment is not worse than control by more than a margin
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="margin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Non-Inferiority Margin (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="5"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </EnhancedTabsContent>

                            <EnhancedTabsContent value="equivalence">
                                <Card className="border-purple-200 bg-purple-50/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Equivalence Trial Parameters</CardTitle>
                                        <CardDescription>
                                            Design a trial to show the treatments are equivalent within specified limits
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="referenceRate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Reference Treatment Rate (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="20"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="testRate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Test Treatment Rate (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="20"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="margin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Equivalence Margin (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="5"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </EnhancedTabsContent>

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
