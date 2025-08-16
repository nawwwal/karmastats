'use client';

import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedTabs, EnhancedTabsContent, EnhancedTabsList, EnhancedTabsTrigger } from '@/components/ui/enhanced-tabs';
import { useFormedible } from '@/hooks/use-formedible';
import type { FieldConfig } from '@/lib/formedible/types';
import {
  calculateIndependentSampleSize,
  calculatePairedSampleSize,
  calculateOneSampleSampleSize,
  IndependentSampleSizeSchema,
  PairedSampleSizeSchema,
  OneSampleSampleSizeSchema,
  type IndependentSampleSizeOutput,
  type PairedSampleSizeOutput,
  type OneSampleSampleSizeOutput,
} from '@/lib/math/sample-size/tTest';

type Results = IndependentSampleSizeOutput | PairedSampleSizeOutput | OneSampleSampleSizeOutput;

export default function TTestFormFormedible(props: {
  activeTab: 'independent' | 'paired' | 'one-sample';
  onActiveTabChange: (tab: 'independent' | 'paired' | 'one-sample') => void;
  onResults: (results: Results, values: Record<string, unknown>, tab: 'independent' | 'paired' | 'one-sample') => void;
  onError?: (message: string | null) => void;
}) {
  const { activeTab, onActiveTabChange, onResults, onError } = props;

  const commonStatFields = (group?: string): FieldConfig[] => [
    {
      name: 'significanceLevel',
      type: 'number',
      label: 'Significance Level (%)',
      description: 'Type I error rate (typically 5%)',
      min: 0,
      max: 100,
      step: 0.1,
      numberConfig: { min: 0, max: 100, step: 0.1 },
      validation: z.number().min(0).max(100),
      group,
    },
    {
      name: 'power',
      type: 'number',
      label: 'Statistical Power (%)',
      description: 'Probability of detecting a true effect (80–90% recommended)',
      min: 0,
      max: 100,
      step: 0.1,
      numberConfig: { min: 0, max: 100, step: 0.1 },
      validation: z.number().min(0).max(100),
      group,
    },
    {
      name: 'dropoutRate',
      type: 'number',
      label: 'Expected Dropout (%)',
      description: 'Anticipated percent of participants lost to follow-up',
      min: 0,
      max: 100,
      step: 0.1,
      numberConfig: { min: 0, max: 100, step: 0.1 },
      validation: z.number().min(0).max(100),
      group,
    },
  ];

  const independentForm = useFormedible<z.infer<typeof IndependentSampleSizeSchema>>({
    fields: [
      {
        name: 'group1Mean',
        type: 'number',
        label: 'Group 1 Mean',
        step: 0.01,
        numberConfig: { step: 0.01 },
        validation: z.number(),
        group: 'Inputs',
      },
      {
        name: 'group2Mean',
        type: 'number',
        label: 'Group 2 Mean',
        step: 0.01,
        numberConfig: { step: 0.01 },
        validation: z.number(),
        group: 'Inputs',
      },
      {
        name: 'pooledSD',
        type: 'number',
        label: 'Pooled Standard Deviation',
        step: 0.01,
        numberConfig: { step: 0.01 },
        validation: z.number().positive('Pooled standard deviation must be positive'),
        group: 'Inputs',
      },
      {
        name: 'allocationRatio',
        type: 'number',
        label: 'Allocation Ratio (Group 2 / Group 1)',
        step: 0.1,
        numberConfig: { step: 0.1 },
        validation: z.number().positive('Allocation ratio must be positive'),
        group: 'Inputs',
      },
      ...commonStatFields('Parameters'),
    ],
    formOptions: {
      defaultValues: {
        group1Mean: 100,
        group2Mean: 105,
        pooledSD: 15,
        allocationRatio: 1,
        significanceLevel: 5,
        power: 80,
        dropoutRate: 10,
      } as any,
      onSubmit: ({ value }) => {
        try {
          const validated = IndependentSampleSizeSchema.parse(value);
          const result = calculateIndependentSampleSize(validated);
          onError?.(null);
          onResults(result, value as Record<string, unknown>, 'independent');
        } catch (err: unknown) {
          if (err instanceof z.ZodError) {
            onError?.(err.issues.map((issue) => issue.message).join(', '));
          } else {
            onError?.((err as Error).message);
          }
        }
      },
      asyncDebounceMs: 0,
      canSubmitWhenInvalid: false,
    },
    submitLabel: 'Calculate Sample Size',
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    showSubmitButton: true,
    submitButton: Button,
  });

  const pairedForm = useFormedible<z.infer<typeof PairedSampleSizeSchema>>({
    fields: [
      {
        name: 'meanDifference',
        type: 'number',
        label: 'Expected Mean Difference',
        step: 0.01,
        numberConfig: { step: 0.01 },
        validation: z.number(),
        group: 'Inputs',
      },
      {
        name: 'sdDifference',
        type: 'number',
        label: 'Standard Deviation of Differences',
        step: 0.01,
        numberConfig: { step: 0.01 },
        validation: z.number().positive('Standard deviation of differences must be positive'),
        group: 'Inputs',
      },
      {
        name: 'correlation',
        type: 'number',
        label: 'Correlation between Pairs',
        step: 0.01,
        numberConfig: { min: -1, max: 1, step: 0.01 },
        validation: z.number().min(-1).max(1),
        group: 'Inputs',
      },
      ...commonStatFields('Parameters'),
    ],
    formOptions: {
      defaultValues: {
        meanDifference: 5,
        sdDifference: 12,
        correlation: 0.6,
        significanceLevel: 5,
        power: 80,
        dropoutRate: 10,
      } as any,
      onSubmit: ({ value }) => {
        try {
          const validated = PairedSampleSizeSchema.parse(value);
          const result = calculatePairedSampleSize(validated);
          onError?.(null);
          onResults(result, value as Record<string, unknown>, 'paired');
        } catch (err: unknown) {
          if (err instanceof z.ZodError) {
            onError?.(err.issues.map((issue) => issue.message).join(', '));
          } else {
            onError?.((err as Error).message);
          }
        }
      },
      asyncDebounceMs: 0,
      canSubmitWhenInvalid: false,
    },
    submitLabel: 'Calculate Sample Size',
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    showSubmitButton: true,
    submitButton: Button,
  });

  const oneSampleForm = useFormedible<z.infer<typeof OneSampleSampleSizeSchema>>({
    fields: [
      {
        name: 'sampleMean',
        type: 'number',
        label: 'Expected Sample Mean',
        step: 0.01,
        numberConfig: { step: 0.01 },
        validation: z.number(),
        group: 'Inputs',
      },
      {
        name: 'populationMean',
        type: 'number',
        label: 'Population Mean (H₀)',
        step: 0.01,
        numberConfig: { step: 0.01 },
        validation: z.number(),
        group: 'Inputs',
      },
      {
        name: 'populationSD',
        type: 'number',
        label: 'Population Standard Deviation',
        step: 0.01,
        numberConfig: { step: 0.01 },
        validation: z.number().positive('Population standard deviation must be positive'),
        group: 'Inputs',
      },
      ...commonStatFields('Parameters'),
    ],
    formOptions: {
      defaultValues: {
        sampleMean: 105,
        populationMean: 100,
        populationSD: 15,
        significanceLevel: 5,
        power: 80,
        dropoutRate: 10,
      } as any,
      onSubmit: ({ value }) => {
        try {
          const validated = OneSampleSampleSizeSchema.parse(value);
          const result = calculateOneSampleSampleSize(validated);
          onError?.(null);
          onResults(result, value as Record<string, unknown>, 'one-sample');
        } catch (err: unknown) {
          if (err instanceof z.ZodError) {
            onError?.(err.issues.map((issue) => issue.message).join(', '));
          } else {
            onError?.((err as Error).message);
          }
        }
      },
      asyncDebounceMs: 0,
      canSubmitWhenInvalid: false,
    },
    submitLabel: 'Calculate Sample Size',
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    showSubmitButton: true,
    submitButton: Button,
  });

  return (
    <EnhancedTabs value={activeTab} onValueChange={(v) => onActiveTabChange(v as any)} className="space-y-6">
      <EnhancedTabsList className="grid w-full grid-cols-3" variant="modern">
        <EnhancedTabsTrigger value="independent" variant="modern">Independent</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="paired" variant="modern">Paired</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="one-sample" variant="modern">One-Sample</EnhancedTabsTrigger>
      </EnhancedTabsList>

      <EnhancedTabsContent value="independent">
        <Card className="border-primary/20 bg-primary/10 dark:bg-primary/20 dark:border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Independent Samples T-Test</CardTitle>
            <CardDescription>Compare means of two independent groups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <independentForm.Form />
          </CardContent>
        </Card>
      </EnhancedTabsContent>

      <EnhancedTabsContent value="paired">
        <Card className="border-success/20 bg-success/10 dark:bg-success/20 dark:border-success/30">
          <CardHeader>
            <CardTitle className="text-lg">Paired Samples T-Test</CardTitle>
            <CardDescription>Compare paired observations (before/after, matched pairs)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <pairedForm.Form />
          </CardContent>
        </Card>
      </EnhancedTabsContent>

      <EnhancedTabsContent value="one-sample">
        <Card className="border-secondary/20 bg-secondary/10 dark:bg-secondary/20 dark:border-secondary/30">
          <CardHeader>
            <CardTitle className="text-lg">One-Sample T-Test</CardTitle>
            <CardDescription>Compare sample mean to a known population value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <oneSampleForm.Form />
          </CardContent>
        </Card>
      </EnhancedTabsContent>
    </EnhancedTabs>
  );
}


