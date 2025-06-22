"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinearRegressionForm } from "@/components/regression/LinearRegressionForm";
import { MultipleRegressionForm } from "@/components/regression/MultipleRegressionForm";
import { PolynomialRegressionForm } from "@/components/regression/PolynomialRegressionForm";
import { LogisticRegressionForm } from "@/components/regression/LogisticRegressionForm";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { StatisticalSummary } from "@/components/ui/statistical-summary";
import { TrendingUp, BarChart3, Activity, Target } from "lucide-react";

export default function RegressionPage() {
  const [activeTab, setActiveTab] = useState("linear");
  const [results, setResults] = useState<any>(null);

  const handleReset = () => {
    setResults(null);
  };

  const handleResultsChange = (newResults: any) => {
    setResults({ ...newResults, type: activeTab });
    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderInputForm = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="linear">Linear</TabsTrigger>
        <TabsTrigger value="multiple">Multiple</TabsTrigger>
        <TabsTrigger value="polynomial">Polynomial</TabsTrigger>
        <TabsTrigger value="logistic">Logistic</TabsTrigger>
      </TabsList>

      <TabsContent value="linear">
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
      </TabsContent>

      <TabsContent value="multiple">
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
      </TabsContent>

      <TabsContent value="polynomial">
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
      </TabsContent>

      <TabsContent value="logistic">
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
      </TabsContent>
    </Tabs>
  );

  const renderResults = () => {
    if (!results) return null;

    const getModelIcon = () => {
      switch (results.type) {
        case 'linear': return <TrendingUp className="h-5 w-5" />;
        case 'multiple': return <BarChart3 className="h-5 w-5" />;
        case 'polynomial': return <Activity className="h-5 w-5" />;
        case 'logistic': return <Target className="h-5 w-5" />;
        default: return <TrendingUp className="h-5 w-5" />;
      }
    };

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
      if (r2 >= 0.7) return { text: "Strong model fit", color: "default" };
      if (r2 >= 0.5) return { text: "Moderate model fit", color: "secondary" };
      if (r2 >= 0.3) return { text: "Weak model fit", color: "outline" };
      return { text: "Poor model fit", color: "destructive" };
    };

    const interpretation = getInterpretation();

    return (
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              {getModelIcon()}
              <div>
                <CardTitle className="text-xl">{getModelName()} Results</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={interpretation.color as any}>{interpretation.text}</Badge>
                  <span className="text-sm text-muted-foreground">
                    R² = {(results.rSquared || 0).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Modern Key Metrics */}
        <StatisticalSummary
          results={results}
          type="regression"
          title="Key Statistical Metrics"
        />

        {/* Model Equation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regression Equation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-center">
              {results.type === 'linear' && results.slope !== undefined && (
                <div className="text-lg">
                  Y = {results.intercept?.toFixed(4)} + {results.slope?.toFixed(4)}X
                </div>
              )}
              {results.type === 'polynomial' && results.coefficients && (
                <div className="text-lg">
                  Y = {results.coefficients.map((coef: number, i: number) =>
                    i === 0 ? coef.toFixed(4) :
                    ` + ${coef.toFixed(4)}X${i > 1 ? `^${i}` : ''}`
                  ).join('')}
                </div>
              )}
              {(results.type === 'multiple' || results.type === 'logistic') && results.coefficients && (
                <div className="text-sm space-y-1">
                  {results.coefficients.map((coef: number, i: number) => (
                    <div key={i}>
                      {i === 0 ? 'Intercept' : `β${i}`}: {coef.toFixed(4)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                      <TableCell>{coef.toFixed(4)}</TableCell>
                      {results.stdErrors && (
                        <TableCell>{results.stdErrors[i]?.toFixed(4) || 'N/A'}</TableCell>
                      )}
                      {results.tStats && (
                        <TableCell>{results.tStats[i]?.toFixed(4) || 'N/A'}</TableCell>
                      )}
                      {results.pValues && (
                        <TableCell>
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

        {/* Statistical Interpretation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistical Interpretation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Model Fit:</h4>
              <p className="text-sm text-muted-foreground">
                The R-squared value of {(results.rSquared || 0).toFixed(3)} indicates that{' '}
                {((results.rSquared || 0) * 100).toFixed(1)}% of the variance in the dependent variable
                is explained by the model. {interpretation.text.toLowerCase()}.
              </p>
            </div>

            {results.correlation !== undefined && (
              <div>
                <h4 className="font-medium mb-2">Correlation:</h4>
                <p className="text-sm text-muted-foreground">
                  The correlation coefficient of {results.correlation.toFixed(3)} suggests a{' '}
                  {Math.abs(results.correlation) >= 0.7 ? 'strong' :
                   Math.abs(results.correlation) >= 0.3 ? 'moderate' : 'weak'}{' '}
                  {results.correlation >= 0 ? 'positive' : 'negative'} linear relationship.
                </p>
              </div>
            )}

            {results.type === 'linear' && results.slope !== undefined && (
              <div>
                <h4 className="font-medium mb-2">Slope Interpretation:</h4>
                <p className="text-sm text-muted-foreground">
                  For every unit increase in X, Y {results.slope >= 0 ? 'increases' : 'decreases'} by{' '}
                  {Math.abs(results.slope).toFixed(4)} units on average.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
      </div>
    );
  };

  return (
    <ToolPageWrapper
      title="Regression Analysis"
      description="Explore relationships between variables using various regression techniques"
      onReset={handleReset}
      backHref="/"
      backLabel="Home"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {renderInputForm()}
        </div>
        <div>
          {renderResults()}
        </div>
      </div>
    </ToolPageWrapper>
  );
}
