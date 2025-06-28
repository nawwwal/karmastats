'use client';

import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnhancedFormField } from '@/components/ui/enhanced-form-field';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from "@/components/ui/separator";
import { FieldPopover } from "@/components/ui/field-popover";
import { getFieldExplanation } from "@/lib/field-explanations";
import {
  DiseaseModel,
  DiseaseModelParams,
  InterventionParams,
} from "@/lib/infectious";

const FormSchema = z.object({
  // Disease Parameters
  populationSize: z.number().min(1000, 'Population must be at least 1,000').max(100000000, 'Population too large'),
  initialCases: z.number().min(1, 'Must have at least 1 initial case').max(10000, 'Too many initial cases'),
  transmissionRate: z.number().min(0.01, 'Rate must be positive').max(10, 'Rate too high'),
  incubationPeriod: z.number().min(1, 'Minimum 1 day').max(30, 'Maximum 30 days'),
  recoveryRate: z.number().min(0.01, 'Rate must be positive').max(1, 'Rate too high'),
  mortalityRate: z.number().min(0, 'Rate cannot be negative').max(0.1, 'Rate too high'),
  simulationDays: z.number().min(30, 'Minimum 30 days').max(1095, 'Maximum 3 years'),
  seasonality: z.number().min(0, 'Cannot be negative').max(0.8, 'Too high'),

  // Intervention Parameters
  socialDistancing: z.number().min(0, 'Cannot be negative').max(0.9, 'Too high'),
  maskEffectiveness: z.number().min(0, 'Cannot be negative').max(0.8, 'Too high'),
  vaccinationRate: z.number().min(0, 'Cannot be negative').max(0.05, 'Too high'),
  vaccineEffectiveness: z.number().min(0.3, 'Too low to be effective').max(0.99, 'Cannot exceed 99%')
});

interface AdvancedModelProps {
  onResultsChange?: (results: any) => void;
}

export function AdvancedModel({ onResultsChange }: AdvancedModelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
    populationSize: 1000000,
    initialCases: 10,
    transmissionRate: 0.3,
      incubationPeriod: 5,
      recoveryRate: 0.1,
    mortalityRate: 0.02,
    simulationDays: 180,
      seasonality: 0.1,
    socialDistancing: 0.2,
    maskEffectiveness: 0.1,
      vaccinationRate: 0.005,
      vaccineEffectiveness: 0.9
    }
  });

  // Auto-calculate on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      form.handleSubmit(onSubmit)();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const diseaseParams: DiseaseModelParams = {
        populationSize: data.populationSize,
        initialCases: data.initialCases,
        transmissionRate: data.transmissionRate,
        incubationPeriod: data.incubationPeriod,
        recoveryRate: data.recoveryRate,
        mortalityRate: data.mortalityRate,
        simulationDays: data.simulationDays,
        seasonality: data.seasonality,
      };

      const interventionParams: InterventionParams = {
        socialDistancing: data.socialDistancing,
        maskEffectiveness: data.maskEffectiveness,
        vaccinationRate: data.vaccinationRate,
        vaccineEffectiveness: data.vaccineEffectiveness,
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
        populationSize: data.populationSize,
        simulationDays: data.simulationDays,
        interventions: interventionParams,
        metrics: {
          peakInfected: simulationResults.peakInfection,
          peakDay: simulationResults.peakDay,
          totalDeaths: simulationResults.totalDeaths,
          totalCases: simulationResults.totalCases,
          attackRate: simulationResults.totalCases / data.populationSize,
          r0: simulationResults.r0,
          herdImmunityThreshold: 1 - (1 / simulationResults.r0),
          mortalityRate: data.mortalityRate,
        }
      };

      onResultsChange?.(transformedResults);
    } catch (error) {
      console.error('Simulation failed:', error);
      setError('Simulation failed. Please check your parameters and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Disease Parameters */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Disease Parameters</CardTitle>
            <CardDescription>Core epidemiological parameters for the advanced SEIRDV model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="populationSize"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'populationSize')}
              side="top"
            >
                      <FormLabel>Population Size</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
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
                name="initialCases"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'initialCases')}
              side="top"
            >
                      <FormLabel>Initial Cases</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
                type="number"
                        placeholder="10"
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
                      <FormLabel>Base Transmission Rate (R₀)</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
                type="number"
                step="0.01"
                        placeholder="0.30"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0}
                        max={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incubationPeriod"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'incubationPeriod')}
              side="top"
            >
                      <FormLabel>Incubation Period (days)</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
                type="number"
              placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={1}
                        max={30}
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
                      <EnhancedFormField
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

              <FormField
                control={form.control}
                name="mortalityRate"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'mortalityRate')}
              side="top"
            >
                      <FormLabel>Mortality Rate (μ)</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
                type="number"
              step="0.001"
                        placeholder="0.020"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0}
                        max={0.1}
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
                name="simulationDays"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'simulationDays')}
              side="top"
            >
                      <FormLabel>Simulation Days</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
              type="number"
              placeholder="180"
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

              <FormField
                control={form.control}
                name="seasonality"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'seasonality')}
              side="top"
            >
                      <FormLabel>Seasonal Variation</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
              type="number"
              step="0.01"
                        placeholder="0.10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0}
                        max={0.8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          </CardContent>
        </Card>

      {/* Intervention Parameters */}
        <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg">Intervention Parameters</CardTitle>
            <CardDescription>Public health interventions and control measures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="socialDistancing"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'socialDistancing')}
              side="top"
            >
                      <FormLabel>Social Distancing Effectiveness</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
              type="number"
              step="0.01"
                        placeholder="0.20"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0}
                        max={0.9}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maskEffectiveness"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'maskEffectiveness')}
              side="top"
            >
                      <FormLabel>Mask Effectiveness</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
              type="number"
              step="0.01"
                        placeholder="0.10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0}
                        max={0.8}
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
                name="vaccinationRate"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'vaccinationRate')}
              side="top"
            >
                      <FormLabel>Daily Vaccination Rate</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
              type="number"
              step="0.001"
              placeholder="0.005"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0}
                        max={0.05}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vaccineEffectiveness"
                render={({ field }) => (
                  <FormItem>
            <FieldPopover
              {...getFieldExplanation('diseaseModel', 'vaccineEffectiveness')}
              side="top"
            >
                      <FormLabel>Vaccine Effectiveness</FormLabel>
            </FieldPopover>
                    <FormControl>
                      <EnhancedFormField
              type="number"
              step="0.01"
                        placeholder="0.90"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        className="text-right"
                        min={0.3}
                        max={0.99}
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
          {isLoading ? 'Running Advanced Simulation...' : 'Run Advanced SEIRDV Simulation'}
        </Button>
      </form>
    </Form>
  );
}
