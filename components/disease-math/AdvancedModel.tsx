'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DiseaseModel,
  DiseaseModelParams,
  DiseaseModelResult,
  InterventionParams,
} from "@/lib/infectious";
import { LineChart } from "./LineChart";
import { MetricsDisplay } from "./MetricsDisplay";

export function AdvancedModel() {
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

  const [results, setResults] = useState<DiseaseModelResult | null>(null);

  const handleCalculate = () => {
    const model = new DiseaseModel(params, interventions);
    const result = model.calculate();
    setResults(result);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Model Parameters</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="population">Population Size</Label>
              <Input
                id="population"
                type="number"
                value={params.populationSize}
                onChange={(e) =>
                  setParams({ ...params, populationSize: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="initialCases">Initial Cases</Label>
              <Input
                id="initialCases"
                type="number"
                value={params.initialCases}
                onChange={(e) =>
                  setParams({ ...params, initialCases: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="transmissionRate">Base Transmission Rate (R₀)</Label>
              <Input
                id="transmissionRate"
                type="number"
                step="0.01"
                value={params.transmissionRate}
                onChange={(e) =>
                  setParams({ ...params, transmissionRate: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="incubationPeriod">Incubation Period (days)</Label>
              <Input
                id="incubationPeriod"
                type="number"
                value={params.incubationPeriod}
                onChange={(e) =>
                  setParams({ ...params, incubationPeriod: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="recoveryRate">Recovery Rate (γ)</Label>
              <Input
                id="recoveryRate"
                type="number"
                step="0.01"
                value={params.recoveryRate}
                onChange={(e) =>
                  setParams({ ...params, recoveryRate: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="mortalityRate">Mortality Rate (μ)</Label>
              <Input
                id="mortalityRate"
                type="number"
                step="0.01"
                value={params.mortalityRate}
                onChange={(e) =>
                  setParams({ ...params, mortalityRate: Number(e.target.value) })
                }
              />
            </div>
            <div>
                <Label htmlFor="seasonality">Seasonality</Label>
                <Slider
                    id="seasonality"
                    value={[params.seasonality * 100]}
                    onValueChange={([value]) =>
                    setParams({
                        ...params,
                        seasonality: value / 100,
                    })
                    }
                    max={100}
                    step={1}
                />
                <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(params.seasonality * 100)}% seasonal variation
                </p>
            </div>
            <div>
              <Label htmlFor="simulationDays">Simulation Days</Label>
              <Input
                id="simulationDays"
                type="number"
                value={params.simulationDays}
                onChange={(e) =>
                  setParams({ ...params, simulationDays: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Intervention Parameters</h2>
          <div className="space-y-6">
            <div>
              <Label>Social Distancing Effectiveness</Label>
              <Slider
                value={[interventions.socialDistancing * 100]}
                onValueChange={([value]) =>
                  setInterventions({
                    ...interventions,
                    socialDistancing: value / 100,
                  })
                }
                max={100}
                step={1}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(interventions.socialDistancing * 100)}% reduction
              </p>
            </div>

            <div>
              <Label>Daily Vaccination Rate</Label>
              <Slider
                value={[interventions.vaccinationRate * 1000]} // Scale for better slider sensitivity
                onValueChange={([value]) =>
                  setInterventions({
                    ...interventions,
                    vaccinationRate: value / 1000,
                  })
                }
                max={100} // Represents 10%
                step={1}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {(interventions.vaccinationRate * 100).toFixed(2)}% of susceptibles per day
              </p>
            </div>

             <div>
                <Label>Vaccine Effectiveness</Label>
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
                />
                <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(interventions.vaccineEffectiveness * 100)}% effective
                </p>
            </div>

            <div>
              <Label>Mask Effectiveness</Label>
              <Slider
                value={[interventions.maskEffectiveness * 100]}
                onValueChange={([value]) =>
                  setInterventions({
                    ...interventions,
                    maskEffectiveness: value / 100,
                  })
                }
                max={100}
                step={1}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(interventions.maskEffectiveness * 100)}% reduction
              </p>
            </div>

            <Button onClick={handleCalculate} className="w-full">
              Run Simulation
            </Button>
          </div>
        </Card>
      </div>

      {results && (
        <>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              Results
            </h2>
            <MetricsDisplay results={results} />
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              Disease Spread Over Time
            </h2>
            <div className="h-[400px]">
              <LineChart results={results} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
