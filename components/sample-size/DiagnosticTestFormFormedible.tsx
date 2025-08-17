'use client';
import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useFormedible } from '@/hooks/use-formedible';
import type { FieldConfig } from '@/lib/formedible/types';
import {
  SingleTestSchema,
  calculateSingleTestSampleSize,
  SingleTestOutput,
  ComparativeTestSchema,
  calculateComparativeTestSampleSize,
  ComparativeTestOutput,
  ROCAnalysisSchema,
  calculateROCAnalysisSampleSize,
  ROCAnalysisOutput,
} from '@/lib/diagnosticTest';

type Results = SingleTestOutput | ComparativeTestOutput | ROCAnalysisOutput;

interface DiagnosticTestFormFormedibleProps {
  onResults: (
    results: Results,
    values: Record<string, unknown>,
    tab: 'single' | 'comparative' | 'roc',
  ) => void;
  onError: (message: string | null) => void;
  activeTab: 'single' | 'comparative' | 'roc';
}

export default function DiagnosticTestFormFormedible({
  onResults,
  onError,
  activeTab,
}: DiagnosticTestFormFormedibleProps) {
  const singleTestFields: FieldConfig[] = [
    {
      name: 'expectedSensitivity',
      type: 'number',
      label: 'Expected Sensitivity (%)',
      min: 1,
      max: 100,
      step: 0.1,
      validation: z.number().min(1).max(100),
      group: 'parameters',
    },
    {
      name: 'expectedSpecificity',
      type: 'number',
      label: 'Expected Specificity (%)',
      min: 1,
      max: 100,
      step: 0.1,
      validation: z.number().min(1).max(100),
      group: 'parameters',
    },
    {
      name: 'diseasePrevalence',
      type: 'number',
      label: 'Disease Prevalence (%)',
      description: 'The proportion of the population that has the disease.',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
      group: 'parameters',
    },
    {
      name: 'marginOfError',
      type: 'number',
      label: 'Margin of Error (%)',
      min: 0.1,
      max: 50,
      step: 0.1,
      validation: z.number().min(0.1).max(50),
      group: 'parameters',
    },
    {
      name: 'confidenceLevel',
      type: 'select',
      label: 'Confidence Level (%)',
      options: [
        { value: '80', label: '80%' },
        { value: '90', label: '90%' },
        { value: '95', label: '95%' },
        { value: '99', label: '99%' },
      ],
      validation: z.string(),
      group: 'studyParams',
    },
    {
      name: 'dropoutRate',
      type: 'number',
      label: 'Dropout Rate (%)',
      min: 0,
      max: 50,
      step: 0.1,
      validation: z.number().min(0).max(50),
      group: 'studyParams',
    },
  ];

  const comparativeTestFields: FieldConfig[] = [
    {
      name: 'studyDesign',
      type: 'select',
      label: 'Study Design',
      options: [
        { value: 'paired', label: 'Paired' },
        { value: 'unpaired', label: 'Unpaired' },
      ],
      validation: z.enum(['paired', 'unpaired']),
      group: 'parameters',
    },
    {
      name: 'comparisonMetric',
      type: 'select',
      label: 'Comparison Metric',
      options: [
        { value: 'sensitivity', label: 'Sensitivity' },
        { value: 'specificity', label: 'Specificity' },
      ],
      validation: z.enum(['sensitivity', 'specificity']),
      group: 'parameters',
    },
    {
      name: 'test1Performance',
      type: 'number',
      label: 'Test 1 Performance (%)',
      min: 1,
      max: 100,
      step: 0.1,
      validation: z.number().min(1).max(100),
      group: 'parameters',
    },
    {
      name: 'test2Performance',
      type: 'number',
      label: 'Test 2 Performance (%)',
      min: 1,
      max: 100,
      step: 0.1,
      validation: z.number().min(1).max(100),
      group: 'parameters',
    },
    {
      name: 'testCorrelation',
      type: 'number',
      label: 'Test Correlation',
      min: 0,
      max: 1,
      step: 0.01,
      validation: z.number().min(0).max(1),
      conditional: {
        field: 'studyDesign',
        value: 'paired',
      },
      group: 'parameters',
    },
    {
      name: 'significanceLevel',
      type: 'select',
      label: 'Significance Level (%)',
      options: [
        { value: '1', label: '1%' },
        { value: '5', label: '5%' },
        { value: '10', label: '10%' },
      ],
      validation: z.string(),
      group: 'studyParams',
    },
    {
      name: 'power',
      type: 'select',
      label: 'Power (%)',
      options: [
        { value: '80', label: '80%' },
        { value: '85', label: '85%' },
        { value: '90', label: '90%' },
        { value: '95', label: '95%' },
      ],
      validation: z.string(),
      group: 'studyParams',
    },
     {
      name: 'dropoutRate',
      type: 'number',
      label: 'Dropout Rate (%)',
      min: 0,
      max: 50,
      step: 0.1,
      validation: z.number().min(0).max(50),
      group: 'studyParams',
    },
    {
      name: 'diseasePrevalence',
      type: 'number',
      label: 'Disease Prevalence (%)',
      description: 'The proportion of the population that has the disease.',
      min: 0.1,
      max: 99.9,
      step: 0.1,
      validation: z.number().min(0.1).max(99.9),
      group: 'studyParams',
    },
  ];

  const rocAnalysisFields: FieldConfig[] = [
    {
      name: 'expectedAUC',
      type: 'number',
      label: 'Expected AUC',
      min: 0.5,
      max: 1,
      step: 0.01,
      validation: z.number().min(0.5).max(1),
      group: 'parameters',
    },
    {
      name: 'nullAUC',
      type: 'number',
      label: 'Null AUC',
      min: 0.5,
      max: 1,
      step: 0.01,
      validation: z.number().min(0.5).max(1),
      group: 'parameters',
    },
    {
      name: 'negativePositiveRatio',
      type: 'number',
      label: 'Negative:Positive Ratio',
      min: 0.1,
      max: 10,
      step: 0.1,
      validation: z.number().min(0.1).max(10),
      group: 'parameters',
    },
    {
      name: 'significanceLevel',
      type: 'select',
      label: 'Significance Level (%)',
      options: [
        { value: '1', label: '1%' },
        { value: '5', label: '5%' },
        { value: '10', label: '10%' },
      ],
      validation: z.string(),
      group: 'studyParams',
    },
    {
      name: 'power',
      type: 'select',
      label: 'Power (%)',
      options: [
        { value: '80', label: '80%' },
        { value: '85', label: '85%' },
        { value: '90', label: '90%' },
        { value: '95', label: '95%' },
      ],
      validation: z.string(),
      group: 'studyParams',
    },
  ];

  const getFieldsForTab = (tab: 'single' | 'comparative' | 'roc') => {
    switch (tab) {
      case 'single':
        return singleTestFields;
      case 'comparative':
        return comparativeTestFields;
      case 'roc':
        return rocAnalysisFields;
    }
  };
  
  const { Form } = useFormedible({
    fields: getFieldsForTab(activeTab),
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    formOptions: {
      defaultValues: {
        expectedSensitivity: 85,
        expectedSpecificity: 90,
        diseasePrevalence: 20,
        marginOfError: 5,
        confidenceLevel: '95',
        dropoutRate: 10,
        studyDesign: 'paired',
        comparisonMetric: 'sensitivity',
        test1Performance: 80,
        test2Performance: 90,
        testCorrelation: 0.5,
        significanceLevel: '5',
        power: '80',
        expectedAUC: 0.8,
        nullAUC: 0.5,
        negativePositiveRatio: 1,
      } as any,
      onSubmit: ({ value }) => {
        try {
          let result: Results;
          const values = value as any;

          switch (activeTab) {
            case 'single':
              const singleData = {
                ...values,
                confidenceLevel: Number(values.confidenceLevel),
              };
              result = calculateSingleTestSampleSize(
                SingleTestSchema.parse(singleData),
              );
              break;
            case 'comparative':
              const comparativeData = {
                ...values,
                significanceLevel: Number(values.significanceLevel),
                power: Number(values.power),
                testCorrelation: values.testCorrelation || 0,
              };
              result = calculateComparativeTestSampleSize(
                ComparativeTestSchema.parse(comparativeData),
              );
              break;
            case 'roc':
              const rocData = {
                ...values,
                significanceLevel: Number(values.significanceLevel),
                power: Number(values.power),
              };
              result = calculateROCAnalysisSampleSize(
                ROCAnalysisSchema.parse(rocData),
              );
              break;
          }
          onResults(result, value as Record<string, unknown>, activeTab);
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
      <Button {...props} className="w-full" size="lg">
        Calculate Sample Size
      </Button>
    ),
  });

  return <Form />;
}
