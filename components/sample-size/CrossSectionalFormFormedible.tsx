'use client';
import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useFormedible } from '@/hooks/use-formedible';
import type { FieldConfig } from '@/lib/formedible/types';
import {
  CrossSectionalSchema,
  calculateCrossSectionalSampleSize,
  CrossSectionalOutput,
} from '@/lib/crossSectional';

interface CrossSectionalFormFormedibleProps {
  onResults: (
    results: CrossSectionalOutput,
    values: Record<string, unknown>
  ) => void;
  onError: (message: string | null) => void;
  showAdvanced: boolean;
}

export default function CrossSectionalFormFormedible({
  onResults,
  onError,
  showAdvanced,
}: CrossSectionalFormFormedibleProps) {
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

  const fields: FieldConfig[] = [
    {
      name: 'prevalence',
      type: 'number',
      label: 'Expected Prevalence (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
    },
    {
      name: 'marginOfError',
      type: 'number',
      label: 'Margin of Error (%)',
      min: 0.1,
      max: 50,
      step: 0.1,
      validation: z.number().min(0.1).max(50),
    },
    {
      name: 'confidenceLevel',
      type: 'number',
      label: 'Confidence Level (%)',
       min: 0,
      max: 100,
      step: 0.1,
      validation: z.number().min(0).max(100),
    },
    {
      name: 'populationSize',
      type: 'number',
      label: 'Population Size (Optional)',
      min: 1,
      step: 1,
      validation: z.number().positive().optional(),
      conditional: {
        field: 'showAdvanced',
        value: true,
      },
    },
    {
      name: 'designEffect',
      type: 'number',
      label: 'Design Effect (DEFF)',
      min: 1,
      step: 0.1,
      validation: z.number().min(1),
      conditional: {
        field: 'showAdvanced',
        value: true,
      },
    },
    {
      name: 'nonResponseRate',
      type: 'number',
      label: 'Non-Response Rate (%)',
      min: 0,
      max: 99,
      step: 0.1,
      validation: z.number().min(0).max(99.9),
      conditional: {
        field: 'showAdvanced',
        value: true,
      },
    },
    {
      name: 'clusteringEffect',
      type: 'number',
      label: 'Clustering Effect (ICC)',
      min: 0,
      max: 1,
      step: 0.01,
      validation: z.number().min(0).max(1),
      conditional: {
        field: 'showAdvanced',
        value: true,
      },
    },
  ];

  const { Form } = useFormedible({
    fields: fields.map((field) =>
      field.conditional
        ? { ...field, conditional: { ...field.conditional, value: showAdvanced } }
        : field
    ),
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    formOptions: {
      defaultValues: {
        prevalence: 30,
        marginOfError: 3,
        confidenceLevel: 95,
        populationSize: undefined,
        designEffect: 1,
        nonResponseRate: 15,
        clusteringEffect: 0,
      },
      onChange: ({ value }) => {
        try {
          const coerced = coerceValues(value as Record<string, unknown>);
          const parsed = CrossSectionalSchema.safeParse(coerced);
          if (!parsed.success) throw parsed.error;
          const result = calculateCrossSectionalSampleSize(parsed.data);
          onError(null);
          onResults(result, coerced);
        } catch (err: unknown) {
          if (err && typeof err === 'object' && 'issues' in (err as any)) {
            const zodErr = err as any;
            const msg =
              zodErr.issues?.map((i: any) => i.message).join(', ') ||
              'Invalid input';
            onError?.(msg);
          }
        }
      },
      onSubmit: ({ value }) => {
        try {
          const coerced = coerceValues(value as Record<string, unknown>);
          const validated = CrossSectionalSchema.parse(coerced);
          const result = calculateCrossSectionalSampleSize(validated);
          onResults(result, value as Record<string, unknown>);
          onError(null);
        } catch (err) {
          if (err instanceof z.ZodError) {
            onError(err.issues.map((i) => i.message).join(', '));
          } else {
            onError((err as Error).message);
          }
        }
      },
    },
    showSubmitButton: false,
    submitButton: Button,
    autoSubmitOnChange: true,
    autoSubmitDebounceMs: 400,
    persistence: {
      key: 'cross-sectional-form',
      storage: 'localStorage',
      debounceMs: 800,
      restoreOnMount: true,
    },
  });

  return <Form />;
}
