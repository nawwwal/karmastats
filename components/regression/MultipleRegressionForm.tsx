'use client';

import { useState } from "react";
import { multipleRegression, MultipleRegressionResult } from "@/backend/regression.multiple";
import { Button, NeuomorphicButton } from "@/components/ui/button";
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

// Dynamically import Chart.js components
const Scatter = dynamic(() => import("react-chartjs-2").then((mod) => mod.Scatter), { ssr: false });
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), { ssr: false });

// Chart.js registration (only on client side)
if (typeof window !== "undefined") {
  import("chart.js").then((ChartJS) => {
    ChartJS.Chart.register(
      ChartJS.CategoryScale,
      ChartJS.LinearScale,
      ChartJS.PointElement,
      ChartJS.LineElement,
      ChartJS.BarElement,
      ChartJS.Title,
      ChartJS.Tooltip,
      ChartJS.Legend
    );
  });
}

const parseMatrixInput = (input: string): { y: number[], X: number[][] } => {
    const rows = input.trim().split('\n').map(row => row.split(/[\s,]+/).map(Number));
    const y = rows.map(row => row[0]);
    const X = rows.map(row => row.slice(1));
    return { y, X };
}

const sampleDatasets = {
  housingPrices: {
    name: "Housing Prices (Area, Bedrooms → Price)",
    data: `250000, 1200, 2
300000, 1500, 3
180000, 900, 1
350000, 1800, 4
220000, 1100, 2
450000, 2200, 5
280000, 1300, 3
320000, 1600, 3
200000, 1000, 2
380000, 1900, 4
260000, 1250, 2
400000, 2000, 4
190000, 950, 1
340000, 1700, 3
290000, 1400, 3`,
    variables: "Area (sq ft), Bedrooms"
  },
  studentPerformance: {
    name: "Student Performance (Study Hours, Sleep → Test Score)",
    data: `85, 8, 7
72, 5, 6
91, 10, 8
68, 4, 5
88, 9, 7
76, 6, 6
94, 11, 8
63, 3, 4
82, 7, 7
79, 6, 6
87, 8, 8
71, 5, 5
93, 10, 9
66, 4, 5
89, 9, 7`,
    variables: "Study Hours, Sleep Hours"
  },
  salesPerformance: {
    name: "Sales Performance (Ads, Experience → Sales)",
    data: `120, 10, 3
89, 6, 1
145, 15, 5
72, 4, 1
134, 12, 4
98, 8, 2
156, 18, 6
81, 5, 1
127, 11, 3
103, 9, 2
149, 16, 5
85, 6, 1
138, 13, 4
95, 7, 2
142, 14, 4`,
    variables: "Ad Spend ($1000s), Experience (years)"
  }
};

interface MultipleRegressionFormProps {
  onResultsChange?: (results: any) => void;
}

export function MultipleRegressionForm({ onResultsChange }: MultipleRegressionFormProps) {
    const [dataMatrix, setDataMatrix] = useState(sampleDatasets.housingPrices.data);
    const [variableNames, setVariableNames] = useState(sampleDatasets.housingPrices.variables);
    const [result, setResult] = useState<MultipleRegressionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadSampleData = (datasetKey: string) => {
        const dataset = sampleDatasets[datasetKey as keyof typeof sampleDatasets];
        if (dataset) {
            setDataMatrix(dataset.data);
            setVariableNames(dataset.variables);
            setError(null);
            setResult(null);
            onResultsChange?.(null);
        }
    };

    const clearData = () => {
        setDataMatrix("");
        setVariableNames("");
        setError(null);
        setResult(null);
        onResultsChange?.(null);
    };

    const handleCalculate = () => {
        setError(null);
        setResult(null);
        onResultsChange?.(null);

        try {
            const { y, X } = parseMatrixInput(dataMatrix);
            const regressionResult = multipleRegression(y, X);

            if ("error" in regressionResult) {
                setError(regressionResult.error);
            } else {
                setResult(regressionResult);

                // Create chart data for visualization
                const chartData = {
                    datasets: [
                        {
                            label: "Actual vs Predicted",
                            data: regressionResult.y.map((y, i) => ({
                                x: y,
                                y: regressionResult.predictedY[i]
                            })),
                            backgroundColor: "hsl(var(--primary) / 0.6)",
                            borderColor: "hsl(var(--primary))",
                            pointRadius: 6,
                            pointHoverRadius: 8,
                        },
                        {
                            label: "Perfect Prediction Line",
                            data: [
                                { x: Math.min(...regressionResult.y), y: Math.min(...regressionResult.y) },
                                { x: Math.max(...regressionResult.y), y: Math.max(...regressionResult.y) },
                            ],
                            borderColor: "hsl(var(--secondary))",
                            borderWidth: 2,
                            pointRadius: 0,
                            type: "line" as const,
                            fill: false,
                            showLine: true,
                        },
                    ],
                };

                const residualsData = {
                    datasets: [
                        {
                            label: "Residuals vs Predicted",
                            data: regressionResult.predictedY.map((pred, i) => ({
                                x: pred,
                                y: regressionResult.residuals[i]
                            })),
                            backgroundColor: "hsl(var(--warning) / 0.6)",
                            borderColor: "hsl(var(--warning))",
                            pointRadius: 5,
                        },
                    ],
                };

                const coefficientsData = {
                    labels: ['Intercept', ...variableNames.split(',').map(name => name.trim())],
                    datasets: [
                        {
                            label: "Coefficient Values",
                            data: regressionResult.coefficients,
                            backgroundColor: [
                                "hsl(var(--primary) / 0.6)",
                                "hsl(var(--secondary) / 0.6)",
                                "hsl(var(--accent) / 0.6)",
                                "hsl(var(--muted) / 0.6)",
                                "hsl(var(--warning) / 0.6)",
                            ],
                            borderColor: [
                                "hsl(var(--primary))",
                                "hsl(var(--secondary))",
                                "hsl(var(--accent))",
                                "hsl(var(--muted))",
                                "hsl(var(--warning))",
                            ],
                            borderWidth: 1,
                        },
                    ],
                };

                const chartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "top" as const },
                        title: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context: any) {
                                    if (context.dataset.label === "Actual vs Predicted") {
                                        return `Actual: ${context.parsed.x.toFixed(2)}, Predicted: ${context.parsed.y.toFixed(2)}`;
                                    }
                                    if (context.dataset.label === "Residuals vs Predicted") {
                                        return `Predicted: ${context.parsed.x.toFixed(2)}, Residual: ${context.parsed.y.toFixed(2)}`;
                                    }
                                    return context.dataset.label + ': ' + context.parsed.y.toFixed(4);
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "Actual Values" },
                            type: "linear" as const,
                        },
                        y: {
                            title: { display: true, text: "Predicted Values" },
                        },
                    },
                };

                const residualsOptions = {
                    ...chartOptions,
                    scales: {
                        x: {
                            title: { display: true, text: "Predicted Values" },
                            type: "linear" as const,
                        },
                        y: {
                            title: { display: true, text: "Residuals" },
                        },
                    },
                };

                const coefficientsOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context: any) {
                                    return `${context.label}: ${context.parsed.y.toFixed(4)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "Variables" },
                        },
                        y: {
                            title: { display: true, text: "Coefficient Value" },
                        },
                    },
                };

                // Multiple visualization tabs
                const MultipleCharts = () => {
                    const [activeChart, setActiveChart] = useState<'predicted' | 'residuals' | 'coefficients'>('predicted');

                    return (
                        <div className="space-y-4">
                            <div className="flex gap-2 justify-center">
                                <Button
                                    variant={activeChart === 'predicted' ? "default" : "outline"}
                                    onClick={() => setActiveChart('predicted')}
                                    size="sm"
                                >
                                    Actual vs Predicted
                                </Button>
                                <Button
                                    variant={activeChart === 'residuals' ? "default" : "outline"}
                                    onClick={() => setActiveChart('residuals')}
                                    size="sm"
                                >
                                    Residuals Plot
                                </Button>
                                <Button
                                    variant={activeChart === 'coefficients' ? "default" : "outline"}
                                    onClick={() => setActiveChart('coefficients')}
                                    size="sm"
                                >
                                    Coefficients
                                </Button>
                            </div>
                            <div className="h-[450px]">
                                {activeChart === 'predicted' && (
                                    <Scatter data={chartData as any} options={chartOptions} />
                                )}
                                {activeChart === 'residuals' && (
                                    <Scatter data={residualsData as any} options={residualsOptions} />
                                )}
                                {activeChart === 'coefficients' && (
                                    <Bar data={coefficientsData} options={coefficientsOptions} />
                                )}
                            </div>
                        </div>
                    );
                };

                onResultsChange?.({
                    ...regressionResult,
                    chartData,
                    chartComponent: <MultipleCharts />
                });
                // Scroll to top to show results

            }
        } catch (e: any) {
            setError("Invalid data format. Please check your input.");
        }
    };

    const varNames = ['Intercept', ...variableNames.split(',').map(name => name.trim())];

    return (
        <div className="space-y-6">
            {/* Sample Data Selector */}
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Try Sample Datasets
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Select onValueChange={loadSampleData}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a sample dataset to get started..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(sampleDatasets).map(([key, dataset]) => (
                                    <SelectItem key={key} value={key}>
                                        {dataset.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Select a dataset to explore multiple variable relationships
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Your Data */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Your Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('csv-upload-multiple')?.click()}
                    >
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="font-medium mb-2">Drop your CSV file here, or click to browse</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Format: Y, X1, X2, X3... (dependent variable first, then independent variables)
                        </p>
                        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                            <strong>Example:</strong><br/>
                            250000, 1200, 2<br/>
                            300000, 1500, 3<br/>
                            180000, 900, 1
                        </div>
                    </div>
                    <input
                        id="csv-upload-multiple"
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                    />

                    <div className="mt-4 flex items-center justify-between">
                        <Button variant="outline" onClick={clearData} size="sm">
                            <Shuffle className="h-4 w-4 mr-2" />
                            Clear All Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Data Input */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="variableNames">Variable Names (comma-separated for X variables)</Label>
                    <Input
                        id="variableNames"
                        value={variableNames}
                        onChange={(e) => setVariableNames(e.target.value)}
                        placeholder="e.g., Area (sq ft), Bedrooms"
                    />
                    <p className="text-xs text-muted-foreground">
                        Names for the independent variables (predictors)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataMatrix">Data Matrix (Y, X1, X2, ... format)</Label>
                    <Textarea
                        id="dataMatrix"
                        value={dataMatrix}
                        onChange={(e) => setDataMatrix(e.target.value)}
                        placeholder="Format: Y, X1, X2, X3...
Example:
250000, 1200, 2
300000, 1500, 3
180000, 900, 1"
                        rows={8}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Each row: dependent variable (Y) followed by independent variables (X1, X2, ...)
                    </p>
                </div>

                <div className="flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">
                        {dataMatrix.trim() && (
                            <span>
                                {dataMatrix.trim().split('\n').length} data points ready
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <NeuomorphicButton onClick={handleCalculate} className="w-full" size="xxl">
                Calculate Multiple Regression
            </NeuomorphicButton>

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
        </div>
    );
}
