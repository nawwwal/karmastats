'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DiseaseModel, DiseaseModelParams, InterventionParams } from '@/lib/infectious';

interface Parameters {
  population: number;
  initialInfected: number;
  transmissionRate: number;
  incubationRate: number;
  recoveryRate: number;
  days: number;
}

interface StandardModelProps {
  onResultsChange?: (results: any) => void;
}

export function StandardModel({ onResultsChange }: StandardModelProps) {
  const [params, setParams] = useState<Parameters>({
    population: 1000000,
    initialInfected: 100,
    transmissionRate: 0.3,
    incubationRate: 0.1,
    recoveryRate: 0.05,
    days: 365
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateParam = (key: keyof Parameters, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const runSimulation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const diseaseParams: DiseaseModelParams = {
        populationSize: params.population,
        initialCases: params.initialInfected,
        transmissionRate: params.transmissionRate,
        incubationPeriod: 1 / params.incubationRate, // Convert rate to days
        recoveryRate: params.recoveryRate,
        mortalityRate: 0.01, // Default mortality rate for SEIR
        simulationDays: params.days,
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
        populationSize: params.population,
        simulationDays: params.days,
        metrics: {
          peakInfected: simulationResults.peakInfection,
          peakDay: simulationResults.peakDay,
          totalDeaths: simulationResults.totalDeaths,
          totalCases: simulationResults.totalCases,
          attackRate: simulationResults.totalCases / params.population,
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
  };

  return (
    <div className="space-y-6">
      {/* Model Parameters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
                <Label htmlFor="population">Population Size</Label>
                <Input
                  id="population"
                  type="number"
                  value={params.population}
                  onChange={(e) => updateParam('population', Number(e.target.value))}
                  min="1000"
                  max="100000000"
              placeholder="Total population"
                />
            <p className="text-xs text-muted-foreground">
              Total number of individuals in the population
            </p>
              </div>

          <div className="space-y-2">
                <Label htmlFor="initialInfected">Initial Infected</Label>
                <Input
                  id="initialInfected"
                  type="number"
                  value={params.initialInfected}
                  onChange={(e) => updateParam('initialInfected', Number(e.target.value))}
                  min="1"
                  max="10000"
              placeholder="Initial cases"
                />
            <p className="text-xs text-muted-foreground">
              Number of infected individuals at start
            </p>
          </div>
              </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
                <Label htmlFor="transmissionRate">Transmission Rate (β)</Label>
                <Input
                  id="transmissionRate"
                  type="number"
                  step="0.01"
                  value={params.transmissionRate}
                  onChange={(e) => updateParam('transmissionRate', Number(e.target.value))}
                  min="0"
                  max="2"
              placeholder="0.3"
                />
            <p className="text-xs text-muted-foreground">
              Rate of disease transmission per contact
            </p>
              </div>

          <div className="space-y-2">
                <Label htmlFor="incubationRate">Incubation Rate (σ)</Label>
                <Input
                  id="incubationRate"
                  type="number"
                  step="0.01"
                  value={params.incubationRate}
                  onChange={(e) => updateParam('incubationRate', Number(e.target.value))}
                  min="0"
                  max="1"
              placeholder="0.1"
                />
            <p className="text-xs text-muted-foreground">
              Rate of progression from exposed to infected
            </p>
          </div>
              </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
                <Label htmlFor="recoveryRate">Recovery Rate (γ)</Label>
                <Input
                  id="recoveryRate"
                  type="number"
                  step="0.01"
                  value={params.recoveryRate}
                  onChange={(e) => updateParam('recoveryRate', Number(e.target.value))}
                  min="0"
                  max="1"
              placeholder="0.05"
                />
            <p className="text-xs text-muted-foreground">
              Rate of recovery from infection
            </p>
              </div>

          <div className="space-y-2">
                <Label htmlFor="days">Simulation Days</Label>
                <Input
                  id="days"
                  type="number"
                  value={params.days}
                  onChange={(e) => updateParam('days', Number(e.target.value))}
                  min="30"
                  max="1095"
              placeholder="365"
                />
            <p className="text-xs text-muted-foreground">
              Duration of simulation in days
            </p>
          </div>
              </div>
            </div>

            <Button
              onClick={runSimulation}
              disabled={isLoading}
              className="w-full"
        size="lg"
            >
        {isLoading ? 'Running Simulation...' : 'Run SEIR Simulation'}
            </Button>

      {error && (
        <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
          <div className="text-destructive text-sm font-medium">
            Error: {error}
              </div>
        </div>
      )}
    </div>
  );
}
