"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, NeuomorphicButton } from "@/components/ui/button";
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
// PDF-related features removed for MVP
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

  // PDF import removed

  // PDF export removed

  return (
    <Card>

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
            <NeuomorphicButton type="submit" size="xxl">Calculate</NeuomorphicButton>
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
              {/* PDF export removed */}
            </CardContent>
           </Card>
        )}
      </CardContent>
    </Card>
  );
}
