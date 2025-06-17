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

export function PolynomialRegressionForm() {
    const [xValues, setXValues] = useState("");
    const [yValues, setYValues] = useState("");
    const [degree, setDegree] = useState("2");
    const [result, setResult] = useState<MultipleRegressionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = () => {
        setError(null);
        setResult(null);
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
        scales: { x: { title: { display: true, text: 'X' } }, y: { title: { display: true, text: 'Y' } } },
        plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Polynomial Regression' } },
        sorted: false
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="xValuesPoly">X Values</Label>
                    <Textarea id="xValuesPoly" value={xValues} onChange={(e) => setXValues(e.target.value)} placeholder="Enter X values" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="yValuesPoly">Y Values</Label>
                    <Textarea id="yValuesPoly" value={yValues} onChange={(e) => setYValues(e.target.value)} placeholder="Enter Y values" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="degree">Polynomial Degree</Label>
                <Input id="degree" type="number" value={degree} onChange={(e) => setDegree(e.target.value)} />
            </div>

            <Button onClick={handleCalculate} className="w-full">Calculate</Button>

            {error && <div className="text-destructive">{error}</div>}

            {result && (
                <Card>
                    <CardHeader><CardTitle>Results</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p><strong>R-squared:</strong> {result.rSquared.toFixed(4)}</p>
                            <p><strong>Adjusted R-squared:</strong> {result.adjustedRSquared.toFixed(4)}</p>
                        </div>
                        <div className="mt-4">
                            <Scatter options={chartOptions} data={chartData as any} />
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Term</TableHead>
                                    <TableHead>Coefficient</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.coefficients.map((coef, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{i === 0 ? 'Intercept' : `X^${i}`}</TableCell>
                                        <TableCell>{coef.toFixed(4)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
