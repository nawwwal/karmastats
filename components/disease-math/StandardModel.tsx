'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DiseaseModel, DiseaseModelParams, InterventionParams } from '@/lib/infectious';
import { FieldPopover } from '@/components/ui/field-popover';
import { getFieldExplanation } from '@/lib/field-explanations';

const FormSchema = z.object({
  population: z.number().min(1000, 'Population must be at least 1,000').max(100000000, 'Population too large'),
  initialInfected: z.number().min(1, 'Must have at least 1 initial case').max(10000, 'Too many initial cases'),
  transmissionRate: z.number().min(0.01, 'Rate must be positive').max(2, 'Rate too high'),
  incubationRate: z.number().min(0.01, 'Rate must be positive').max(1, 'Rate too high'),
  recoveryRate: z.number().min(0.01, 'Rate must be positive').max(1, 'Rate too high'),
  days: z.number().min(30, 'Minimum 30 days').max(1095, 'Maximum 3 years')
});

interface StandardModelProps {
  onResultsChange?: (results: any) => void;
}

export function StandardModel({ onResultsChange }: StandardModelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      population: 1000000,
      initialInfected: 100,
      transmissionRate: 0.3,
      incubationRate: 0.1,
      recoveryRate: 0.05,
      days: 365
    }
  });

  // Auto-calculate on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      form.handleSubmit(onSubmit)();
    }, 100);
    return () => clearTimeout(timer);
  }, [form, onSubmit]);

  const onSubmit = useCallback(async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const diseaseParams: DiseaseModelParams = {
        populationSize: data.population,
        initialCases: data.initialInfected,
        transmissionRate: data.transmissionRate,
        incubationPeriod: 1 / data.incubationRate, // Convert rate to days
        recoveryRate: data.recoveryRate,
        mortalityRate: 0.01, // Default mortality rate for SEIR
        simulationDays: data.days,
        seasonality: 0.1, // Default seasonality
      };

      const interventionParams: InterventionParams = {
        socialDistancing: 0,
        maskEffectiveness: 0,
        vaccinationRate: 0,
        vaccineEffectiveness: 0,
      };

      const model = new DiseaseModel(diseaseParams, interventionParams);
      const simulationResults = model.calculate();

      // Transform results to match the expected format
      const transformedResults = {
        susceptible: simulationResults.susceptible,
        exposed: simulationResults.exposed || [],
        infected: simulationResults.infected,
        recovered: simulationResults.recovered,
        deceased: simulationResults.deceased,
        vaccinated: simulationResults.vaccinated || [],
        populationSize: data.population,
        simulationDays: data.days,
        metrics: {
          peakInfected: simulationResults.peakInfection,
          peakDay: simulationResults.peakDay,
          totalDeaths: simulationResults.totalDeaths,
          totalCases: simulationResults.totalCases,
          attackRate: simulationResults.totalCases / data.population,
          r0: simulationResults.r0,
          herdImmunityThreshold: 1 - (1 / simulationResults.r0),
          mortalityRate: 0.01,
        }
      };

      onResultsChange?.(transformedResults);
    } catch (error) {
      console.error('Simulation failed:', error);
      setError('Simulation failed. Please check your parameters and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onResultsChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Population Parameters</CardTitle>
            <CardDescription>Basic population and initial conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="population"
                render={({ field }) => (
                  <FormItem>
                    <FieldPopover
                      {...getFieldExplanation('diseaseModel', 'populationSize')}
                      side="top"
                    >
                      <FormLabel>Population Size</FormLabel>
                    </FieldPopover>
                    <FormControl>
                      <EnhancedInput
                        type="number"
                        placeholder="1,000,000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={1000}
                        max={100000000}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialInfected"
                render={({ field }) => (
                  <FormItem>
                    <FieldPopover
                      {...getFieldExplanation('diseaseModel', 'initialCases')}
                      side="top"
                    >
                      <FormLabel>Initial Infected Cases</FormLabel>
                    </FieldPopover>
                    <FormControl>
                      <EnhancedInput
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={1}
                        max={10000}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg">Disease Parameters</CardTitle>
            <CardDescription>Transmission and progression rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="transmissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FieldPopover
                      {...getFieldExplanation('diseaseModel', 'transmissionRate')}
                      side="top"
                    >
                      <FormLabel>Transmission Rate (β)</FormLabel>
                    </FieldPopover>
                    <FormControl>
                      <EnhancedInput
                        type="number"
                        step="0.01"
                        placeholder="0.30"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0}
                        max={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incubationRate"
                render={({ field }) => (
                  <FormItem>
                    <FieldPopover
                      {...getFieldExplanation('diseaseModel', 'incubationPeriod')}
                      side="top"
                    >
                      <FormLabel>Incubation Rate (σ)</FormLabel>
                    </FieldPopover>
                    <FormControl>
                      <EnhancedInput
                        type="number"
                        step="0.01"
                        placeholder="0.10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0}
                        max={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recoveryRate"
                render={({ field }) => (
                  <FormItem>
                    <FieldPopover
                      {...getFieldExplanation('diseaseModel', 'recoveryRate')}
                      side="top"
                    >
                      <FormLabel>Recovery Rate (γ)</FormLabel>
                    </FieldPopover>
                    <FormControl>
                      <EnhancedInput
                        type="number"
                        step="0.01"
                        placeholder="0.05"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0}
                        max={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FieldPopover
                      {...getFieldExplanation('diseaseModel', 'simulationDays')}
                      side="top"
                    >
                      <FormLabel>Simulation Days</FormLabel>
                    </FieldPopover>
                    <FormControl>
                      <EnhancedInput
                        type="number"
                        placeholder="365"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={30}
                        max={1095}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Simulation Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          {isLoading ? 'Running SEIR Simulation...' : 'Run SEIR Simulation'}
        </Button>
      </form>
    </Form>
  );
}
