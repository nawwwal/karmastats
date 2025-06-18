'use client';

import { useState } from "react";
import { polynomialRegression, MultipleRegressionResult } from "@/lib/regression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

const sampleDatasets = {
  growth: {
    name: "Plant Growth Over Time",
    x: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
    y: "2.1, 4.2, 8.1, 14.2, 22.5, 33.8, 48.1, 65.2, 85.5, 109.2",
    xLabel: "Time (weeks)",
    yLabel: "Height (cm)"
  },
  temperature: {
    name: "Chemical Reaction Rate vs Temperature",
    x: "20, 25, 30, 35, 40, 45, 50, 55, 60",
    y: "1.2, 2.1, 3.8, 6.2, 9.5, 14.1, 20.2, 28.5, 39.1",
    xLabel: "Temperature (°C)",
    yLabel: "Reaction Rate"
  },
  trajectory: {
    name: "Projectile Motion",
    x: "0, 1, 2, 3, 4, 5, 6, 7, 8",
    y: "0, 14, 26, 36, 44, 50, 54, 56, 56",
    xLabel: "Time (seconds)",
    yLabel: "Height (meters)"
  }
};

interface PolynomialRegressionFormProps {
  onResultsChange?: (results: any) => void;
}

export function PolynomialRegressionForm({ onResultsChange }: PolynomialRegressionFormProps) {
    const [xValues, setXValues] = useState(sampleDatasets.growth.x);
    const [yValues, setYValues] = useState(sampleDatasets.growth.y);
    const [xLabel, setXLabel] = useState(sampleDatasets.growth.xLabel);
    const [yLabel, setYLabel] = useState(sampleDatasets.growth.yLabel);
    const [degree, setDegree] = useState("2");
    const [result, setResult] = useState<MultipleRegressionResult | null>(null);
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
        const parsedDegree = parseInt(degree, 10);

        if (isNaN(parsedDegree) || parsedDegree < 1) {
            setError("Please enter a valid degree (integer >= 1).");
            return;
        }

        const regressionResult = polynomialRegression(parsedX, parsedY, parsedDegree);

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
            data: result.X.map((val, i) => ({ x: val[0], y: result.y[i] })),
            backgroundColor: "hsl(var(--secondary) / 0.5)",
            type: 'scatter' as const,
          },
          {
            label: `Polynomial Fit (degree ${degree})`,
            data: result.predictedY.map((y, i) => ({ x: result.X[i][0], y })),
            type: 'line' as const,
            borderColor: "hsl(var(--primary))",
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            order: 1
          },
        ],
      } : { datasets: []};

    const chartOptions = {
        scales: {
            x: { title: { display: true, text: xLabel } },
            y: { title: { display: true, text: yLabel } }
        },
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Polynomial Regression' }
        },
        sorted: false
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
                        <Label htmlFor="xValuesPoly">X Values</Label>
                        <Textarea
                            id="xValuesPoly"
                            value={xValues}
                            onChange={(e) => setXValues(e.target.value)}
                            placeholder="Enter X values separated by comma or space"
                            rows={6}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter numbers separated by commas or spaces
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="yValuesPoly">Y Values</Label>
                        <Textarea
                            id="yValuesPoly"
                            value={yValues}
                            onChange={(e) => setYValues(e.target.value)}
                            placeholder="Enter Y values separated by comma or space"
                            rows={6}
                        />
                        <p className="text-xs text-muted-foreground">
                            Must have same number of values as X
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="degree">Polynomial Degree</Label>
                        <Select onValueChange={setDegree} defaultValue={degree}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 (Linear)</SelectItem>
                                <SelectItem value="2">2 (Quadratic)</SelectItem>
                                <SelectItem value="3">3 (Cubic)</SelectItem>
                                <SelectItem value="4">4 (Quartic)</SelectItem>
                                <SelectItem value="5">5 (Quintic)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Higher degrees may lead to overfitting
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <Switch
                            id="show-chart-poly"
                            checked={showChart}
                            onCheckedChange={setShowChart}
                        />
                        <Label htmlFor="show-chart-poly">Show visualization</Label>
                    </div>
                </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
                Calculate Polynomial Regression
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
                        <CardTitle className="text-lg">Polynomial Regression Visualization</CardTitle>
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
