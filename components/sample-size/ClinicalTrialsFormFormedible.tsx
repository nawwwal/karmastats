'use client';
import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useFormedible } from '@/hooks/use-formedible';
import type { FieldConfig } from '@/lib/formedible/types';
import {
  SuperiorityBinarySchema,
  calculateSuperiorityBinary,
  SuperiorityBinaryOutput,
  SuperiorityContinuousSchema,
  calculateSuperiorityContinuous,
  SuperiorityContinuousOutput,
  NonInferioritySchema,
  calculateNonInferiority,
  NonInferiorityOutput,
  EquivalenceSchema,
  calculateEquivalence,
  EquivalenceOutput,
} from '@/lib/clinicalTrial';
import { Calculator } from 'lucide-react';

type Results =
  | SuperiorityBinaryOutput
  | SuperiorityContinuousOutput
  | NonInferiorityOutput
  | EquivalenceOutput;

interface ClinicalTrialsFormFormedibleProps {
  onResults: (results: Results, values: Record<string, unknown>) => void;
  onError: (message: string | null) => void;
  activeTab: 'superiority' | 'non-inferiority' | 'equivalence';
  superiorityOutcome?: 'binary' | 'continuous';
}

export default function ClinicalTrialsFormFormedible({
  onResults,
  onError,
  activeTab,
  superiorityOutcome,
}: ClinicalTrialsFormFormedibleProps) {
  const commonFields: FieldConfig[] = [
    {
      name: 'alpha',
      type: 'select',
      label: 'Significance Level (α)',
      options: [
        { value: '1', label: '1%' },
        { value: '5', label: '5%' },
        { value: '10', label: '10%' },
      ],
      validation: z.string(),
    },
    {
      name: 'power',
      type: 'select',
      label: 'Power (1-β)',
      options: [
        { value: '80', label: '80%' },
        { value: '85', label: '85%' },
        { value: '90', label: '90%' },
        { value: '95', label: '95%' },
      ],
      validation: z.string(),
    },
    {
      name: 'allocationRatio',
      type: 'number',
      label: 'Allocation Ratio (T:C)',
      min: 0.1,
      step: 0.1,
      validation: z.number().positive(),
    },
    {
      name: 'dropoutRate',
      type: 'number',
      label: 'Dropout Rate (%)',
      min: 0,
      max: 99,
      step: 1,
      validation: z.number().min(0).max(99.9),
    },
  ];

  const superiorityBinaryFields: FieldConfig[] = [
    ...commonFields,
    {
      name: 'controlRate',
      type: 'number',
      label: 'Control Group Success Rate (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
    },
    {
      name: 'treatmentRate',
      type: 'number',
      label: 'Treatment Group Success Rate (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
    },
  ];

  const superiorityContinuousFields: FieldConfig[] = [
    ...commonFields,
    {
      name: 'meanDifference',
      type: 'number',
      label: 'Expected Mean Difference',
      step: 0.1,
      validation: z.number().positive(),
    },
    {
      name: 'stdDev',
      type: 'number',
      label: 'Standard Deviation',
      min: 0.1,
      step: 0.1,
      validation: z.number().positive(),
    },
  ];

  const nonInferiorityFields: FieldConfig[] = [
    ...commonFields,
    {
      name: 'controlRate',
      type: 'number',
      label: 'Control Group Rate (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
    },
    {
      name: 'treatmentRate',
      type: 'number',
      label: 'Treatment Group Rate (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
    },
    {
      name: 'margin',
      type: 'number',
      label: 'Non-Inferiority Margin (%)',
      min: 0.1,
      step: 0.1,
      validation: z.number().positive(),
    },
  ];

  const equivalenceFields: FieldConfig[] = [
    ...commonFields,
    {
      name: 'referenceRate',
      type: 'number',
      label: 'Reference Treatment Rate (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
    },
    {
      name: 'testRate',
      type: 'number',
      label: 'Test Treatment Rate (%)',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
    },
    {
      name: 'margin',
      type: 'number',
      label: 'Equivalence Margin (%)',
      min: 0.1,
      step: 0.1,
      validation: z.number().positive(),
    },
  ];

  const getFields = () => {
    switch (activeTab) {
      case 'superiority':
        return superiorityOutcome === 'binary'
          ? superiorityBinaryFields
          : superiorityContinuousFields;
      case 'non-inferiority':
        return nonInferiorityFields;
      case 'equivalence':
        return equivalenceFields;
      default:
        return [];
    }
  };

  const { Form } = useFormedible({
    fields: getFields(),
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    formOptions: {
      defaultValues: {
        alpha: '5',
        power: '80',
        allocationRatio: 1,
        dropoutRate: 15,
        controlRate: 60,
        treatmentRate: 75,
        meanDifference: 2.5,
        stdDev: 6.0,
        margin: 5,
        referenceRate: 20,
        testRate: 18,
      } as any,
      onSubmit: ({ value }) => {
        try {
          let result: Results;
          const values = { ...value, superiorityOutcome };

          switch (activeTab) {
            case 'superiority':
              if (superiorityOutcome === 'binary') {
                result = calculateSuperiorityBinary(
                  SuperiorityBinarySchema.parse(values),
                );
              } else {
                result = calculateSuperiorityContinuous(
                  SuperiorityContinuousSchema.parse(values),
                );
              }
              break;
            case 'non-inferiority':
              result = calculateNonInferiority(
                NonInferioritySchema.parse(values),
              );
              break;
            case 'equivalence':
              result = calculateEquivalence(EquivalenceSchema.parse(values));
              break;
            default:
              throw new Error('Invalid tab');
          }
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
    showSubmitButton: true,
    submitButton: (props) => (
      <Button
        {...props}
        size="lg"
        className="px-12 py-4 text-lg font-semibold h-14"
      >
        <Calculator className="h-5 w-5 mr-3" />
        Calculate Sample Size
      </Button>
    ),
  });

  return <Form />;
}
