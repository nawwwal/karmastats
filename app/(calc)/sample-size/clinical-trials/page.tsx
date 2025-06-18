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

type Results = SuperiorityBinaryOutput | SuperiorityContinuousOutput | NonInferiorityOutput | EquivalenceOutput;

const FormSchema = z.object({
    superiorityOutcome: z.enum(['binary', 'continuous']).optional(),
    // Allow all fields to be optional for the combined form
    alpha: z.number().optional(),
    power: z.number().optional(),
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
            alpha: 5,
            power: 80,
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Dynamic import to prevent SSR issues
                const { extractTextFromPDF } = await import('@/lib/pdf-utils');
                const textContent = await extractTextFromPDF(e.target?.result as ArrayBuffer);

                const extractValue = (regex: RegExp) => {
                    const match = textContent.match(regex);
                    return match ? parseFloat(match[1]) : undefined;
                };

                if (activeTab === 'superiority') {
                    if (superiorityOutcome === 'binary') {
                        form.setValue('controlRate', extractValue(/control group rate of ([\d\.]+)/i));
                        form.setValue('treatmentRate', extractValue(/treatment group rate of ([\d\.]+)/i));
                    } else {
                        form.setValue('meanDifference', extractValue(/mean difference of ([\d\.]+)/i));
                        form.setValue('stdDev', extractValue(/standard deviation of ([\d\.]+)/i));
                    }
                } else if (activeTab === 'non-inferiority' || activeTab === 'equivalence') {
                    form.setValue('margin', extractValue(/margin of ([\d\.]+)/i));
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
        let resultData: { label: string, value: any }[] = [];
        let title = '';

        if ('nnt' in results) { // Superiority Binary
            title = 'Superiority Trial Results (Binary Outcome)';
            resultData = [
                { label: 'Treatment Group Size', value: results.treatmentSize },
                { label: 'Control Group Size', value: results.controlSize },
                { label: 'Total Sample Size', value: results.totalSize },
                { label: 'Number Needed to Treat (NNT)', value: results.nnt.toFixed(2) },
            ];
        } else if ('effectSize' in results) { // Superiority Continuous
             title = 'Superiority Trial Results (Continuous Outcome)';
             resultData = [
                { label: 'Treatment Group Size', value: results.treatmentSize },
                { label: 'Control Group Size', value: results.controlSize },
                { label: 'Total Sample Size', value: results.totalSize },
                { label: "Cohen's d (Effect Size)", value: results.effectSize.toFixed(4) },
            ];
        } else if ('treatmentSize' in results) { // Non-inferiority
             title = 'Non-Inferiority Trial Results';
             resultData = [
                { label: 'Treatment Group Size', value: results.treatmentSize },
                { label: 'Control Group Size', value: results.controlSize },
                { label: 'Total Sample Size', value: results.totalSize },
            ];
        } else if ('testSize' in results) { // Equivalence
             title = 'Equivalence Trial Results';
             resultData = [
                { label: 'Test Group Size', value: results.testSize },
                { label: 'Reference Group Size', value: results.referenceSize },
                { label: 'Total Sample Size', value: results.totalSize },
            ];
        }

        return (
            <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Metric</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                        <TableBody>{resultData.map(row => (<TableRow key={row.label}><TableCell>{row.label}</TableCell><TableCell className="text-right">{row.value}</TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }

    const CommonFields = () => (
        <Card>
            <CardHeader><CardTitle>Common Parameters</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <FormField name="alpha" render={({ field }) => (<FormItem><FormLabel>Significance Level (α)</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">1%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="10">10%</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField name="power" render={({ field }) => (<FormItem><FormLabel>Statistical Power (%)</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="80">80%</SelectItem><SelectItem value="85">85%</SelectItem><SelectItem value="90">90%</SelectItem><SelectItem value="95">95%</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField name="allocationRatio" render={({ field }) => (<FormItem><FormLabel>Allocation Ratio</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                <FormField name="dropoutRate" render={({ field }) => (<FormItem><FormLabel>Dropout Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
            </CardContent>
        </Card>
    );

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Clinical Trials Sample Size Calculator</h1>
                    <p className="text-muted-foreground mt-2">For superiority, non-inferiority, and equivalence trials.</p>
                </div>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="superiority">Superiority</TabsTrigger>
                        <TabsTrigger value="non-inferiority">Non-Inferiority</TabsTrigger>
                        <TabsTrigger value="equivalence">Equivalence</TabsTrigger>
                    </TabsList>

                    <TabsContent value="superiority" className="space-y-6">
                        <FormField name="superiorityOutcome" render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className="flex justify-center gap-4 p-2 bg-muted/50 rounded-lg">
                                <FormItem>
                                    <FormControl>
                                        <RadioGroupItem value="binary" id="binary" className="sr-only" />
                                    </FormControl>
                                    <FormLabel htmlFor="binary" className={`cursor-pointer p-2 rounded-md ${field.value === 'binary' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>Binary Outcome</FormLabel>
                                </FormItem>
                                <FormItem>
                                    <FormControl>
                                        <RadioGroupItem value="continuous" id="continuous" className="sr-only" />
                                    </FormControl>
                                    <FormLabel htmlFor="continuous" className={`cursor-pointer p-2 rounded-md ${field.value === 'continuous' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>Continuous Outcome</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        )} />

                        {superiorityOutcome === 'binary' && <Card><CardHeader><CardTitle>Binary Outcome</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
                            <FormField name="controlRate" render={({ field }) => (<FormItem><FormLabel>Control Group Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                            <FormField name="treatmentRate" render={({ field }) => (<FormItem><FormLabel>Treatment Group Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                        </CardContent></Card>}

                        {superiorityOutcome === 'continuous' && <Card><CardHeader><CardTitle>Continuous Outcome</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
                           <FormField name="meanDifference" render={({ field }) => (<FormItem><FormLabel>Mean Difference</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                           <FormField name="stdDev" render={({ field }) => (<FormItem><FormLabel>Standard Deviation</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                        </CardContent></Card>}
                        <CommonFields />
                    </TabsContent>

                    <TabsContent value="non-inferiority" className="space-y-6">
                        <Card><CardHeader><CardTitle>Non-Inferiority Parameters</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
                           <FormField name="controlRate" render={({ field }) => (<FormItem><FormLabel>Control Group Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                           <FormField name="treatmentRate" render={({ field }) => (<FormItem><FormLabel>Treatment Group Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                           <FormField name="margin" render={({ field }) => (<FormItem><FormLabel>Non-Inferiority Margin (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                        </CardContent></Card>
                        <CommonFields />
                    </TabsContent>

                    <TabsContent value="equivalence" className="space-y-6">
                        <Card><CardHeader><CardTitle>Equivalence Parameters</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
                           <FormField name="referenceRate" render={({ field }) => (<FormItem><FormLabel>Reference Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                           <FormField name="testRate" render={({ field }) => (<FormItem><FormLabel>Test Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                           <FormField name="margin" render={({ field }) => (<FormItem><FormLabel>Equivalence Margin (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                        </CardContent></Card>
                        <CommonFields />
                    </TabsContent>
                </Tabs>

                <div className="flex justify-center items-center gap-4">
                    <Button type="submit" className="w-48">Calculate</Button>
                     <div className="flex-col">
                        <Input id="pdf-upload-clinical" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button type="button" variant="outline" className="w-48" onClick={() => document.getElementById('pdf-upload-clinical')?.click()} >Extract from PDF</Button></TooltipTrigger>
                                <TooltipContent><p>Automatically extract parameters from a research paper.</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <TooltipProvider>
                        <Tooltip><TooltipTrigger asChild><Button type="button" variant="outline" className="w-48" onClick={generatePdf} disabled={!results}>Export to PDF</Button></TooltipTrigger><TooltipContent><p>Export results to a PDF file.</p></TooltipContent></Tooltip>
                    </TooltipProvider>
                </div>

                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                {results && <div className="mt-8">{renderResults()}</div>}
            </form>
        </Form>
    );
}
