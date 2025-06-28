'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { linearRegression, LinearRegressionResult } from "@/lib/regression";
import { Button, NeuomorphicButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FieldPopover } from "@/components/ui/field-popover";
import { getFieldExplanation } from "@/lib/field-explanations";
import { Upload, BarChart3, Shuffle, AlertCircle, FileUp } from "lucide-react";

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

const FormSchema = z.object({
  xValues: z.string().min(1, "X values are required"),
  yValues: z.string().min(1, "Y values are required"),
  xLabel: z.string().min(1, "X-axis label is required"),
  yLabel: z.string().min(1, "Y-axis label is required")
});

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
  const [result, setResult] = useState<LinearRegressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(true);
  const [dataFormat, setDataFormat] = useState('comma');
  const [inputMethod, setInputMethod] = useState('manual');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      xValues: sampleDatasets.studyHours.x,
      yValues: sampleDatasets.studyHours.y,
      xLabel: sampleDatasets.studyHours.xLabel,
      yLabel: sampleDatasets.studyHours.yLabel
    }
  });

  const loadSampleData = (datasetKey: string) => {
    const dataset = sampleDatasets[datasetKey as keyof typeof sampleDatasets];
    if (dataset) {
      form.setValue('xValues', dataset.x);
      form.setValue('yValues', dataset.y);
      form.setValue('xLabel', dataset.xLabel);
      form.setValue('yLabel', dataset.yLabel);
      setError(null);
      setResult(null);
      onResultsChange?.(null);
      form.clearErrors();
    }
  };

  const clearData = () => {
    form.reset({
      xValues: "",
      yValues: "",
      xLabel: "X",
      yLabel: "Y"
    });
    setError(null);
    setResult(null);
    onResultsChange?.(null);
  };

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    try {
      setError(null);
      setResult(null);
      onResultsChange?.(null);

      const parsedX = parseInput(data.xValues);
      const parsedY = parseInput(data.yValues);

      if (parsedX.length !== parsedY.length) {
        setError("X and Y values must have the same number of data points");
        return;
      }

      if (parsedX.length < 2) {
        setError("At least 2 data points are required for regression analysis");
        return;
      }

      if (parsedX.some(isNaN) || parsedY.some(isNaN)) {
        setError("All values must be valid numbers");
        return;
      }

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
                text: data.xLabel,
                font: { size: 14, weight: 'bold' as const }
              },
              grid: {
                color: 'hsl(var(--border))',
              }
            },
            y: {
              title: {
                display: true,
                text: data.yLabel,
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
              text: `${data.yLabel} vs ${data.xLabel}`,
              font: { size: 16, weight: 'bold' as const }
            }
          },
        };

        // Pass result with chart data to parent
        onResultsChange?.({
          ...regressionResult,
          chartData,
          chartOptions
        });

        form.clearErrors();
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((error) => {
          if (error.path.length > 0) {
            form.setError(error.path[0] as any, {
              type: 'validation',
              message: error.message,
            });
          }
        });
        setError(`Please check the highlighted fields: ${err.errors.map(e => e.message).join(', ')}`);
      } else {
        setError(err.message || "An error occurred during calculation");
      }
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
            form.setValue('xValues', row1.map(v => v.trim()).join(', '));
            form.setValue('yValues', row2.map(v => v.trim()).join(', '));
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
            form.setValue('xValues', xVals.join(', '));
            form.setValue('yValues', yVals.join(', '));
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

  return (
    <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
      <CardContent className="space-y-8 pt-8">
        {error && (
          <Alert className="border-destructive/20 bg-destructive/10 text-left">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive font-bold text-left">Calculation Error</AlertTitle>
            <AlertDescription className="text-destructive text-left">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload Card */}
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              <span>Import Data from File (Optional)</span>
            </CardTitle>
            <CardDescription>Upload CSV or TXT file with X,Y data pairs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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

              <div
                className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('data-upload')?.click()}
              >
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">CSV, TXT files (MAX. 1MB)</p>
                  </div>
                </div>
                <Input
                  id="data-upload"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Sample Data Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="text-lg">Sample Datasets</CardTitle>
                <CardDescription>Choose from pre-loaded datasets to get started quickly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(sampleDatasets).map(([key, dataset]) => (
                    <Button
                      key={key}
                      type="button"
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
                  type="button"
                  variant="outline"
                  onClick={clearData}
                  className="w-full"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Clear Data
                </Button>
              </CardContent>
            </Card>

            {/* Data Input Section */}
            <Card className="border-primary/20 bg-primary/10 dark:bg-primary/20 dark:border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Data Input
                </CardTitle>
                <CardDescription>Enter your X and Y values for linear regression analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="xValues"
                      render={({ field }) => (
                        <FormItem>
                          <FieldPopover
                            {...getFieldExplanation('regression', 'xValues')}
                            side="top"
                          >
                            <FormLabel>Independent Variable (X)</FormLabel>
                          </FieldPopover>
                          <FormControl>
                            <Textarea
                              placeholder="Enter X values (comma or space separated): 1, 2, 3, 4, 5"
                              className="min-h-[120px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="xLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FieldPopover
                            {...getFieldExplanation('regression', 'xLabel')}
                            side="top"
                          >
                            <FormLabel>X-Axis Label</FormLabel>
                          </FieldPopover>
                          <FormControl>
                            <Input placeholder="e.g., Study Hours, Age, Temperature" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="yValues"
                      render={({ field }) => (
                        <FormItem>
                          <FieldPopover
                            {...getFieldExplanation('regression', 'yValues')}
                            side="top"
                          >
                            <FormLabel>Dependent Variable (Y)</FormLabel>
                          </FieldPopover>
                          <FormControl>
                            <Textarea
                              placeholder="Enter Y values (comma or space separated): 2.1, 3.9, 6.2, 7.8, 10.1"
                              className="min-h-[120px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FieldPopover
                            {...getFieldExplanation('regression', 'yLabel')}
                            side="top"
                          >
                            <FormLabel>Y-Axis Label</FormLabel>
                          </FieldPopover>
                          <FormControl>
                            <Input placeholder="e.g., Test Score, Income, Ice Cream Sales" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-chart"
                    checked={showChart}
                    onCheckedChange={setShowChart}
                  />
                  <Label htmlFor="show-chart" className="text-sm">Show Chart in Results</Label>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <NeuomorphicButton
                type="submit"
                size="xxl"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Calculate Linear Regression
              </NeuomorphicButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
