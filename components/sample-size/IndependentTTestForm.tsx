"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { NumberFlowDisplay } from "@/components/ui/number-flow";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldPopover } from "@/components/ui/field-popover";
import { getFieldExplanation } from "@/lib/field-explanations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import {
    calculateIndependentSampleSize,
    IndependentSampleSizeSchema,
    type IndependentSampleSizeInput,
    type IndependentSampleSizeOutput
} from "@/lib/math/sample-size/tTest";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Target, Calculator, Users, TrendingUp } from "lucide-react";

const formatNumber = (value: number, format?: 'integer' | 'decimal' | 'percentage') => {
  if (format === 'integer') {
    return Math.round(value).toLocaleString();
  }
  if (format === 'percentage') {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
};

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
      const { extractTextFromPDF, extractParameters } = await import("@/lib/pdf-utils");
      const textContent = await extractTextFromPDF(e.target?.result as ArrayBuffer);

      const patterns = {
        group1Mean: [/group 1 mean[^0-9]*([0-9.]+)/i],
        group2Mean: [/group 2 mean[^0-9]*([0-9.]+)/i],
        pooledSD: [/pooled standard deviation[^0-9]*([0-9.]+)/i],
      };

      const values = extractParameters(textContent, patterns);
      if (values.group1Mean) form.setValue("group1Mean", values.group1Mean);
      if (values.group2Mean) form.setValue("group2Mean", values.group2Mean);
      if (values.pooledSD) form.setValue("pooledSD", values.pooledSD);
    };
    reader.readAsArrayBuffer(file);
  }

  async function generatePdf(values: IndependentSampleSizeInput, result: IndependentSampleSizeOutput) {
    const { generateModernPDF } = await import("@/lib/pdf-utils");

    const config = {
      title: "Independent T-Test Sample Size Analysis",
      subtitle: "Two-Sample Independent Groups Design",
      calculatorType: "Independent T-Test",
      inputs: [
        { label: "Group 1 Mean", value: values.group1Mean },
        { label: "Group 2 Mean", value: values.group2Mean },
        { label: "Pooled Standard Deviation", value: values.pooledSD },
        { label: "Allocation Ratio (Group 2/Group 1)", value: values.allocationRatio },
        { label: "Significance Level", value: values.significanceLevel, unit: "%" },
        { label: "Statistical Power", value: values.power, unit: "%" },
        { label: "Expected Dropout Rate", value: values.dropoutRate, unit: "%" }
      ],
      results: [
        {
          label: "Total Required Sample Size",
          value: result.totalSize,
          highlight: true,
          category: "primary" as const,
          format: "integer" as const
        },
        {
          label: "Effect Size (Cohen's d)",
          value: result.cohensD,
          highlight: true,
          category: "primary" as const,
          format: "decimal" as const,
          precision: 3
        },
        {
          label: "Group 1 Sample Size",
          value: result.group1Size,
          category: "secondary" as const,
          format: "integer" as const
        },
        {
          label: "Group 2 Sample Size",
          value: result.group2Size,
          category: "secondary" as const,
          format: "integer" as const
        },
        {
          label: "Effect Size Interpretation",
          value: result.effectSizeInterpretation,
          category: "secondary" as const
        }
      ],
      interpretation: {
        summary: `This analysis determines the required sample size for comparing means between two independent groups. The calculated effect size (Cohen's d = ${result.cohensD.toFixed(3)}) indicates a ${result.effectSizeInterpretation.toLowerCase()} effect. With ${values.power}% power and α = ${values.significanceLevel/100}, you need ${result.totalSize} total participants (${result.group1Size} in Group 1, ${result.group2Size} in Group 2).`,
        recommendations: [
          "Ensure random allocation to groups to minimize selection bias",
          "Consider stratified randomization if important prognostic factors exist",
          "Plan for the specified dropout rate in your recruitment strategy",
          "Verify assumptions of normality and equal variances between groups",
          "Consider using intention-to-treat analysis as the primary approach"
        ],
        assumptions: [
          "Continuous outcome variable with normal distribution",
          "Independent observations within and between groups",
          "Equal variances between the two groups (homoscedasticity)",
          "No systematic differences between groups except the intervention",
          "Dropout is random and not related to the outcome"
        ]
      }
    };

    await generateModernPDF(config);
  }

  return (
    <Card>
      {/* PDF Upload - Modern drop zone */}
      <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📄</span> Import from PDF (Optional)
          </CardTitle>
          <CardDescription>Upload a research paper to auto-extract t-test parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('pdf-upload-ttest')?.click()}
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
              id="pdf-upload-ttest"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      <CardHeader>
        <CardTitle>Independent T-Test</CardTitle>
        <CardDescription>
          Calculate sample size for comparing means between two independent groups
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
                  <FieldPopover
                    {...getFieldExplanation('tTest', 'group1Mean')}
                    side="top"
                  >
                    <FormLabel>Group 1 Mean</FormLabel>
                  </FieldPopover>
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
                  <FieldPopover
                    {...getFieldExplanation('tTest', 'group2Mean')}
                    side="top"
                  >
                    <FormLabel>Group 2 Mean</FormLabel>
                  </FieldPopover>
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
                  <FieldPopover
                    {...getFieldExplanation('tTest', 'pooledSD')}
                    side="top"
                  >
                    <FormLabel>Pooled Standard Deviation</FormLabel>
                  </FieldPopover>
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
                  <FieldPopover
                    {...getFieldExplanation('tTest', 'allocationRatio')}
                    side="top"
                  >
                    <FormLabel>Allocation Ratio (Group 2 / Group 1)</FormLabel>
                  </FieldPopover>
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
                  <FieldPopover
                    {...getFieldExplanation('sampleSize', 'significanceLevel')}
                    side="top"
                  >
                    <FormLabel>Significance Level (%)</FormLabel>
                  </FieldPopover>
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
                  <FieldPopover
                    {...getFieldExplanation('sampleSize', 'power')}
                    side="top"
                  >
                    <FormLabel>Power (%)</FormLabel>
                  </FieldPopover>
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
                  <FieldPopover
                    {...getFieldExplanation('sampleSize', 'dropoutRate')}
                    side="top"
                  >
                    <FormLabel>Dropout Rate (%)</FormLabel>
                  </FieldPopover>
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
                <p>Required sample size for Group 1: <strong>
                  {formatNumber(result.group1Size, 'integer')}
                </strong></p>
                <p>Required sample size for Group 2: <strong>
                  {formatNumber(result.group2Size, 'integer')}
                </strong></p>
                <p>Total required sample size: <strong>
                  {formatNumber(result.totalSize, 'integer')}
                </strong></p>
                <p>Effect size (Cohen's d): <strong>
                  {formatNumber(result.cohensD, 'decimal')}
                </strong> ({result.effectSizeInterpretation})</p>
                <Button onClick={() => generatePdf(form.getValues(), result)} className="mt-4">Download PDF</Button>
            </CardContent>
           </Card>
        )}
      </CardContent>
    </Card>
  );
}
