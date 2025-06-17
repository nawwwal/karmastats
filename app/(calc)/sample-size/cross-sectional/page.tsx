'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { jsPDF } from "jspdf";
import { extractTextFromPDF } from '@/lib/pdf-utils';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

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
                const textContent = await extractTextFromPDF(e.target?.result as ArrayBuffer);

                const extractValue = (regex: RegExp) => {
                    const match = textContent.match(regex);
                    return match ? parseFloat(match[1]) : undefined;
                };

                const prevalence = extractValue(/prevalence of ([\d\.]+)/i);
                const marginOfError = extractValue(/margin of error of ([\d\.]+)/i);
                const populationSize = extractValue(/population size of ([\d\.]+)/i);

                if (prevalence !== undefined) form.setValue('prevalence', prevalence);
                if (marginOfError !== undefined) form.setValue('marginOfError', marginOfError);
                if (populationSize !== undefined) form.setValue('populationSize', populationSize);

            } catch (err: any) {
                setError(`Failed to process PDF: ${err.message}`);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const generatePdf = () => {
        if (!results) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Karmastat Cross-Sectional Study Report`, 105, 20, { align: 'center' });
        doc.setFontSize(12);

        let y = 40;

        const resultData = [
            { label: 'Base Sample Size (Cochran\'s)', value: results.baseSize },
            { label: 'After Design Effect', value: results.designAdjustedSize },
            { label: 'After Finite Population Correction', value: results.populationAdjustedSize },
            { label: 'After Clustering Adjustment', value: results.clusterAdjustedSize },
            { label: 'Final Size (inc. Non-Response)', value: results.finalSize },
        ];

        doc.text('Calculation Steps', 20, y);
        y += 10;

        resultData.forEach(row => {
            doc.text(`${row.label}: ${row.value.toLocaleString()}`, 25, y);
            y += 7;
        });

        doc.save('karmastat-cross-sectional-report.pdf');
    }

    const renderResults = () => {
        if (!results) return null;

        const resultData = [
            { label: 'Base Sample Size (Cochran\'s)', value: results.baseSize },
            { label: 'After Design Effect', value: results.designAdjustedSize },
            { label: 'After Finite Population Correction', value: results.populationAdjustedSize },
            { label: 'After Clustering Adjustment', value: results.clusterAdjustedSize },
            { label: 'Final Size (inc. Non-Response)', value: results.finalSize },
        ];

        return (
            <Card>
                <CardHeader><CardTitle>Calculation Steps</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Step</TableHead><TableHead className="text-right">Sample Size</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {resultData.map(row => (
                                <TableRow key={row.label} className={row.label.startsWith('Final') ? 'font-bold' : ''}>
                                    <TableCell>{row.label}</TableCell>
                                    <TableCell className="text-right">{row.value.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...(form as any)}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="text-center">
                    <h1 className="heading-1">Cross-Sectional Study Calculator</h1>
                    <p className="text-muted-foreground mt-2">Estimate sample size for prevalence studies.</p>
                </div>

                <Card>
                    <CardHeader><CardTitle>Basic Parameters</CardTitle></CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                        <FormField name="prevalence" render={({ field }) => (<FormItem><FormLabel>Expected Prevalence (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                        <FormField name="marginOfError" render={({ field }) => (<FormItem><FormLabel>Margin of Error (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                        <FormField name="confidenceLevel" render={({ field }) => (<FormItem><FormLabel>Confidence Level</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="80">80%</SelectItem><SelectItem value="90">90%</SelectItem><SelectItem value="95">95%</SelectItem><SelectItem value="99">99%</SelectItem><SelectItem value="99.9">99.9%</SelectItem></SelectContent></Select></FormItem>)} />
                    </CardContent>
                </Card>

                <div className="flex items-center space-x-2">
                    <Switch id="advanced-switch" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                    <Label htmlFor="advanced-switch">Show Advanced Options</Label>
                </div>

                {showAdvanced && (
                    <Card>
                        <CardHeader><CardTitle>Advanced Parameters</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField name="populationSize" render={({ field }) => (<FormItem><FormLabel>Population Size (Optional)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                            <FormField name="designEffect" render={({ field }) => (<FormItem><FormLabel>Design Effect (DEFF)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                            <FormField name="nonResponseRate" render={({ field }) => (<FormItem><FormLabel>Non-Response Rate (%)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                            <FormField name="clusteringEffect" render={({ field }) => (<FormItem><FormLabel>Clustering Effect (ICC)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-center items-center gap-4">
                    <Button type="submit" className="w-48">Calculate</Button>
                    <div className="flex-col">
                        <Input id="pdf-upload-cross-sectional" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button type="button" variant="outline" className="w-48" onClick={() => document.getElementById('pdf-upload-cross-sectional')?.click()} >Extract from PDF</Button></TooltipTrigger>
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
