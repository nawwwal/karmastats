'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LineChart } from './LineChart';
import { MetricsDisplay } from './MetricsDisplay';
import { DiseaseModel, DiseaseModelParams, InterventionParams } from '@/lib/infectious';

interface Parameters {
  population: number;
  initialInfected: number;
  transmissionRate: number;
  incubationRate: number;
  recoveryRate: number;
  days: number;
}

export function StandardModel() {
  const [params, setParams] = useState<Parameters>({
    population: 1000000,
    initialInfected: 100,
    transmissionRate: 0.3,
    incubationRate: 0.1,
    recoveryRate: 0.05,
    days: 365
  });

  const [results, setResults] = useState<any>(null);
  const [rawResults, setRawResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateParam = (key: keyof Parameters, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const runSimulation = useCallback(async () => {
    setIsLoading(true);
    try {
      const diseaseParams: DiseaseModelParams = {
        populationSize: params.population,
        initialCases: params.initialInfected,
        transmissionRate: params.transmissionRate,
        incubationPeriod: 1 / params.incubationRate, // Convert rate to days
        recoveryRate: params.recoveryRate,
        mortalityRate: 0.01, // Default mortality rate
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
        infected: simulationResults.infected,
        recovered: simulationResults.recovered,
        deceased: simulationResults.deceased,
        metrics: {
          peakInfected: simulationResults.peakInfection,
          peakDay: simulationResults.peakDay,
          totalDeaths: simulationResults.totalDeaths,
          attackRate: simulationResults.totalCases / params.population,
          r0: simulationResults.r0,
          herdImmunityThreshold: 1 - (1 / simulationResults.r0),
        }
      };

      setResults(transformedResults);
      setRawResults(simulationResults);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Parameters Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">Model Parameters</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="population">Population Size</Label>
                <Input
                  id="population"
                  type="number"
                  value={params.population}
                  onChange={(e) => updateParam('population', Number(e.target.value))}
                  min="1000"
                  max="100000000"
                />
              </div>

              <div>
                <Label htmlFor="initialInfected">Initial Infected</Label>
                <Input
                  id="initialInfected"
                  type="number"
                  value={params.initialInfected}
                  onChange={(e) => updateParam('initialInfected', Number(e.target.value))}
                  min="1"
                  max="10000"
                />
              </div>

              <div>
                <Label htmlFor="transmissionRate">Transmission Rate (β)</Label>
                <Input
                  id="transmissionRate"
                  type="number"
                  step="0.01"
                  value={params.transmissionRate}
                  onChange={(e) => updateParam('transmissionRate', Number(e.target.value))}
                  min="0"
                  max="2"
                />
              </div>

              <div>
                <Label htmlFor="incubationRate">Incubation Rate (σ)</Label>
                <Input
                  id="incubationRate"
                  type="number"
                  step="0.01"
                  value={params.incubationRate}
                  onChange={(e) => updateParam('incubationRate', Number(e.target.value))}
                  min="0"
                  max="1"
                />
              </div>

              <div>
                <Label htmlFor="recoveryRate">Recovery Rate (γ)</Label>
                <Input
                  id="recoveryRate"
                  type="number"
                  step="0.01"
                  value={params.recoveryRate}
                  onChange={(e) => updateParam('recoveryRate', Number(e.target.value))}
                  min="0"
                  max="1"
                />
              </div>

              <div>
                <Label htmlFor="days">Simulation Days</Label>
                <Input
                  id="days"
                  type="number"
                  value={params.days}
                  onChange={(e) => updateParam('days', Number(e.target.value))}
                  min="30"
                  max="1095"
                />
              </div>
            </div>

            <Button
              onClick={runSimulation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Running Simulation...' : 'Run Simulation'}
            </Button>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsDisplay results={rawResults} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Simulation Results */}
      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">Results</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Peak Values</h3>
                  <div className="space-y-2 text-sm">
                    <div>Peak Infected: {results.metrics.peakInfected.toLocaleString()}</div>
                    <div>Peak Day: {results.metrics.peakDay}</div>
                    <div>Total Deaths: {results.metrics.totalDeaths.toLocaleString()}</div>
                    <div>Attack Rate: {(results.metrics.attackRate * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Reproduction Numbers</h3>
                  <div className="space-y-2 text-sm">
                    <div>R₀: {results.metrics.r0.toFixed(2)}</div>
                    <div>Herd Immunity: {(results.metrics.herdImmunityThreshold * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">Disease Spread Over Time</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart results={rawResults} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
