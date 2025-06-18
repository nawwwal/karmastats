'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  DiseaseModel,
  DiseaseModelParams,
  InterventionParams,
} from "@/lib/infectious";

interface AdvancedModelProps {
  onResultsChange?: (results: any) => void;
}

export function AdvancedModel({ onResultsChange }: AdvancedModelProps) {
  const [params, setParams] = useState<DiseaseModelParams>({
    populationSize: 1000000,
    initialCases: 10,
    transmissionRate: 0.3,
    incubationPeriod: 5, // Average incubation period in days
    recoveryRate: 0.1, // Equivalent to a 10-day infectious period
    mortalityRate: 0.02,
    simulationDays: 180,
    seasonality: 0.1, // 10% seasonal variation
  });

  const [interventions, setInterventions] = useState<InterventionParams>({
    socialDistancing: 0.2,
    maskEffectiveness: 0.1,
    vaccinationRate: 0.005, // 0.5% of susceptible population per day
    vaccineEffectiveness: 0.9, // 90% effective
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);

    try {
    const model = new DiseaseModel(params, interventions);
      const simulationResults = model.calculate();

      // Transform results to match the expected format
      const transformedResults = {
        susceptible: simulationResults.susceptible,
        exposed: simulationResults.exposed || [],
        infected: simulationResults.infected,
        recovered: simulationResults.recovered,
        deceased: simulationResults.deceased,
        vaccinated: simulationResults.vaccinated || [],
        populationSize: params.populationSize,
        simulationDays: params.simulationDays,
        interventions,
        metrics: {
          peakInfected: simulationResults.peakInfection,
          peakDay: simulationResults.peakDay,
          totalDeaths: simulationResults.totalDeaths,
          totalCases: simulationResults.totalCases,
          attackRate: simulationResults.totalCases / params.populationSize,
          r0: simulationResults.r0,
          herdImmunityThreshold: 1 - (1 / simulationResults.r0),
          mortalityRate: params.mortalityRate,
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
      {/* Disease Parameters */}
          <div className="space-y-4">
        <h3 className="text-lg font-medium">Disease Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="population">Population Size</Label>
              <Input
                id="population"
                type="number"
                value={params.populationSize}
                onChange={(e) =>
                  setParams({ ...params, populationSize: Number(e.target.value) })
                }
              min="1000"
              max="100000000"
              placeholder="Total population"
              />
            <p className="text-xs text-muted-foreground">
              Total number of individuals in the population
            </p>
            </div>

          <div className="space-y-2">
              <Label htmlFor="initialCases">Initial Cases</Label>
              <Input
                id="initialCases"
                type="number"
                value={params.initialCases}
                onChange={(e) =>
                  setParams({ ...params, initialCases: Number(e.target.value) })
                }
              min="1"
              max="10000"
              placeholder="Initial infected"
              />
            <p className="text-xs text-muted-foreground">
              Number of infected individuals at start
            </p>
          </div>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="transmissionRate">Base Transmission Rate (R₀)</Label>
              <Input
                id="transmissionRate"
                type="number"
                step="0.01"
                value={params.transmissionRate}
                onChange={(e) =>
                  setParams({ ...params, transmissionRate: Number(e.target.value) })
                }
              min="0"
              max="10"
              placeholder="2.5"
              />
            <p className="text-xs text-muted-foreground">
              Basic reproduction number without interventions
            </p>
            </div>

          <div className="space-y-2">
              <Label htmlFor="incubationPeriod">Incubation Period (days)</Label>
              <Input
                id="incubationPeriod"
                type="number"
                value={params.incubationPeriod}
                onChange={(e) =>
                  setParams({ ...params, incubationPeriod: Number(e.target.value) })
                }
              min="1"
              max="30"
              placeholder="5"
              />
            <p className="text-xs text-muted-foreground">
              Average time from exposure to becoming infectious
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
                onChange={(e) =>
                  setParams({ ...params, recoveryRate: Number(e.target.value) })
                }
              min="0"
              max="1"
              placeholder="0.1"
              />
            <p className="text-xs text-muted-foreground">
              Rate of recovery from infection (1/infectious period)
            </p>
            </div>

          <div className="space-y-2">
              <Label htmlFor="mortalityRate">Mortality Rate (μ)</Label>
              <Input
                id="mortalityRate"
                type="number"
              step="0.001"
                value={params.mortalityRate}
                onChange={(e) =>
                  setParams({ ...params, mortalityRate: Number(e.target.value) })
                }
              min="0"
              max="0.1"
              placeholder="0.02"
              />
            <p className="text-xs text-muted-foreground">
              Case fatality rate (proportion of infected who die)
            </p>
          </div>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seasonality">Seasonality ({Math.round(params.seasonality * 100)}%)</Label>
                <Slider
                    id="seasonality"
                    value={[params.seasonality * 100]}
                    onValueChange={([value]) =>
                    setParams({
                        ...params,
                        seasonality: value / 100,
                    })
                    }
              max={50}
                    step={1}
              className="mt-2"
                />
            <p className="text-xs text-muted-foreground">
              Seasonal variation in transmission rate
                </p>
            </div>

          <div className="space-y-2">
              <Label htmlFor="simulationDays">Simulation Days</Label>
              <Input
                id="simulationDays"
                type="number"
                value={params.simulationDays}
                onChange={(e) =>
                  setParams({ ...params, simulationDays: Number(e.target.value) })
                }
              min="30"
              max="1095"
              placeholder="180"
              />
            <p className="text-xs text-muted-foreground">
              Duration of simulation in days
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Intervention Parameters */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Intervention Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Social Distancing Effectiveness ({Math.round(interventions.socialDistancing * 100)}%)</Label>
              <Slider
                value={[interventions.socialDistancing * 100]}
                onValueChange={([value]) =>
                  setInterventions({
                    ...interventions,
                    socialDistancing: value / 100,
                  })
                }
                max={80}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                Reduction in transmission due to social distancing
              </p>
            </div>

            <div className="space-y-2">
              <Label>Mask Effectiveness ({Math.round(interventions.maskEffectiveness * 100)}%)</Label>
              <Slider
                value={[interventions.maskEffectiveness * 100]}
                onValueChange={([value]) =>
                  setInterventions({
                    ...interventions,
                    maskEffectiveness: value / 100,
                  })
                }
                max={70}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                Reduction in transmission due to mask wearing
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Daily Vaccination Rate ({(interventions.vaccinationRate * 100).toFixed(2)}%)</Label>
              <Slider
                value={[interventions.vaccinationRate * 1000]}
                onValueChange={([value]) =>
                  setInterventions({
                    ...interventions,
                    vaccinationRate: value / 1000,
                  })
                }
                max={50} // Represents 5%
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of susceptible population vaccinated per day
              </p>
            </div>

            <div className="space-y-2">
              <Label>Vaccine Effectiveness ({Math.round(interventions.vaccineEffectiveness * 100)}%)</Label>
                <Slider
                    value={[interventions.vaccineEffectiveness * 100]}
                    onValueChange={([value]) =>
                    setInterventions({
                        ...interventions,
                        vaccineEffectiveness: value / 100,
                    })
                    }
                    max={100}
                    step={1}
                className="mt-2"
                />
              <p className="text-xs text-muted-foreground">
                Effectiveness of vaccination in preventing infection
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleCalculate}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Running Simulation...' : 'Run SEIRDV Simulation'}
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
