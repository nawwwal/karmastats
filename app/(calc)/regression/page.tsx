"use client";

import React, { useState } from "react";
import { LinearRegressionForm } from "@/components/regression/LinearRegressionForm";
import { MultipleRegressionForm } from "@/components/regression/MultipleRegressionForm";
import { PolynomialRegressionForm } from "@/components/regression/PolynomialRegressionForm";
import { LogisticRegressionForm } from "@/components/regression/LogisticRegressionForm";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, BarChart3, Activity, Target } from "lucide-react";

export default function RegressionPage() {
  const [activeTab, setActiveTab] = useState("linear");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setResults(null);
    setError(null);
    setActiveTab("linear");
  };

  // PDF export removed for MVP

  const tabs = [
    {
      value: "linear",
      label: "Linear",
      icon: TrendingUp,
      description: "Simple linear relationship"
    },
    {
      value: "multiple",
      label: "Multiple",
      icon: BarChart3,
      description: "Multiple variables"
    },
    {
      value: "polynomial",
      label: "Polynomial",
      icon: Activity,
      description: "Non-linear relationships"
    },
    {
      value: "logistic",
      label: "Logistic",
      icon: Target,
      description: "Binary outcomes"
    }
  ];

  const handleResultsChange = (newResults: any) => {
    setResults({ ...newResults, type: activeTab });
  };

  const getEquation = () => {
    if (!results) return '';

    if (results.type === 'linear' && results.slope !== undefined) {
      return `Y = ${results.intercept?.toFixed(4)} + ${results.slope?.toFixed(4)}X`;
    }

    if (results.type === 'polynomial' && results.coefficients) {
      return `Y = ${results.coefficients.map((coef: number, i: number) =>
        i === 0 ? coef.toFixed(4) :
        ` + ${coef.toFixed(4)}X${i > 1 ? `^${i}` : ''}`
      ).join('')}`;
    }

    return 'Equation available after analysis';
  };

  const renderContent = () => (
    <div className="space-y-8">
      <EnhancedTabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <EnhancedTabsList className="grid w-full grid-cols-2 lg:grid-cols-4" variant="modern">
          {tabs.map((tab) => (
            <EnhancedTabsTrigger key={tab.value} value={tab.value} variant="modern">
              <div className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
            </EnhancedTabsTrigger>
          ))}
        </EnhancedTabsList>

        <EnhancedTabsContent value="linear">
          <Card>
            <CardHeader>
              <CardTitle>Simple Linear Regression</CardTitle>
              <CardDescription>
                Analyze the relationship between one independent variable (X)
                and one dependent variable (Y).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LinearRegressionForm onResultsChange={handleResultsChange} />
            </CardContent>
          </Card>
        </EnhancedTabsContent>

        <EnhancedTabsContent value="multiple">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Regression</CardTitle>
              <CardDescription>
                Analyze the relationship between multiple independent variables
                (X₁, X₂, ...) and one dependent variable (Y).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultipleRegressionForm onResultsChange={handleResultsChange} />
            </CardContent>
          </Card>
        </EnhancedTabsContent>

        <EnhancedTabsContent value="polynomial">
          <Card>
            <CardHeader>
              <CardTitle>Polynomial Regression</CardTitle>
              <CardDescription>
                Model a non-linear relationship between the independent
                variable x and the dependent variable y.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PolynomialRegressionForm onResultsChange={handleResultsChange} />
            </CardContent>
          </Card>
        </EnhancedTabsContent>

        <EnhancedTabsContent value="logistic">
          <Card>
            <CardHeader>
              <CardTitle>Logistic Regression</CardTitle>
              <CardDescription>
                Predict a binary outcome (e.g., yes/no, 1/0) from a set of
                independent variables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogisticRegressionForm onResultsChange={handleResultsChange} />
            </CardContent>
          </Card>
        </EnhancedTabsContent>
      </EnhancedTabs>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    const getModelName = () => {
      switch (results.type) {
        case 'linear': return 'Simple Linear Regression';
        case 'multiple': return 'Multiple Regression';
        case 'polynomial': return 'Polynomial Regression';
        case 'logistic': return 'Logistic Regression';
        default: return 'Regression Analysis';
      }
    };

    const getInterpretation = () => {
      const r2 = results.rSquared || 0;
      if (r2 >= 0.7) return { text: "Strong model fit", category: "success" };
      if (r2 >= 0.5) return { text: "Moderate model fit", category: "warning" };
      if (r2 >= 0.3) return { text: "Weak model fit", category: "secondary" };
      return { text: "Poor model fit", category: "error" };
    };

    const interpretation = getInterpretation();

    // Key metrics for enhanced results display
    const keyMetrics: Array<{
      label: string;
      value: any;
      category: 'primary' | 'secondary' | 'statistical' | 'success' | 'warning' | 'critical';
      highlight: boolean;
      format: 'number' | 'percentage' | 'decimal' | 'integer';
    }> = [
      {
        label: 'R-squared',
        value: results.rSquared || 0,
        category: 'primary',
        highlight: true,
        format: 'decimal'
      }
    ];

    if (results.type === 'linear' && results.slope !== undefined) {
      keyMetrics.push({
        label: 'Slope',
        value: results.slope,
        category: 'secondary',
        highlight: false,
        format: 'decimal'
      });
    }

    if (results.intercept !== undefined) {
      keyMetrics.push({
        label: 'Intercept',
        value: results.intercept,
        category: 'secondary',
        highlight: false,
        format: 'decimal'
      });
    }

    return (
      <div className="space-y-8">
        {/* Enhanced Results Display */}
        <EnhancedResultsDisplay
          title={`${getModelName()} Results`}
          subtitle="Statistical Analysis Output"
          results={keyMetrics}
          interpretation={{
            effectSize: interpretation.text,
            recommendations: [
              `Model fit: ${interpretation.text} (R² = ${(results.rSquared || 0).toFixed(3)})`,
              `Explained variance: ${((results.rSquared || 0) * 100).toFixed(1)}% of dependent variable`,
              `Regression equation: ${getEquation()}`
            ],
            assumptions: [
              'Linear relationship between variables',
              'Independence of observations',
              'Homoscedasticity (constant variance)',
              'Normal distribution of residuals'
            ]
          }}
        />

        {/* Model Equation Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="text-lg">Regression Equation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-background/80 p-4 rounded-lg font-mono text-center border">
              {results.type === 'linear' && results.slope !== undefined && (
                <div className="text-lg font-medium">
                  Y = {results.intercept?.toFixed(4)} + {results.slope?.toFixed(4)}X
                </div>
              )}
              {results.type === 'polynomial' && results.coefficients && (
                <div className="text-lg font-medium">
                  Y = {results.coefficients.map((coef: number, i: number) =>
                    i === 0 ? coef.toFixed(4) :
                    ` + ${coef.toFixed(4)}X${i > 1 ? `^${i}` : ''}`
                  ).join('')}
                </div>
              )}
              {(results.type === 'multiple' || results.type === 'logistic') && results.coefficients && (
                <div className="text-sm space-y-1">
                  {results.coefficients.map((coef: number, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <span>{i === 0 ? 'Intercept' : `β${i}`}:</span>
                      <span className="font-bold">{coef.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Visualizations */}
        <AdvancedVisualization
          title="Model Performance Metrics"
          subtitle="Key indicators of regression quality"
          type="comparison"
          data={[
            { label: 'R-Squared', value: results.rSquared || 0 },
            { label: 'Correlation', value: Math.abs(results.correlation || 0) },
            ...(results.coefficients ? results.coefficients.map((coef: number, i: number) => ({
              label: i === 0 ? 'Intercept' : `Coefficient ${i}`,
              value: Math.abs(coef)
            })) : [])
          ].slice(0, 6)} // Limit to 6 items for better visualization
          insights={[
            { key: 'Model Type', value: getModelName(), significance: 'high' as const },
            { key: 'Overall Fit', value: interpretation.text, significance: interpretation.category === 'success' ? 'high' as const : 'medium' as const },
            { key: 'Variance Explained', value: `${((results.rSquared || 0) * 100).toFixed(1)}%`, significance: (results.rSquared || 0) > 0.7 ? 'high' as const : 'medium' as const }
          ]}
        />

        {/* Coefficients Table */}
        {results.coefficients && results.coefficients.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Coefficients</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>Coefficient</TableHead>
                    {results.stdErrors && <TableHead>Std. Error</TableHead>}
                    {results.tStats && <TableHead>t-statistic</TableHead>}
                    {results.pValues && <TableHead>p-value</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.coefficients.map((coef: number, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {i === 0 ? 'Intercept' :
                         results.type === 'polynomial' ? (i === 1 ? 'X' : `X^${i}`) :
                         `X${i}`}
                      </TableCell>
                      <TableCell className="font-mono">{coef.toFixed(4)}</TableCell>
                      {results.stdErrors && (
                        <TableCell className="font-mono">{results.stdErrors[i]?.toFixed(4) || 'N/A'}</TableCell>
                      )}
                      {results.tStats && (
                        <TableCell className="font-mono">{results.tStats[i]?.toFixed(4) || 'N/A'}</TableCell>
                      )}
                      {results.pValues && (
                        <TableCell className="font-mono">
                          {results.pValues[i] ? results.pValues[i].toExponential(3) : 'N/A'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Visualization */}
        {results.chartData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Regression Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[500px]">
                {results.chartComponent}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDF export removed */}
      </div>
    );
  };

  return (
    <ToolPageWrapper
      title="Regression Analysis Calculator"
      description="Explore relationships between variables using various regression techniques"
      icon={TrendingUp}
      layout="single-column"
      onReset={handleReset}
    >
      {renderContent()}
      {renderResults()}
    </ToolPageWrapper>
  );
}
