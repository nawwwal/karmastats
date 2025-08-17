'use client';

import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useFormedible } from '@/hooks/use-formedible';
import type { FieldConfig } from '@/lib/formedible/types';
import { computeTTest } from '@/lib/tools/tTest/manager';
import type { TTestTab } from '@/lib/tools/tTest/types';
import type {
  IndependentSampleSizeOutput,
  PairedSampleSizeOutput,
  OneSampleSampleSizeOutput,
} from '@/lib/math/sample-size/tTest';

type Results =
  | IndependentSampleSizeOutput
  | PairedSampleSizeOutput
  | OneSampleSampleSizeOutput;

export default function TTestFormFormedible(props: {
  activeTab: TTestTab;
  onResults: (
    results: Results,
    values: Record<string, unknown>,
    tab: TTestTab
  ) => void;
  onError?: (message: string | null) => void;
}) {
  const { activeTab, onResults, onError } = props;

  const independentFields: FieldConfig[] = [
    { name: 'group1Mean', type: 'number', label: 'Group 1 Mean', step: 0.01, numberConfig: { step: 0.01 }, validation: z.number(), group: 'Inputs' },
    { name: 'group2Mean', type: 'number', label: 'Group 2 Mean', step: 0.01, numberConfig: { step: 0.01 }, validation: z.number(), group: 'Inputs' },
    { name: 'pooledSD', type: 'number', label: 'Pooled Standard Deviation', step: 0.01, numberConfig: { step: 0.01 }, validation: z.number().positive('Pooled standard deviation must be positive'), group: 'Inputs' },
    { name: 'allocationRatio', type: 'number', label: 'Allocation Ratio (Group 2 / Group 1)', step: 0.1, numberConfig: { step: 0.1 }, validation: z.number().positive('Allocation ratio must be positive'), group: 'Inputs' },
  ];

  const pairedFields: FieldConfig[] = [
    { name: 'meanDifference', type: 'number', label: 'Expected Mean Difference', step: 0.01, numberConfig: { step: 0.01 }, validation: z.number(), group: 'Inputs' },
    { name: 'sdDifference', type: 'number', label: 'Standard Deviation of Differences', step: 0.01, numberConfig: { step: 0.01 }, validation: z.number().positive('Standard deviation of differences must be positive'), group: 'Inputs' },
    { name: 'correlation', type: 'number', label: 'Correlation between Pairs', step: 0.01, numberConfig: { min: -1, max: 1, step: 0.01 }, validation: z.number().min(-1).max(1), group: 'Inputs' },
  ];

  const oneSampleFields: FieldConfig[] = [
    { name: 'sampleMean', type: 'number', label: 'Expected Sample Mean', step: 0.01, numberConfig: { step: 0.01 }, validation: z.number(), group: 'Inputs' },
    { name: 'populationMean', type: 'number', label: 'Population Mean (H₀)', step: 0.01, numberConfig: { step: 0.01 }, validation: z.number(), group: 'Inputs' },
    { name: 'populationSD', type: 'number', label: 'Population Standard Deviation', step: 0.01, numberConfig: { step: 0.01 }, validation: z.number().positive('Population standard deviation must be positive'), group: 'Inputs' },
  ];

  const sharedFields: FieldConfig[] = [
    { name: 'significanceLevel', type: 'number', label: 'Significance Level (%)', description: 'Type I error rate (typically 5%)', min: 0, max: 100, step: 0.1, numberConfig: { min: 0, max: 100, step: 0.1 }, validation: z.number().min(0).max(100), group: 'Parameters' },
    { name: 'power', type: 'number', label: 'Statistical Power (%)', description: 'Probability of detecting a true effect (80–90% recommended)', min: 0, max: 100, step: 0.1, numberConfig: { min: 0, max: 100, step: 0.1 }, validation: z.number().min(0).max(100), group: 'Parameters' },
    { name: 'dropoutRate', type: 'number', label: 'Expected Dropout (%)', description: 'Anticipated percent of participants lost to follow-up', min: 0, max: 100, step: 0.1, numberConfig: { min: 0, max: 100, step: 0.1 }, validation: z.number().min(0).max(100), group: 'Parameters' },
  ];

  const getFieldsForTab = (tab: TTestTab): FieldConfig[] => {
    switch (tab) {
      case 'independent':
        return [...independentFields, ...sharedFields];
      case 'paired':
        return [...pairedFields, ...sharedFields];
      case 'one-sample':
        return [...oneSampleFields, ...sharedFields];
    }
  };

  const { Form } = useFormedible({
    fields: getFieldsForTab(activeTab),
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    formOptions: {
      defaultValues: {
        // Independent defaults
        group1Mean: 100,
        group2Mean: 105,
        pooledSD: 15,
        allocationRatio: 1,
        // Paired
        meanDifference: 5,
        sdDifference: 12,
        correlation: 0.6,
        // One-sample
        sampleMean: 105,
        populationMean: 100,
        populationSD: 15,
        // Shared
        significanceLevel: 5,
        power: 80,
        dropoutRate: 10,
      } as any,
      onChange: async ({ value }) => {
        const computed = await computeTTest(activeTab, value as Record<string, unknown>);
        if (computed.ok) {
          onError?.(null);
          onResults(computed.result as Results, computed.values, activeTab);
        }
      },
      onSubmit: async ({ value }) => {
        try {
          const computed = await computeTTest(activeTab, value as Record<string, unknown>);
          if (computed.ok) {
            onError?.(null);
            onResults(computed.result as Results, computed.values, activeTab);
          } else {
            throw new Error(computed.message);
          }
        } catch (err) {
          if (err instanceof z.ZodError) {
            onError?.(err.issues.map((i) => i.message).join(', '));
          } else {
            onError?.((err as Error).message);
          }
        }
      },
      canSubmitWhenInvalid: false,
    },
    showSubmitButton: false,
    autoSubmitOnChange: true,
    autoSubmitDebounceMs: 400,
  });

  return <Form />;
}


