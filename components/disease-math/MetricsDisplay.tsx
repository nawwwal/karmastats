import { DiseaseModelResult } from "@/lib/infectious";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { StatisticalSummary } from "@/components/ui/statistical-summary";

interface MetricsDisplayProps {
  results: DiseaseModelResult;
  animated?: boolean;
}

const formatNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
};

export function MetricsDisplay({ results, animated = true }: MetricsDisplayProps) {
  // Transform the results into the format expected by StatisticalSummary
  const diseaseModelResults = {
    metrics: {
      peakInfected: Math.round(results.peakInfection),
      r0: results.r0,
      attackRate: results.totalCases / (((results as any).populationSize) || 100000), // Assuming population size
      totalDeaths: Math.round(results.totalDeaths),
      mortalityRate: results.totalDeaths / results.totalCases,
      peakDay: results.peakDay
    },
    populationSize: (results as any).populationSize || 100000
  };

  return (
    <StatisticalSummary
      results={diseaseModelResults}
      type="disease-model"
      title="Disease Model Metrics"
    />
  );
}
