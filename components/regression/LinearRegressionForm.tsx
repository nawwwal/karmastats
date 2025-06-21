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
import { FieldPopover } from "@/components/ui/field-popover";
import { getFieldExplanation } from "@/lib/field-explanations";
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
  const [dataFormat, setDataFormat] = useState('comma');
  const [inputMethod, setInputMethod] = useState('manual');

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

      // Create enhanced chart data with better interactions
      const chartData = {
    datasets: [
      {
        label: "Data Points",
            data: regressionResult.xValues.map((val, i) => ({ x: val, y: regressionResult.yValues[i] })),
            backgroundColor: "hsl(var(--primary) / 0.7)",
            borderColor: "hsl(var(--primary))",
            borderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            type: 'scatter' as const,
      },
      {
        label: "Regression Line",
            data: regressionResult.xValues.map((val) => ({
              x: val,
              y: regressionResult.intercept + regressionResult.slope * val
            })),
        type: 'line' as const,
            borderColor: "hsl(var(--secondary))",
            backgroundColor: "hsl(var(--secondary) / 0.1)",
            borderWidth: 3,
        fill: false,
        pointRadius: 0,
            pointHoverRadius: 0,
            tension: 0,
      },
    ],
      };

  const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index' as const,
        },
    scales: {
      x: {
        title: {
          display: true,
          text: xLabel,
              font: { size: 14, weight: 'bold' as const }
        },
            grid: {
              color: 'hsl(var(--border))',
            }
      },
      y: {
        title: {
          display: true,
          text: yLabel,
              font: { size: 14, weight: 'bold' as const }
        },
            grid: {
              color: 'hsl(var(--border))',
            }
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
            labels: {
              usePointStyle: true,
              font: { size: 12 }
            }
      },
      title: {
        display: true,
            text: `${yLabel} vs ${xLabel}`,
            font: { size: 16, weight: 'bold' as const }
          },
          tooltip: {
            backgroundColor: 'hsl(var(--popover))',
            titleColor: 'hsl(var(--popover-foreground))',
            bodyColor: 'hsl(var(--popover-foreground))',
            borderColor: 'hsl(var(--border))',
            borderWidth: 1,
            callbacks: {
              title: function(context: any) {
                return `${xLabel}: ${context[0].parsed.x}`;
              },
              label: function(context: any) {
                const dataset = context.dataset;
                if (dataset.label === 'Data Points') {
                  return `${yLabel}: ${context.parsed.y.toFixed(3)}`;
                } else {
                  return `Predicted ${yLabel}: ${context.parsed.y.toFixed(3)}`;
                }
              },
              afterBody: function(context: any) {
                if (context[0].dataset.label === 'Data Points') {
                  const predicted = regressionResult.intercept + regressionResult.slope * context[0].parsed.x;
                  const residual = context[0].parsed.y - predicted;
                  return [`Predicted: ${predicted.toFixed(3)}`, `Residual: ${residual.toFixed(3)}`];
                }
                return [];
              }
            }
          }
        },
      };

      // Pass result with chart data to parent
      onResultsChange?.({
        ...regressionResult,
        chartData,
        chartOptions
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          // Parse CSV format: assume two columns (X, Y) or two rows
          const lines = text.trim().split('\n');
          if (lines.length === 2) {
            // Two rows format
            const row1 = lines[0].split(dataFormat === 'comma' ? ',' : dataFormat === 'space' ? /\s+/ : '\t');
            const row2 = lines[1].split(dataFormat === 'comma' ? ',' : dataFormat === 'space' ? /\s+/ : '\t');
            setXValues(row1.map(v => v.trim()).join(', '));
            setYValues(row2.map(v => v.trim()).join(', '));
          } else {
            // Two columns format
            const xVals: string[] = [];
            const yVals: string[] = [];
            lines.forEach(line => {
              const cols = line.split(dataFormat === 'comma' ? ',' : dataFormat === 'space' ? /\s+/ : '\t');
              if (cols.length >= 2) {
                xVals.push(cols[0].trim());
                yVals.push(cols[1].trim());
              }
            });
            setXValues(xVals.join(', '));
            setYValues(yVals.join(', '));
          }
          setError(null);
          setResult(null);
          onResultsChange?.(null);
        } catch (err) {
          setError("Error parsing file. Please check the format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteData = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length === 2) {
        // Two rows format
        setXValues(lines[0]);
        setYValues(lines[1]);
      } else {
        // Two columns format
        const xVals: string[] = [];
        const yVals: string[] = [];
        lines.forEach(line => {
          const cols = line.split(dataFormat === 'comma' ? ',' : dataFormat === 'space' ? /\s+/ : '\t');
          if (cols.length >= 2) {
            xVals.push(cols[0].trim());
            yVals.push(cols[1].trim());
          }
        });
        setXValues(xVals.join(', '));
        setYValues(yVals.join(', '));
      }
      setError(null);
      setResult(null);
      onResultsChange?.(null);
    } catch (err) {
      setError("Error parsing pasted data. Please check the format.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Linear Regression Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Method Selection */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Input Method</Label>
              <Select value={inputMethod} onValueChange={setInputMethod}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="file">File Upload</SelectItem>
                  <SelectItem value="sample">Sample Datasets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-chart"
                checked={showChart}
                onCheckedChange={setShowChart}
              />
              <Label htmlFor="show-chart" className="text-sm">Show Chart</Label>
            </div>
          </div>

          {inputMethod === 'file' && (
            <div className="space-y-4 p-4 border border-dashed border-muted-foreground/25 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data Format</Label>
                <Select value={dataFormat} onValueChange={setDataFormat}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma">Comma Separated (x,y)</SelectItem>
                    <SelectItem value="space">Space/Tab Separated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">CSV, TXT files (MAX. 1MB)</p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          )}

          {inputMethod === 'sample' && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Choose Sample Dataset</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(sampleDatasets).map(([key, dataset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => loadSampleData(key)}
                    className="justify-start h-auto p-4 text-left"
                  >
                    <div>
                      <div className="font-medium text-sm">{dataset.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {dataset.xLabel} → {dataset.yLabel}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={clearData}
                className="w-full"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Clear Data
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Data Input Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldPopover
                {...getFieldExplanation('regression', 'xValues')}
                side="top"
              >
                <Label htmlFor="x-values" className="text-sm font-medium">Independent Variable (X)</Label>
              </FieldPopover>
              <Textarea
                id="x-values"
                placeholder="Enter X values (comma or space separated): 1, 2, 3, 4, 5"
                value={xValues}
                onChange={(e) => setXValues(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <FieldPopover
                {...getFieldExplanation('regression', 'xLabel')}
                side="top"
              >
                <Label htmlFor="x-label" className="text-sm font-medium">X-Axis Label</Label>
              </FieldPopover>
              <Input
                id="x-label"
                placeholder="e.g., Study Hours, Age, Temperature"
                value={xLabel}
                onChange={(e) => setXLabel(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <FieldPopover
                {...getFieldExplanation('regression', 'yValues')}
                side="top"
              >
                <Label htmlFor="y-values" className="text-sm font-medium">Dependent Variable (Y)</Label>
              </FieldPopover>
              <Textarea
                id="y-values"
                placeholder="Enter Y values (comma or space separated): 2.1, 3.9, 6.2, 7.8, 10.1"
                value={yValues}
                onChange={(e) => setYValues(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <FieldPopover
                {...getFieldExplanation('regression', 'yLabel')}
                side="top"
              >
                <Label htmlFor="y-label" className="text-sm font-medium">Y-Axis Label</Label>
              </FieldPopover>
              <Input
                id="y-label"
                placeholder="e.g., Test Score, Income, Ice Cream Sales"
                value={yLabel}
                onChange={(e) => setYLabel(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleCalculate}
          className="w-full"
          size="lg"
          disabled={!xValues.trim() || !yValues.trim()}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Calculate Linear Regression
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results Visualization */}
        {result && showChart && 'chartData' in result && (
          <div className="w-full h-[400px] p-4 border rounded-lg bg-card">
            <Scatter data={result.chartData} options={result.chartOptions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
