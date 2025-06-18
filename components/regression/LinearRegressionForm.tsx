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
              font: { size: 14, weight: 'bold' }
        },
            grid: {
              color: 'hsl(var(--border))',
            }
      },
      y: {
        title: {
          display: true,
          text: yLabel,
              font: { size: 14, weight: 'bold' }
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
            font: { size: 16, weight: 'bold' }
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
        chartComponent: <Scatter options={chartOptions} data={chartData} />
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
              Select a dataset to automatically populate the fields and see how regression works
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
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('csv-upload')?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const event = { target: { files: [file] } } as any;
                handleFileUpload(event);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Drop your CSV file here, or click to browse</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports .csv and .txt files with comma, space, or tab separation
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="p-2 bg-muted rounded">
                <strong>Two columns:</strong><br/>
                1.2, 2.1<br/>
                2.4, 3.9
              </div>
              <div className="p-2 bg-muted rounded">
                <strong>Two rows:</strong><br/>
                1.2, 2.4, 3.1<br/>
                2.1, 3.9, 6.2
              </div>
              <div className="p-2 bg-muted rounded">
                <strong>Format:</strong><br/>
                X values, Y values<br/>
                {dataFormat} separated
              </div>
            </div>
          </div>
          <input
            id="csv-upload"
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="data-format" className="text-sm">Format:</Label>
              <Select onValueChange={setDataFormat} defaultValue={dataFormat}>
                <SelectTrigger className="w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comma">Comma (,)</SelectItem>
                  <SelectItem value="space">Space ( )</SelectItem>
                  <SelectItem value="tab">Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

        <div className="flex items-center justify-center mb-4">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={inputMethod === 'manual' ? 'default' : 'ghost'}
              onClick={() => setInputMethod('manual')}
              size="sm"
            >
              Manual Entry
            </Button>
            <Button
              variant={inputMethod === 'paste' ? 'default' : 'ghost'}
              onClick={() => setInputMethod('paste')}
              size="sm"
            >
              Paste Data
            </Button>
          </div>
        </div>

        {inputMethod === 'manual' ? (
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
        ) : (
          <div className="space-y-2">
            <Label htmlFor="pasteData">Paste Your Data</Label>
            <Textarea
              id="pasteData"
              placeholder={`Paste data in ${dataFormat === 'comma' ? 'comma' : dataFormat === 'space' ? 'space' : 'tab'} separated format:

Two columns format:
1.2${dataFormat === 'comma' ? ',' : dataFormat === 'space' ? ' ' : '\t'}2.1
2.4${dataFormat === 'comma' ? ',' : dataFormat === 'space' ? ' ' : '\t'}3.9
3.1${dataFormat === 'comma' ? ',' : dataFormat === 'space' ? ' ' : '\t'}6.2

Two rows format:
1.2${dataFormat === 'comma' ? ',' : dataFormat === 'space' ? ' ' : '\t'}2.4${dataFormat === 'comma' ? ',' : dataFormat === 'space' ? ' ' : '\t'}3.1
2.1${dataFormat === 'comma' ? ',' : dataFormat === 'space' ? ' ' : '\t'}3.9${dataFormat === 'comma' ? ',' : dataFormat === 'space' ? ' ' : '\t'}6.2`}
              rows={8}
              onChange={(e) => handlePasteData(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Data will be automatically parsed when you paste it here
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {xValues && yValues && (
              <span>
                {parseInput(xValues).length} data points ready
              </span>
            )}
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
    </div>
  );
}
