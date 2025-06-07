import { DiseaseModelResult } from "@/lib/infectious";
import { Card } from "@/components/ui/card";

interface MetricsDisplayProps {
  results: DiseaseModelResult;
}

export function MetricsDisplay({ results }: MetricsDisplayProps) {
  const metrics = [
    {
      label: "Peak Infections",
      value: Math.round(results.peakInfection),
      description: "Maximum number of simultaneous infections",
    },
    {
      label: "Peak Day",
      value: results.peakDay,
      description: "Day when infections peaked",
    },
    {
      label: "Total Cases",
      value: Math.round(results.totalCases),
      description: "Total number of cases over the simulation period",
    },
    {
      label: "Total Deaths",
      value: Math.round(results.totalDeaths),
      description: "Total number of deaths over the simulation period",
    },
    {
      label: "R₀ (Basic Reproduction Number)",
      value: results.r0.toFixed(2),
      description: "Average number of secondary infections",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {metric.label}
          </h3>
          <p className="text-2xl font-bold mt-1">
            {typeof metric.value === "number"
              ? new Intl.NumberFormat().format(metric.value)
              : metric.value}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {metric.description}
          </p>
        </Card>
      ))}
    </div>
  );
}
