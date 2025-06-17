'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DiseaseModel, DiseaseModelParams, DiseaseModelResult } from "@/lib/infectious";
import { LineChart } from "./LineChart";
import { MetricsDisplay } from "./MetricsDisplay";

export function StandardModel() {
  const [params, setParams] = useState<DiseaseModelParams>({
    populationSize: 1000000,
    initialCases: 100,
    transmissionRate: 0.3,
    incubationPeriod: 5,
    recoveryRate: 0.1,
    mortalityRate: 0.02,
    simulationDays: 100,
    seasonality: 0.1,
  });

  const [results, setResults] = useState<DiseaseModelResult | null>(null);

  const handleCalculate = () => {
    const interventions = {
      socialDistancing: 0,
      maskEffectiveness: 0,
      vaccinationRate: 0,
      vaccineEffectiveness: 0,
    };
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
              <Label htmlFor="transmissionRate">Transmission Rate</Label>
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
                step="0.1"
                value={params.incubationPeriod}
                onChange={(e) =>
                  setParams({ ...params, incubationPeriod: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="recoveryRate">Recovery Rate</Label>
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
              <Label htmlFor="mortalityRate">Mortality Rate</Label>
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
            <div>
              <Label htmlFor="seasonality">Seasonality (0-1)</Label>
              <Input
                id="seasonality"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={params.seasonality}
                onChange={(e) =>
                  setParams({ ...params, seasonality: Number(e.target.value) })
                }
              />
            </div>
            <Button onClick={handleCalculate} className="w-full">
              Calculate
            </Button>
          </div>
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
