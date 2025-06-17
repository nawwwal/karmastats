'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { multipleRegression, MultipleRegressionResult } from "@/lib/regression";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function parseColumnInput(input: string): number[][] {
  // Split by lines, then by comma/tab/space
  const rows = input
    .split(/\n|\r/)
    .map((row) => row.trim())
    .filter((row) => row.length > 0);
  return rows.map((row) =>
    row
      .split(/[\s,\t]+/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map(Number)
      .filter((v) => !isNaN(v))
  );
}

function parseVectorInput(input: string): number[] {
  return input
    .split(/[\s,\t\n\r]+/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .map(Number)
    .filter((v) => !isNaN(v));
}

export function MultipleRegressionTab() {
  const [yInput, setYInput] = useState("");
  const [xInput, setXInput] = useState("");
  const [result, setResult] = useState<MultipleRegressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState<'predicted' | 'residuals'>("predicted");

  const handleCalculate = () => {
    const yVals = parseVectorInput(yInput);
    const xRows = parseColumnInput(xInput);
    // Transpose to get columns as variables
    const xMatrix = xRows[0]?.length > 0 ? xRows : [];
    // If user pasted columns, transpose to rows
    let X: number[][] = [];
    if (xMatrix.length > 0 && xMatrix[0].length > 1) {
      // If more rows than columns, assume rows are observations
      if (xMatrix.length === yVals.length) {
        X = xMatrix;
      } else if (xMatrix[0].length === yVals.length) {
        // If columns are observations, transpose
        X = xMatrix[0].map((_, colIdx) => xMatrix.map(row => row[colIdx]));
      }
    }
    if (!X.length || X.length !== yVals.length) {
      setError("Number of X rows must match number of Y values.");
      setResult(null);
      return;
    }
    const res = multipleRegression(yVals, X);
    if ("error" in res) {
      setError(res.error);
      setResult(null);
    } else {
      setResult(res);
      setError(null);
    }
  };

  // Chart data
  const predictedVsActualData = result
    ? {
        datasets: [
          {
            label: "Predicted vs Actual",
            data: result.y.map((y, i) => ({ x: y, y: result.predictedY[i] })),
            backgroundColor: "hsl(var(--secondary) / 0.6)",
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: "Identity Line",
            data: [
              { x: Math.min(...result.y), y: Math.min(...result.y) },
              { x: Math.max(...result.y), y: Math.max(...result.y) },
            ],
            borderColor: "hsl(var(--primary))",
            borderWidth: 2,
            pointRadius: 0,
            type: "line" as const,
            fill: false,
            showLine: true,
          },
        ],
      }
    : undefined;

  const residualsData = result
    ? {
        datasets: [
          {
            label: "Residuals vs Predicted",
            data: result.predictedY.map((yhat, i) => ({ x: yhat, y: result.residuals[i] })),
            backgroundColor: "hsl(var(--warning) / 0.6)",
            pointRadius: 6,
            showLine: false,
          },
        ],
      }
    : undefined;

  const chartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: showChart === 'predicted' ? "Actual Y" : "Predicted Y" },
        type: "linear",
        position: "bottom",
      },
      y: {
        title: { display: true, text: showChart === 'predicted' ? "Predicted Y" : "Residuals" },
      },
    },
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 mb-4">
        <h2 className="heading-2 mb-4">Multiple Regression</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
              <Label htmlFor="xValues">X Values (Independent Variables)</Label>
              <Textarea
                id="xValues"
                value={xInput}
                onChange={(e) => setXInput(e.target.value)}
                placeholder={
                  "Enter X values as columns (one row per observation, columns separated by comma, tab, or space)\nExample:\n23, 1.2, 5\n45, 2.1, 7\n..."
                }
              />
            </div>
            <Button onClick={handleCalculate} className="w-full">
              Calculate Multiple Regression
            </Button>
            {error && <div className="error-text mt-2">{error}</div>}
          </div>
          {result && (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Coefficients (Intercept, X₁, X₂, ...):</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.coefficients.map((coef, i) => (
                    <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {coef.toFixed(4)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold">R²:</span> {result.rSquared.toFixed(4)}
              </div>
              <div>
                <span className="font-semibold">Adjusted R²:</span> {result.adjustedRSquared.toFixed(4)}
              </div>
              <div>
                <span className="font-semibold">Standard Errors:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.stdErrors.map((se, i) => (
                    <span key={i} className="bg-warning/10 text-warning px-2 py-1 rounded">
                      {se.toFixed(4)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold">t-Statistics:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.tStats.map((t, i) => (
                    <span key={i} className="bg-success/10 text-success px-2 py-1 rounded">
                      {t.toFixed(4)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold">p-Values:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.pValues.map((p, i) => (
                    <span key={i} className="bg-destructive/10 text-destructive px-2 py-1 rounded">
                      {p.toExponential(2)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold">F-statistic:</span> {result.F.toFixed(4)}
              </div>
              <div>
                <span className="font-semibold">F p-value:</span> {result.fPValue.toExponential(2)}
              </div>
            </div>
          )}
        </div>
      </Card>
      {result && (
        <Card className="p-6">
          <div className="flex gap-4 mb-4">
            <Button
              variant={showChart === 'predicted' ? "default" : "secondary"}
              onClick={() => setShowChart('predicted')}
            >
              Predicted vs Actual
            </Button>
            <Button
              variant={showChart === 'residuals' ? "default" : "secondary"}
              onClick={() => setShowChart('residuals')}
            >
              Residuals Plot
            </Button>
          </div>
          <div className="h-[400px]">
            {showChart === 'predicted' && predictedVsActualData && (
              <Scatter data={predictedVsActualData as any} options={chartOptions} />
            )}
            {showChart === 'residuals' && residualsData && (
              <Scatter data={residualsData as any} options={chartOptions} />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
