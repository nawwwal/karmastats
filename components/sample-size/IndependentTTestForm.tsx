"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import * as pdfjs from "pdfjs-dist";
import {
    calculateIndependentSampleSize,
    IndependentSampleSizeSchema,
    type IndependentSampleSizeInput,
    type IndependentSampleSizeOutput
} from "@/lib/math/sample-size/tTest";

export function IndependentTTestForm() {
  const [result, setResult] = useState<IndependentSampleSizeOutput | null>(null);

  const form = useForm<IndependentSampleSizeInput>({
    resolver: zodResolver(IndependentSampleSizeSchema),
    defaultValues: {
      group1Mean: 10,
      group2Mean: 12,
      pooledSD: 3,
      allocationRatio: 1,
      significanceLevel: 5,
      power: 80,
      dropoutRate: 10,
    },
  });

  function onSubmit(values: IndependentSampleSizeInput) {
    const sampleSize = calculateIndependentSampleSize(values);
    setResult(sampleSize);
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
      const pdf = await pdfjs.getDocument(typedArray).promise;
      let textContent = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((s: any) => s.str).join(' ');
      }

      // Very basic regex for demonstration.
      // A more robust solution would be needed for production.
      const group1MeanMatch = textContent.match(/group 1 mean[^0-9]*([0-9.]+)/i);
      const group2MeanMatch = textContent.match(/group 2 mean[^0-9]*([0-9.]+)/i);
      const pooledSDMatch = textContent.match(/pooled standard deviation[^0-9]*([0-9.]+)/i);

      if (group1MeanMatch) form.setValue("group1Mean", parseFloat(group1MeanMatch[1]));
      if (group2MeanMatch) form.setValue("group2Mean", parseFloat(group2MeanMatch[1]));
      if (pooledSDMatch) form.setValue("pooledSD", parseFloat(pooledSDMatch[1]));
    };
    reader.readAsArrayBuffer(file);
  }

  function generatePdf(values: IndependentSampleSizeInput, result: IndependentSampleSizeOutput) {
    const doc = new jsPDF();

    doc.text("Karmastat - Independent T-Test Results", 20, 20);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    doc.text("Parameters:", 20, 40);
    doc.text(`Group 1 Mean: ${values.group1Mean}`, 30, 50);
    doc.text(`Group 2 Mean: ${values.group2Mean}`, 30, 60);
    doc.text(`Pooled SD: ${values.pooledSD}`, 30, 70);
    doc.text(`Allocation Ratio: ${values.allocationRatio}`, 30, 80);
    doc.text(`Significance Level: ${values.significanceLevel}%`, 30, 90);
    doc.text(`Power: ${values.power}%`, 30, 100);
    doc.text(`Dropout Rate: ${values.dropoutRate}%`, 30, 110);

    doc.text("Results:", 20, 130);
    doc.text(`Group 1 Size: ${result.group1Size}`, 30, 140);
    doc.text(`Group 2 Size: ${result.group2Size}`, 30, 150);
    doc.text(`Total Size: ${result.totalSize}`, 30, 160);
    doc.text(`Cohen's d: ${result.cohensD.toFixed(3)} (${result.effectSizeInterpretation})`, 30, 170);

    doc.save("independent-t-test-results.pdf");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Independent T-Test</CardTitle>
        <CardDescription>
            <p>Upload a PDF to automatically fill fields.</p>
            <Input type="file" accept=".pdf" onChange={handleFileUpload} className="mt-2" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="group1Mean"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group 1 Mean</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group2Mean"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group 2 Mean</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pooledSD"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pooled Standard Deviation</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allocationRatio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocation Ratio (Group 2 / Group 1)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="significanceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Significance Level (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                  <FormLabel>Power (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dropoutRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dropout Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Calculate</Button>
          </form>
        </Form>
        {result && (
           <Card className="mt-4">
            <CardHeader>
                <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Required sample size for Group 1: <strong>{result.group1Size}</strong></p>
                <p>Required sample size for Group 2: <strong>{result.group2Size}</strong></p>
                <p>Total required sample size: <strong>{result.totalSize}</strong></p>
                <p>Effect size (Cohen's d): <strong>{result.cohensD.toFixed(3)}</strong> ({result.effectSizeInterpretation})</p>
                <Button onClick={() => generatePdf(form.getValues(), result)} className="mt-4">Download PDF</Button>
            </CardContent>
           </Card>
        )}
      </CardContent>
    </Card>
  );
}
