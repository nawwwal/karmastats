'use client';
import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useFormedible } from '@/hooks/use-formedible';
import type { FieldConfig } from '@/lib/formedible/types';
import { computeCrossSectional } from '@/lib/tools/crossSectional/manager';
import type { RawValues } from '@/lib/tools/crossSectional/types';
import type { CrossSectionalOutput } from '@/backend/sample-size.cross-sectional';

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
      conditional: () => showAdvanced,
    },
    {
      name: 'designEffect',
      type: 'number',
      label: 'Design Effect (DEFF)',
      min: 1,
      step: 0.1,
      validation: z.number().min(1),
      conditional: () => showAdvanced,
    },
    {
      name: 'nonResponseRate',
      type: 'number',
      label: 'Non-Response Rate (%)',
      min: 0,
      max: 99,
      step: 0.1,
      validation: z.number().min(0).max(99.9),
      conditional: () => showAdvanced,
    },
    {
      name: 'clusteringEffect',
      type: 'number',
      label: 'Clustering Effect (ICC)',
      min: 0,
      max: 1,
      step: 0.01,
      validation: z.number().min(0).max(1),
      conditional: () => showAdvanced,
    },
  ];

  const { Form } = useFormedible({
    fields,
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
      onChange: async ({ value }) => {
        const computed = await computeCrossSectional(value as RawValues);
        if (computed.ok) {
          onError(null);
          onResults(computed.result, computed.values);
        } else {
          onError(computed.message);
        }
      },
      onSubmit: async ({ value }) => {
        try {
          const computed = await computeCrossSectional(value as RawValues);
          if (computed.ok) {
            onError(null);
            onResults(computed.result, computed.values);
          } else {
            throw new Error(computed.message);
          }
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
