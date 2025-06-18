'use client';

import { useState } from "react";
import { linearRegression, LinearRegressionResult } from "@/lib/regression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, BarChart3, Shuffle } from "lucide-react";

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

interface LinearRegressionFormProps {
  onResultsChange?: (results: LinearRegressionResult | null) => void;
}

const sampleDatasets = {
  studyHours: {
    name: "Study Hours vs Test Score",
    x: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
    y: "2.1, 3.9, 6.2, 7.8, 10.1, 12.2, 13.8, 16.1, 18.2, 20.0",
    xLabel: "Study Hours",
    yLabel: "Test Score"
  },
  heightWeight: {
    name: "Height vs Weight",
    x: "150, 155, 160, 165, 170, 175, 180, 185, 190, 195",
    y: "50, 55, 60, 65, 70, 75, 80, 85, 90, 95",
    xLabel: "Height (cm)",
    yLabel: "Weight (kg)"
  },
  ageIncome: {
    name: "Age vs Income",
    x: "25, 30, 35, 40, 45, 50, 55, 60",
    y: "35000, 42000, 50000, 58000, 65000, 72000, 78000, 82000",
    xLabel: "Age (years)",
    yLabel: "Income (USD)"
  },
  temperature: {
    name: "Temperature vs Ice Cream Sales",
    x: "15, 18, 22, 25, 28, 30, 32, 35, 38, 40",
    y: "12, 18, 25, 32, 45, 55, 68, 78, 90, 105",
    xLabel: "Temperature (°C)",
    yLabel: "Ice Cream Sales"
  }
};

export function LinearRegressionForm({ onResultsChange }: LinearRegressionFormProps) {
  const [xValues, setXValues] = useState(sampleDatasets.studyHours.x);
  const [yValues, setYValues] = useState(sampleDatasets.studyHours.y);
  const [xLabel, setXLabel] = useState(sampleDatasets.studyHours.xLabel);
  const [yLabel, setYLabel] = useState(sampleDatasets.studyHours.yLabel);
  const [result, setResult] = useState<LinearRegressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(true);

  const loadSampleData = (datasetKey: string) => {
    const dataset = sampleDatasets[datasetKey as keyof typeof sampleDatasets];
    if (dataset) {
      setXValues(dataset.x);
      setYValues(dataset.y);
      setXLabel(dataset.xLabel);
      setYLabel(dataset.yLabel);
      setError(null);
      setResult(null);
      onResultsChange?.(null);
    }
  };

  const clearData = () => {
    setXValues("");
    setYValues("");
    setXLabel("X");
    setYLabel("Y");
    setError(null);
    setResult(null);
    onResultsChange?.(null);
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    onResultsChange?.(null);

    const parsedX = parseInput(xValues);
    const parsedY = parseInput(yValues);

    const regressionResult = linearRegression(parsedX, parsedY);

    if ("error" in regressionResult) {
      setError(regressionResult.error);
    } else {
      setResult(regressionResult);
      onResultsChange?.(regressionResult);
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
    <div className="space-y-6">
      {/* Sample Data Selector */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Start with Sample Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Choose Sample Dataset</Label>
              <Select onValueChange={loadSampleData}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sample dataset..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sampleDatasets).map(([key, dataset]) => (
                    <SelectItem key={key} value={key}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={clearData} className="flex-1">
                <Shuffle className="h-4 w-4 mr-2" />
                Clear Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Data Input */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="xLabel">X-Axis Label</Label>
            <Input
              id="xLabel"
              value={xLabel}
              onChange={(e) => setXLabel(e.target.value)}
              placeholder="Independent variable name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yLabel">Y-Axis Label</Label>
            <Input
              id="yLabel"
              value={yLabel}
              onChange={(e) => setYLabel(e.target.value)}
              placeholder="Dependent variable name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="xValues">X Values (Independent Variable)</Label>
            <Textarea
              id="xValues"
              value={xValues}
              onChange={(e) => setXValues(e.target.value)}
              placeholder="Enter values separated by comma or space"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Enter numbers separated by commas or spaces
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="yValues">Y Values (Dependent Variable)</Label>
            <Textarea
              id="yValues"
              value={yValues}
              onChange={(e) => setYValues(e.target.value)}
              placeholder="Enter values separated by comma or space"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Must have same number of values as X
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-chart"
              checked={showChart}
              onCheckedChange={setShowChart}
            />
            <Label htmlFor="show-chart">Show visualization</Label>
          </div>
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full" size="lg">
        Calculate Linear Regression
      </Button>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive flex items-center gap-2">
              <span className="text-sm font-medium">Error:</span>
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {result && showChart && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regression Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px]">
              <Scatter options={chartOptions} data={chartData as any} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
