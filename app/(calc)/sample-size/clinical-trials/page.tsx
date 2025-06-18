'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
// jsPDF will be dynamically imported to prevent SSR issues
// pdfjs will be dynamically imported to prevent SSR issues

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { ResultsDisplay } from '@/components/ui/results-display';
import { Label } from "@/components/ui/label";

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
            // Dynamic import to prevent SSR issues
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Karmastat Clinical Trials Report`, 105, 20, { align: 'center' });
        doc.setFontSize(12);

        let y = 40;

        if ('nnt' in results) { // Superiority Binary
            doc.text('Superiority Trial Results (Binary Outcome)', 20, y);
            y += 10;
            doc.text(`Treatment Group Size: ${results.treatmentSize}`, 25, y);
            y += 7;
            doc.text(`Control Group Size: ${results.controlSize}`, 25, y);
            y += 7;
            doc.text(`Total Sample Size: ${results.totalSize}`, 25, y);
            y += 7;
            doc.text(`Number Needed to Treat (NNT): ${results.nnt.toFixed(2)}`, 25, y);
        } else if ('effectSize' in results) { // Superiority Continuous
            doc.text('Superiority Trial Results (Continuous Outcome)', 20, y);
            y += 10;
            doc.text(`Treatment Group Size: ${results.treatmentSize}`, 25, y);
            y += 7;
            doc.text(`Control Group Size: ${results.controlSize}`, 25, y);
            y += 7;
            doc.text(`Total Sample Size: ${results.totalSize}`, 25, y);
            y += 7;
            doc.text(`Cohen's d (Effect Size): ${results.effectSize.toFixed(4)}`, 25, y);
        } else if ('treatmentSize' in results) { // Non-inferiority
            doc.text('Non-Inferiority Trial Results', 20, y);
            y += 10;
            doc.text(`Treatment Group Size: ${results.treatmentSize}`, 25, y);
            y += 7;
            doc.text(`Control Group Size: ${results.controlSize}`, 25, y);
            y += 7;
            doc.text(`Total Sample Size: ${results.totalSize}`, 25, y);
        } else if ('testSize' in results) { // Equivalence
            doc.text('Equivalence Trial Results', 20, y);
            y += 10;
            doc.text(`Test Group Size: ${results.testSize}`, 25, y);
            y += 7;
            doc.text(`Reference Group Size: ${results.referenceSize}`, 25, y);
            y += 7;
            doc.text(`Total Sample Size: ${results.totalSize}`, 25, y);
        }

        doc.save(`karmastat-clinical-trial-report-${activeTab}.pdf`);
        } catch (err: any) {
            setError(`Failed to generate PDF: ${err.message}`);
        }
    }

        const renderResults = () => {
        if (!results) return null;

        let resultItems: any[] = [];
        let title = '';
        let interpretation: any = {};

        if ('nnt' in results) { // Superiority Binary
            title = 'Superiority Trial Results (Binary Outcome)';
            resultItems = [
                { label: 'Total Sample Size', value: results.totalSize, category: 'primary', highlight: true, format: 'integer' },
                { label: 'Number Needed to Treat (NNT)', value: results.nnt, category: 'primary', highlight: true, format: 'decimal' },
                { label: 'Treatment Group Size', value: results.treatmentSize, category: 'secondary', format: 'integer' },
                { label: 'Control Group Size', value: results.controlSize, category: 'secondary', format: 'integer' },
                { label: 'Statistical Power', value: '80%', category: 'statistical' },
                { label: 'Significance Level', value: 'α = 0.05', category: 'statistical' }
            ];
            interpretation.effectSize = `This superiority trial requires ${results.totalSize} participants total. With the specified event rates, you would need to treat ${results.nnt.toFixed(0)} patients to prevent one additional adverse outcome compared to control.`;
            interpretation.recommendations = [
                'Ensure adequate randomization and blinding procedures',
                'Consider stratification by key prognostic factors',
                'Plan for interim analyses if trial duration is long',
                'Account for potential protocol deviations in sample size'
            ];
            interpretation.assumptions = [
                'Binary outcome follows binomial distribution',
                'Independent observations',
                'Fixed event rates in each group',
                'No interim analyses affecting alpha level'
            ];
        } else if ('effectSize' in results) { // Superiority Continuous
            title = 'Superiority Trial Results (Continuous Outcome)';
            resultItems = [
                { label: 'Total Sample Size', value: results.totalSize, category: 'primary', highlight: true, format: 'integer' },
                { label: "Cohen's d (Effect Size)", value: results.effectSize, category: 'primary', highlight: true, format: 'decimal' },
                { label: 'Treatment Group Size', value: results.treatmentSize, category: 'secondary', format: 'integer' },
                { label: 'Control Group Size', value: results.controlSize, category: 'secondary', format: 'integer' },
                { label: 'Statistical Power', value: '80%', category: 'statistical' },
                { label: 'Significance Level', value: 'α = 0.05', category: 'statistical' }
            ];
            const effectMagnitude = results.effectSize < 0.3 ? 'small' : results.effectSize < 0.8 ? 'medium' : 'large';
            interpretation.effectSize = `This superiority trial requires ${results.totalSize} participants total. The calculated effect size (Cohen's d = ${results.effectSize.toFixed(3)}) indicates a ${effectMagnitude} effect.`;
            interpretation.recommendations = [
                'Verify normality assumptions for continuous outcomes',
                'Consider using non-parametric tests if data is skewed',
                'Ensure consistent measurement procedures across sites',
                'Plan for missing data handling strategies'
            ];
            interpretation.assumptions = [
                'Continuous outcome follows normal distribution',
                'Independent observations',
                'Equal variances between groups',
                'Linear relationship between predictors and outcome'
            ];
        } else if ('treatmentSize' in results) { // Non-inferiority
            title = 'Non-Inferiority Trial Results';
            resultItems = [
                { label: 'Total Sample Size', value: results.totalSize, category: 'primary', highlight: true, format: 'integer' },
                { label: 'Treatment Group Size', value: results.treatmentSize, category: 'secondary', format: 'integer' },
                { label: 'Control Group Size', value: results.controlSize, category: 'secondary', format: 'integer' },
                { label: 'Statistical Power', value: '80%', category: 'statistical' },
                { label: 'Significance Level', value: 'α = 0.05', category: 'statistical' }
            ];
            interpretation.effectSize = `This non-inferiority trial requires ${results.totalSize} participants total to demonstrate that the new treatment is not worse than the control by more than the specified margin.`;
            interpretation.recommendations = [
                'Ensure non-inferiority margin is clinically justified',
                'Use intention-to-treat analysis as primary approach',
                'Consider per-protocol analysis as sensitivity analysis',
                'Pre-specify handling of missing data'
            ];
            interpretation.assumptions = [
                'Non-inferiority margin is clinically meaningful',
                'Control treatment effect is consistent with historical data',
                'Missing data is missing at random',
                'No selection bias in study population'
            ];
        } else if ('testSize' in results) { // Equivalence
            title = 'Equivalence Trial Results';
            resultItems = [
                { label: 'Total Sample Size', value: results.totalSize, category: 'primary', highlight: true, format: 'integer' },
                { label: 'Test Group Size', value: results.testSize, category: 'secondary', format: 'integer' },
                { label: 'Reference Group Size', value: results.referenceSize, category: 'secondary', format: 'integer' },
                { label: 'Statistical Power', value: '80%', category: 'statistical' },
                { label: 'Significance Level', value: 'α = 0.05', category: 'statistical' }
            ];
            interpretation.effectSize = `This equivalence trial requires ${results.totalSize} participants total to demonstrate that the treatments are equivalent within the specified margin.`;
            interpretation.recommendations = [
                'Ensure equivalence margin is clinically meaningful',
                'Use both intention-to-treat and per-protocol analyses',
                'Consider crossover design if appropriate',
                'Plan for bioequivalence testing if applicable'
            ];
            interpretation.assumptions = [
                'Equivalence margin is symmetric around zero',
                'Both treatments have similar safety profiles',
                'No carry-over effects in crossover designs',
                'Consistent treatment administration'
            ];
        }

        return (
            <ResultsDisplay
                title={title}
                results={resultItems}
                interpretation={interpretation}
                showInterpretation={true}
            />
        );
    }

    const renderInputForm = () => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* PDF Upload - Move to top with proper drop zone */}
                <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>📄</span> Import from PDF (Optional)
                        </CardTitle>
                        <CardDescription>Upload a research paper to auto-extract trial parameters</CardDescription>
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

                {/* Main Trial Type Tabs - Enhanced Visual Distinction */}
                <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardHeader>
                        <CardTitle>Select Trial Type</CardTitle>
                        <CardDescription>Choose the appropriate clinical trial design for your study</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
                                <TabsTrigger value="superiority" className="text-sm font-medium">
                                    🏆 Superiority
                                </TabsTrigger>
                                <TabsTrigger value="non-inferiority" className="text-sm font-medium">
                                    ⚖️ Non-Inferiority
                                </TabsTrigger>
                                <TabsTrigger value="equivalence" className="text-sm font-medium">
                                    🎯 Equivalence
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="superiority" className="space-y-4">
                                {/* Outcome Type Selection - Secondary Tab */}
                                <Card className="bg-white/50 dark:bg-gray-800/50">
                                    <CardContent className="pt-6">
                                        <FormField name="superiorityOutcome" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Outcome Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        className="flex justify-center gap-6 mt-4"
                                                    >
                                                        <div className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                            field.value === 'binary' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/50'
                                                        }`}>
                                                            <RadioGroupItem value="binary" id="binary" />
                                                            <Label htmlFor="binary" className="cursor-pointer font-medium">
                                                                📊 Binary Outcome
                                                            </Label>
                                                        </div>
                                                        <div className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                            field.value === 'continuous' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/50'
                                                        }`}>
                                                            <RadioGroupItem value="continuous" id="continuous" />
                                                            <Label htmlFor="continuous" className="cursor-pointer font-medium">
                                                                📈 Continuous Outcome
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>

                                {/* Conditional Parameter Cards */}
                                {superiorityOutcome === 'binary' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Binary Outcome Parameters</CardTitle>
                                            <CardDescription>Event rates for treatment and control groups</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField name="controlRate" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Control Group Rate (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                max="100"
                                                                {...field}
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField name="treatmentRate" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Treatment Group Rate (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                max="100"
                                                                {...field}
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {superiorityOutcome === 'continuous' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Continuous Outcome Parameters</CardTitle>
                                            <CardDescription>Mean difference and variability parameters</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField name="meanDifference" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Expected Mean Difference</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                {...field}
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField name="stdDev" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Standard Deviation</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                {...field}
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="non-inferiority" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Non-Inferiority Parameters</CardTitle>
                                        <CardDescription>Testing that new treatment is not worse than control by more than margin</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField name="controlRate" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Control Group Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="100"
                                                            {...field}
                                                            className="w-full"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField name="treatmentRate" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Treatment Group Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="100"
                                                            {...field}
                                                            className="w-full"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div>
                                            <FormField name="margin" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Non-Inferiority Margin (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            {...field}
                                                            className="w-full"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="equivalence" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Equivalence Parameters</CardTitle>
                                        <CardDescription>Testing that treatments are equivalent within specified margin</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField name="referenceRate" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reference Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="100"
                                                            {...field}
                                                            className="w-full"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField name="testRate" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Test Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="100"
                                                            {...field}
                                                            className="w-full"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div>
                                            <FormField name="margin" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Equivalence Margin (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            {...field}
                                                            className="w-full"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Study Parameters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Study Parameters</CardTitle>
                        <CardDescription>Statistical power and design parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Statistical Parameters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="alpha" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Significance Level (%)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select significance level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">1%</SelectItem>
                                            <SelectItem value="5">5%</SelectItem>
                                            <SelectItem value="10">10%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="power" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Power (%)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select power" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="80">80%</SelectItem>
                                            <SelectItem value="85">85%</SelectItem>
                                            <SelectItem value="90">90%</SelectItem>
                                            <SelectItem value="95">95%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* Design Parameters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="allocationRatio" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Allocation Ratio</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            {...field}
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="dropoutRate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dropout Rate (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="50"
                                            {...field}
                                            className="w-full"
                                        />
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
            title="Clinical Trials Sample Size"
            description="Calculate sample sizes for superiority, non-inferiority, and equivalence trials with comprehensive statistical support"
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
