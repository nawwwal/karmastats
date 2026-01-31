'use client';
import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useFormedible } from '@/hooks/use-formedible';
import type { FieldConfig } from '@/lib/formedible/types';
import { computeComparative } from '@/lib/tools/comparativeStudy/manager';
import type { ComputeResult, RawValues } from '@/lib/tools/comparativeStudy/types';

const caseControlSchema = z.object({
  alpha: z.number().min(1, 'Alpha level is required'),
  power: z.number().min(1, 'Power is required'),
  ratio: z
    .number()
    .min(0.1, 'Ratio must be at least 0.1')
    .max(10, 'Ratio must be at most 10'),
  p0: z
    .number()
    .min(0.001, 'Control exposure rate must be at least 0.1%')
    .max(0.999, 'Control exposure rate must be less than 99.9%'),
  p1: z
    .number()
    .min(0.001, 'Case exposure rate must be at least 0.1%')
    .max(0.999, 'Case exposure rate must be less than 99.9%'),
});

const cohortSchema = z.object({
  alpha: z.number().min(1, 'Alpha level is required'),
  power: z.number().min(1, 'Power is required'),
  ratio: z
    .number()
    .min(0.1, 'Ratio must be at least 0.1')
    .max(10, 'Ratio must be at most 10'),
  p1: z
    .number()
    .min(0.001, 'Disease rate in exposed must be at least 0.1%')
    .max(0.999, 'Disease rate in exposed must be less than 99.9%'),
  p2: z
    .number()
    .min(0.001, 'Disease rate in unexposed must be at least 0.1%')
    .max(0.999, 'Disease rate in unexposed must be less than 99.9%'),
});

interface ComparativeFormFormedibleProps {
  onResults: (results: ComputeResult<any>) => void;
  onError: (message: string | null) => void;
}

export default function ComparativeFormFormedible({
  onResults,
  onError,
}: ComparativeFormFormedibleProps) {
  const coerceValues = (raw: Record<string, unknown>) => {
    const coerced: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === 'string') {
        const trimmed = v.trim();
        if (
          trimmed === '' ||
          trimmed === '-' ||
          trimmed === '.' ||
          trimmed === '-.'
        ) {
          coerced[k] = undefined;
          continue;
        }
        const num = Number(trimmed);
        coerced[k] = Number.isFinite(num) ? num : v;
      } else {
        coerced[k] = v;
      }
    }
    return coerced;
  };

  const [tab, setTab] = React.useState<'case-control' | 'cohort'>('case-control');

  const fields: FieldConfig[] = [
    {
      name: 'p0',
      type: 'number',
      label: 'Exposure Rate in Controls (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
      tab: 'case-control',
    },
    {
      name: 'p1',
      type: 'number',
      label: 'Exposure Rate in Cases (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
      tab: 'case-control',
    },
    {
      name: 'p1',
      type: 'number',
      label: 'Disease Rate in Exposed (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
      tab: 'cohort',
    },
    {
      name: 'p2',
      type: 'number',
      label: 'Disease Rate in Unexposed (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
      tab: 'cohort',
    },
    {
      name: 'alpha',
      type: 'number',
      label: 'Alpha Level (%)',
      min: 1,
      max: 20,
      step: 0.1,
      validation: z.number().min(1),
    },
    {
      name: 'power',
      type: 'number',
      label: 'Power (%)',
      min: 1,
      max: 99,
      step: 1,
      validation: z.number().min(1),
    },
    {
      name: 'ratio',
      type: 'number',
      label: 'Ratio',
      min: 0.1,
      max: 10,
      step: 0.1,
      validation: z.number().min(0.1).max(10),
    },
  ];

  const { Form } = useFormedible({
    fields,
    tabs: [
      { id: 'case-control', label: 'Case-Control' },
      { id: 'cohort', label: 'Cohort Study' },
    ],
    formOptions: {
      defaultValues: {
        alpha: 5,
        power: 80,
        ratio: 1,
        p0: 20,
        p1: 40,
        p2: 10,
      },
      onChange: async ({ value }) => {
        const computed = await computeComparative(tab, value as RawValues);
        onResults(computed);
      },
    },
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    showSubmitButton: false,
    autoSubmitOnChange: true,
    autoSubmitDebounceMs: 400,
    persistence: {
      key: 'comparative-study-form',
      storage: 'localStorage',
      debounceMs: 800,
      restoreOnMount: true,
    },
    analytics: {
      onTabChange: (_from, to) => setTab(to as 'case-control' | 'cohort'),
    },
  });

  return <Form />;
}
