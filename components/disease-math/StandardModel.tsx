'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  DiseaseModel,
  DiseaseModelResult,
  DiseaseModelParamsSchema,
  DiseaseModelInput
} from "@/lib/infectious";
import { LineChart } from "./LineChart";
import { MetricsDisplay } from "./MetricsDisplay";

export function StandardModel() {
  const [results, setResults] = useState<DiseaseModelResult | null>(null);

  const form = useForm<DiseaseModelInput>({
    resolver: zodResolver(DiseaseModelParamsSchema),
    defaultValues: {
      populationSize: 1000000,
      initialCases: 100,
      transmissionRate: 0.3,
      incubationPeriod: 5,
      recoveryRate: 0.1,
      mortalityRate: 0.02,
      simulationDays: 100,
      seasonality: 0.1,
    },
  });

  const onSubmit = (data: DiseaseModelInput) => {
    const interventions = {
      socialDistancing: 0,
      maskEffectiveness: 0,
      vaccinationRate: 0,
      vaccineEffectiveness: 0,
    };
    const model = new DiseaseModel(data, interventions);
    const result = model.calculate();
    setResults(result);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Model Parameters</h2>
          <Form {...(form as any)}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="populationSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Population Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Initial Cases</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transmissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Incubation Period (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recoveryRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Mortality Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="simulationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Simulation Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Seasonality (0-1)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate
              </Button>
            </form>
          </Form>
        </Card>

        {results && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Results</h2>
            <MetricsDisplay results={results} />
          </Card>
        )}
      </div>

      {results && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Disease Spread Over Time</h2>
          <div className="h-[400px]">
            <LineChart results={results} />
          </div>
        </Card>
      )}
    </div>
  );
}
