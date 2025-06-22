import { DiseaseModelResult } from "@/lib/infectious";
import { Card } from "@/components/ui/card";
import { NumberFlowDisplay } from "@/components/ui/number-flow";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { StatisticalSummary } from "@/components/ui/statistical-summary";

interface MetricsDisplayProps {
  results: DiseaseModelResult;
  animated?: boolean;
}

export function MetricsDisplay({ results, animated = true }: MetricsDisplayProps) {
  // Transform the results into the format expected by StatisticalSummary
  const diseaseModelResults = {
    metrics: {
      peakInfected: Math.round(results.peakInfection),
      r0: results.r0,
      attackRate: results.totalCases / (results.populationSize || 100000), // Assuming population size
      totalDeaths: Math.round(results.totalDeaths),
      mortalityRate: results.totalDeaths / results.totalCases,
      peakDay: results.peakDay
    },
    populationSize: results.populationSize || 100000
  };

  return (
    <StatisticalSummary
      results={diseaseModelResults}
      type="disease-model"
      title="Disease Model Metrics"
    />
  );
}
