"use client";

import { useCycle, useRootClick } from "@/hooks/use-number-flow";
import { NumberFlowDisplay } from "@/components/ui/number-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { Activity, BarChart3, Calculator, TrendingUp } from "lucide-react";

const sampleSizes = [543, 12000, 3200, 856, 1024];
const percentages = [85.3, 92.1, 78.6, 95.8];
const effectSizes = [0.3, 0.8, 1.2, 0.15, 2.4];
const pValues = [0.001, 0.023, 0.045, 0.000001];

export default function NumberFlowDemoPage() {
  const [sampleSize, cycleSampleSize] = useCycle(sampleSizes, 543);
  const [percentage, cyclePercentage] = useCycle(percentages, 85.3);
  const [effectSize, cycleEffectSize] = useCycle(effectSizes, 0.3);
  const [pValue, cyclePValue] = useCycle(pValues, 0.001);

  // Click anywhere to cycle all values
  useRootClick(() => {
    cycleSampleSize();
    cyclePercentage();
    cycleEffectSize();
    cyclePValue();
  });

  return (
    <ToolPageWrapper
      title="NumberFlow Animation Demo"
      description="Interactive demonstration of animated number transitions in statistical results"
      lastModified="2024-01-15"
    >
      <div className="space-y-8">
        {/* Instructions */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Interactive Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Click anywhere on the page to cycle through different statistical values and see the smooth number animations in action.
              This demonstrates how NumberFlow enhances the user experience in statistical applications.
            </p>
          </CardContent>
        </Card>

        {/* Sample Size Calculations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Sample Size Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Required Sample Size</p>
                <div className="text-3xl font-bold text-primary">
                  <NumberFlowDisplay
                    value={sampleSize}
                    format={{ notation: "standard" }}
                    className="text-3xl font-bold"
                  />
                </div>
                <Badge variant="outline">Participants</Badge>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Statistical Power</p>
                <div className="text-3xl font-bold text-secondary">
                  <NumberFlowDisplay
                    value={percentage}
                    suffix="%"
                    format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                    className="text-3xl font-bold"
                  />
                </div>
                <Badge variant="outline">Power</Badge>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Effect Size (Cohen's d)</p>
                <div className="text-3xl font-bold text-accent">
                  <NumberFlowDisplay
                    value={effectSize}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                    className="text-3xl font-bold"
                  />
                </div>
                <Badge variant="outline">
                  {effectSize < 0.5 ? "Small" : effectSize < 0.8 ? "Medium" : "Large"} Effect
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">P-Value</p>
                <div className="text-3xl font-bold text-destructive">
                  <NumberFlowDisplay
                    value={pValue}
                    format={{ notation: "scientific", maximumSignificantDigits: 3 }}
                    className="text-3xl font-bold"
                  />
                </div>
                <Badge variant={pValue < 0.05 ? "default" : "secondary"}>
                  {pValue < 0.05 ? "Significant" : "Not Significant"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regression Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Regression Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">R-squared</p>
                <div className="text-2xl font-bold text-primary">
                  <NumberFlowDisplay
                    value={percentage / 100}
                    format={{ style: "percent", minimumFractionDigits: 1 }}
                    className="text-2xl font-bold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Variance Explained</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">F-Statistic</p>
                <div className="text-2xl font-bold text-secondary">
                  <NumberFlowDisplay
                    value={sampleSize / 10}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                    className="text-2xl font-bold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Model Significance</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Observations</p>
                <div className="text-2xl font-bold text-accent">
                  <NumberFlowDisplay
                    value={Math.round(sampleSize * 1.5)}
                    format={{ notation: "compact" }}
                    className="text-2xl font-bold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Data Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disease Modeling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Epidemiological Modeling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Peak Infections</p>
                <div className="text-2xl font-bold text-primary">
                  <NumberFlowDisplay
                    value={sampleSize * 50}
                    format={{ notation: "compact" }}
                    className="text-2xl font-bold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Maximum Daily Cases</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">R₀ (Reproduction Number)</p>
                <div className="text-2xl font-bold text-secondary">
                  <NumberFlowDisplay
                    value={effectSize + 1}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                    className="text-2xl font-bold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Transmission Rate</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                <div className="text-2xl font-bold text-accent">
                  <NumberFlowDisplay
                    value={sampleSize * 500}
                    format={{ notation: "compact" }}
                    className="text-2xl font-bold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Cumulative Count</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Herd Immunity Threshold</p>
                <div className="text-2xl font-bold text-destructive">
                  <NumberFlowDisplay
                    value={percentage}
                    suffix="%"
                    format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                    className="text-2xl font-bold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Population Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={cycleSampleSize} variant="outline">
                Cycle Sample Size
              </Button>
              <Button onClick={cyclePercentage} variant="outline">
                Cycle Percentage
              </Button>
              <Button onClick={cycleEffectSize} variant="outline">
                Cycle Effect Size
              </Button>
              <Button onClick={cyclePValue} variant="outline">
                Cycle P-Value
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageWrapper>
  );
}
