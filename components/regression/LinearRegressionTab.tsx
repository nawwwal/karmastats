'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { linearRegression, LinearRegressionResult } from "@/backend/regression.linear";
import dynamic from "next/dynamic";

// Dynamically import Chart.js to prevent SSR issues
const Line = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
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

function parseInput(input: string): number[] {
  return input
    .split(/[\s,]+/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .map(Number)
    .filter((v) => !isNaN(v));
}

export function LinearRegressionTab() {
  const [xInput, setXInput] = useState("");
  const [yInput, setYInput] = useState("");
  const [xLabel, setXLabel] = useState("");
  const [yLabel, setYLabel] = useState("");
  const [result, setResult] = useState<LinearRegressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResidual, setShowResidual] = useState(false);

  const handleCalculate = () => {
    const xVals = parseInput(xInput);
    const yVals = parseInput(yInput);
    const res = linearRegression(xVals, yVals);
    if ("error" in res) {
      setError(res.error);
      setResult(null);
    } else {
      setResult(res);
      setError(null);
    }
  };

  // Chart data
  const scatterData = result
    ? {
        labels: result.xValues,
        datasets: [
          {
            label: "Data Points",
            data: result.xValues.map((x, i) => ({ x, y: result.yValues[i] })),
            backgroundColor: "hsl(var(--secondary) / 0.6)",
            pointRadius: 6,
            pointHoverRadius: 8,
            type: "scatter" as const,
            showLine: false,
          },
          {
            label: "Regression Line",
            data: [
              { x: Math.min(...result.xValues), y: result.intercept + result.slope * Math.min(...result.xValues) },
              { x: Math.max(...result.xValues), y: result.intercept + result.slope * Math.max(...result.xValues) },
            ],
            borderColor: "hsl(var(--primary))",
            backgroundColor: "hsl(var(--primary) / 0.15)",
            borderWidth: 3,
            pointRadius: 0,
            fill: false,
            type: "line" as const,
            showLine: true,
          },
        ],
      }
    : undefined;

  const residualData = result
    ? {
        labels: result.xValues,
        datasets: [
          {
            label: "Residuals",
            data: result.residuals,
            borderColor: "hsl(var(--warning))",
            backgroundColor: "hsl(var(--warning) / 0.2)",
            pointRadius: 5,
            showLine: false,
            type: "scatter" as const,
          },
        ],
      }
    : undefined;

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: xLabel || "X Values" },
        type: "linear",
        position: "bottom",
      },
      y: {
        title: { display: true, text: yLabel || "Y Values" },
      },
    },
  };

  const residualOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: xLabel || "X Values" },
        type: "linear",
        position: "bottom",
      },
      y: {
        title: { display: true, text: "Residuals" },
      },
    },
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 mb-4">
        <h2 className="text-3xl font-semibold tracking-tight mb-4">Simple Linear Regression</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="xValues">X Values (Independent Variable)</Label>
              <Textarea
                id="xValues"
                value={xInput}
                onChange={(e) => setXInput(e.target.value)}
                placeholder="Enter X values separated by commas, spaces, or new lines"
              />
            </div>
            <div>
              <Label htmlFor="yValues">Y Values (Dependent Variable)</Label>
              <Textarea
                id="yValues"
                value={yInput}
                onChange={(e) => setYInput(e.target.value)}
                placeholder="Enter Y values separated by commas, spaces, or new lines"
              />
            </div>
            <div>
              <Label htmlFor="xLabel">X-Axis Label (optional)</Label>
              <Input id="xLabel" value={xLabel} onChange={(e) => setXLabel(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="yLabel">Y-Axis Label (optional)</Label>
              <Input id="yLabel" value={yLabel} onChange={(e) => setYLabel(e.target.value)} />
            </div>
            <Button onClick={handleCalculate} className="w-full">
              Calculate Linear Regression
            </Button>
            {error && <div className="text-destructive font-medium mt-2">{error}</div>}
          </div>
          {result && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Regression Equation:</div>
                <div>
                  Y = {result.intercept.toFixed(4)} + {result.slope.toFixed(4)} × X
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Slope (β₁):</span> {result.slope.toFixed(4)}
              </div>
              <div>
                <span className="text-sm font-medium">Intercept (β₀):</span> {result.intercept.toFixed(4)}
              </div>
              <div>
                <span className="text-sm font-medium">R²:</span> {result.rSquared.toFixed(4)}
              </div>
              <div>
                <span className="text-sm font-medium">Correlation (r):</span> {result.correlation.toFixed(4)}
              </div>
              <div>
                <span className="text-sm font-medium">Standard Error:</span> {result.standardError.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      </Card>
      {result && (
        <Card className="p-6">
          <div className="flex gap-4 mb-4">
            <Button
              variant={showResidual ? "secondary" : "default"}
              onClick={() => setShowResidual(false)}
            >
              Scatter Plot
            </Button>
            <Button
              variant={showResidual ? "default" : "secondary"}
              onClick={() => setShowResidual(true)}
            >
              Residual Plot
            </Button>
          </div>
          <div className="h-[400px]">
            {!showResidual && scatterData && <Line data={scatterData as any} options={options} />}
            {showResidual && residualData && <Line data={residualData as any} options={residualOptions} />}
          </div>
        </Card>
      )}
    </div>
  );
}
