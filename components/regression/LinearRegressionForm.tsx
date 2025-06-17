'use client';

import { useState } from "react";
import { linearRegression, LinearRegressionResult } from "@/lib/regression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import dynamic from "next/dynamic";

// Dynamically import Chart.js to prevent SSR issues
const Scatter = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Scatter),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    ),
  }
);

// Dynamic import for Chart.js registration
if (typeof window !== "undefined") {
  import("chart.js").then((ChartJS) => {
    ChartJS.Chart.register(
      ChartJS.CategoryScale,
      ChartJS.LinearScale,
      ChartJS.PointElement,
      ChartJS.LineElement,
      ChartJS.Title,
      ChartJS.Tooltip,
      ChartJS.Legend
    );
  });
}

const parseInput = (input: string): number[] => {
    return input.split(/[\s,]+/).filter(s => s.trim() !== "").map(Number);
}

export function LinearRegressionForm() {
  const [xValues, setXValues] = useState("");
  const [yValues, setYValues] = useState("");
  const [xLabel, setXLabel] = useState("X");
  const [yLabel, setYLabel] = useState("Y");
  const [result, setResult] = useState<LinearRegressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    const parsedX = parseInput(xValues);
    const parsedY = parseInput(yValues);

    const regressionResult = linearRegression(parsedX, parsedY);

    if ("error" in regressionResult) {
      setError(regressionResult.error);
    } else {
      setResult(regressionResult);
    }
  };

  const chartData = result ? {
    datasets: [
      {
        label: "Data Points",
        data: result.xValues.map((val, i) => ({ x: val, y: result.yValues[i] })),
        backgroundColor: "hsl(var(--secondary) / 0.5)",
      },
      {
        label: "Regression Line",
        data: result.xValues.map((val) => ({ x: val, y: result.intercept + result.slope * val })),
        type: 'line' as const,
        borderColor: "hsl(var(--primary))",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      },
    ],
  } : { datasets: []};

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: xLabel,
        },
      },
      y: {
        title: {
          display: true,
          text: yLabel,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Simple Linear Regression',
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="xValues">X Values (Independent)</Label>
            <Textarea id="xValues" value={xValues} onChange={(e) => setXValues(e.target.value)} placeholder="Enter values separated by comma or space" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="yValues">Y Values (Dependent)</Label>
            <Textarea id="yValues" value={yValues} onChange={(e) => setYValues(e.target.value)} placeholder="Enter values separated by comma or space" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="xLabel">X-Axis Label</Label>
            <Input id="xLabel" value={xLabel} onChange={(e) => setXLabel(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="yLabel">Y-Axis Label</Label>
            <Input id="yLabel" value={yLabel} onChange={(e) => setYLabel(e.target.value)} />
        </div>
      </div>
      <Button onClick={handleCalculate} className="w-full">Calculate</Button>

      {error && <div className="text-destructive">{error}</div>}

      {result && (
        <Card>
            <CardHeader><CardTitle>Results</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <p><strong>Regression Equation:</strong> Y = {result.slope.toFixed(4)}X + {result.intercept.toFixed(4)}</p>
                <p><strong>Slope (β₁):</strong> {result.slope.toFixed(4)}</p>
                <p><strong>Intercept (β₀):</strong> {result.intercept.toFixed(4)}</p>
                <p><strong>R-squared (R²):</strong> {result.rSquared.toFixed(4)}</p>
                <p><strong>Correlation (r):</strong> {result.correlation.toFixed(4)}</p>
                <p><strong>Standard Error:</strong> {result.standardError.toFixed(4)}</p>
                <div className="mt-4">
                  <Scatter options={chartOptions} data={chartData as any} />
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
