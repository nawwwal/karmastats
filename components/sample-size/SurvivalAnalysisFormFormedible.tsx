'use client';
import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useFormedible } from '@/hooks/use-formedible';
import type { FieldConfig } from '@/lib/formedible/types';
import {
  calculateLogRank,
  calculateCox,
  calculateOneArm,
  type LogRankOutput,
  type CoxOutput,
  type OneArmOutput,
  LogRankParamsSchema,
  CoxParamsSchema,
  OneArmParamsSchema,
} from '@/lib/survivalAnalysis';

type Results = LogRankOutput | CoxOutput | OneArmOutput;

interface SurvivalAnalysisFormFormedibleProps {
  onResults: (results: Results, values: Record<string, unknown>) => void;
  onError: (message: string | null) => void;
  activeTab: 'log-rank' | 'cox' | 'one-arm';
  onActiveTabChange: (tab: 'log-rank' | 'cox' | 'one-arm') => void;
}

export default function SurvivalAnalysisFormFormedible({
  onResults,
  onError,
  activeTab,
  onActiveTabChange,
}: SurvivalAnalysisFormFormedibleProps) {
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
    // Log-Rank Fields
    { name: 'medianSurvival1', type: 'number', label: 'Group 1 Median Survival (months)', validation: z.number().positive(), tab: 'log-rank' },
    { name: 'medianSurvival2', type: 'number', label: 'Group 2 Median Survival (months)', validation: z.number().positive(), tab: 'log-rank' },
    { name: 'accrualPeriod', type: 'number', label: 'Accrual Period (months)', validation: z.number().positive(), tab: 'log-rank' },
    { name: 'followupPeriod', type: 'number', label: 'Follow-up Period (months)', validation: z.number().nonnegative(), tab: 'log-rank' },
    { name: 'allocationRatio', type: 'number', label: 'Allocation Ratio', validation: z.number().positive(), tab: 'log-rank' },

    // Cox Regression Fields
    { name: 'hazardRatio', type: 'number', label: 'Hazard Ratio', validation: z.number().positive(), tab: 'cox' },
    { name: 'rSquared', type: 'number', label: 'R² for Primary Covariate', validation: z.number().min(0).max(0.99), tab: 'cox' },
    { name: 'overallEventRate', type: 'number', label: 'Overall Event Rate', validation: z.number().min(0.01).max(1), tab: 'cox' },

    // One-Arm Survival Fields
    { name: 'historicalMedianSurvival', type: 'number', label: 'Historical Median Survival (months)', validation: z.number().min(0.1), tab: 'one-arm' },
    { name: 'targetMedianSurvival', type: 'number', label: 'Target Median Survival (months)', validation: z.number().min(0.1), tab: 'one-arm' },
    { name: 'analysisTimePoint', type: 'number', label: 'Analysis Time Point (months)', validation: z.number().min(0.1), tab: 'one-arm' },

    // Common Fields
    { name: 'significanceLevel', type: 'number', label: 'Significance Level (α)', validation: z.number().min(0).max(1) },
    { name: 'power', type: 'number', label: 'Power (1-β)', validation: z.number().min(0).max(1) },
    { name: 'dropoutRate', type: 'number', label: 'Dropout Rate (%)', validation: z.number().min(0).max(99) },
  ];

  const { Form } = useFormedible({
    fields,
    tabs: [
      { id: 'log-rank', label: 'Log-Rank Test' },
      { id: 'cox', label: 'Cox Regression' },
      { id: 'one-arm', label: 'One-Arm Study' },
    ],
    formOptions: {
      defaultValues: {
        medianSurvival1: 12,
        medianSurvival2: 18,
        accrualPeriod: 24,
        followupPeriod: 12,
        allocationRatio: 1,
        significanceLevel: 0.05,
        power: 0.8,
        dropoutRate: 10,
        hazardRatio: 1.5,
        rSquared: 0.2,
        overallEventRate: 0.6,
        historicalMedianSurvival: 12,
        targetMedianSurvival: 18,
        analysisTimePoint: 24,
      },
      onChange: ({ value }) => {
        try {
          const coerced = coerceValues(value as Record<string, unknown>);
          let result: Results | null = null;
          if (activeTab === 'log-rank') {
            const parsed = LogRankParamsSchema.safeParse(coerced);
            if (!parsed.success) throw parsed.error;
            result = calculateLogRank(parsed.data);
          } else if (activeTab === 'cox') {
            const parsed = CoxParamsSchema.safeParse(coerced);
            if (!parsed.success) throw parsed.error;
            result = calculateCox(parsed.data);
          } else if (activeTab === 'one-arm') {
            const parsed = OneArmParamsSchema.safeParse(coerced);
            if (!parsed.success) throw parsed.error;
            result = calculateOneArm(parsed.data);
          }
          onError(null);
          if (result) onResults(result, coerced);
        } catch (error) {
          if (error instanceof z.ZodError) {
            onError(error.issues.map((i) => i.message).join(', '));
          }
        }
      },
    },
    layout: { type: 'grid', columns: 2, gap: '6', responsive: true },
    showSubmitButton: false,
    autoSubmitOnChange: true,
    autoSubmitDebounceMs: 400,
    persistence: {
      key: 'survival-analysis-form',
      storage: 'localStorage',
      debounceMs: 800,
      restoreOnMount: true,
    },
    analytics: {
      onTabChange: (_from, to) => onActiveTabChange(to as any),
    },
  });

  return <Form />;
}
