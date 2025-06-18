'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StandardModel } from './StandardModel';
import { AdvancedModel } from './AdvancedModel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { Badge } from '@/components/ui/badge';
import { LineChart } from './LineChart';
import { Activity, TrendingUp, Users, AlertTriangle } from 'lucide-react';

export function DiseaseMathPage() {
  const [activeTab, setActiveTab] = useState('standard');
  const [results, setResults] = useState<any>(null);

  const handleReset = () => {
    setResults(null);
  };

  const handleResultsChange = (newResults: any) => {
    setResults({ ...newResults, modelType: activeTab });
    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderInputForm = () => (
    <ErrorBoundary>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Standard SEIR</TabsTrigger>
          <TabsTrigger value="advanced">Advanced SEIRDV</TabsTrigger>
        </TabsList>

        <TabsContent value="standard">
          <Card>
            <CardHeader>
              <CardTitle>Standard SEIR Model</CardTitle>
              <CardDescription>
                Basic susceptible-exposed-infected-recovered model for disease spread analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <StandardModel onResultsChange={handleResultsChange} />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced SEIRDV Model</CardTitle>
              <CardDescription>
                Extended model with deaths and vaccination compartments including intervention analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <AdvancedModel onResultsChange={handleResultsChange} />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ErrorBoundary>
  );

  const renderResults = () => {
    if (!results) return null;

    const getModelIcon = () => {
      return results.modelType === 'advanced' ? <Activity className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />;
    };

    const getModelName = () => {
      return results.modelType === 'advanced' ? 'Advanced SEIRDV Model' : 'Standard SEIR Model';
    };

    const getSeverityBadge = () => {
      const attackRate = results.metrics?.attackRate || 0;
      if (attackRate >= 0.6) return { text: "High Impact", color: "destructive" };
      if (attackRate >= 0.3) return { text: "Moderate Impact", color: "warning" };
      if (attackRate >= 0.1) return { text: "Low Impact", color: "secondary" };
      return { text: "Minimal Impact", color: "default" };
    };

    const severity = getSeverityBadge();

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
                  <Badge variant={severity.color as any}>{severity.text}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Attack Rate: {((results.metrics?.attackRate || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {results.metrics?.peakInfected?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Peak Infected</div>
                <div className="text-xs mt-1">
                  Day {results.metrics?.peakDay || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {results.metrics?.totalDeaths?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Total Deaths</div>
                <div className="text-xs mt-1">
                  {results.metrics?.mortalityRate ? `${(results.metrics.mortalityRate * 100).toFixed(2)}% mortality` : ''}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {results.metrics?.r0?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">R₀ Value</div>
                <div className="text-xs mt-1">
                  {results.metrics?.r0 > 1 ? 'Epidemic spread' : 'Disease dies out'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-foreground">
                  {results.metrics?.herdImmunityThreshold ? `${(results.metrics.herdImmunityThreshold * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Herd Immunity</div>
                <div className="text-xs mt-1">
                  Threshold for protection
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Epidemic Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Epidemic Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Population Impact
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Attack Rate:</span>
                    <span className="font-medium">{((results.metrics?.attackRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cases:</span>
                    <span className="font-medium">{results.metrics?.totalCases?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Final Recovered:</span>
                    <span className="font-medium">{results.recovered?.[results.recovered.length - 1]?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Population Size:</span>
                    <span className="font-medium">{results.populationSize?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Disease Dynamics
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Reproduction Number (R₀):</span>
                    <span className="font-medium">{results.metrics?.r0?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Day:</span>
                    <span className="font-medium">Day {results.metrics?.peakDay || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simulation Days:</span>
                    <span className="font-medium">{results.simulationDays || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model Type:</span>
                    <span className="font-medium">{results.modelType === 'advanced' ? 'SEIRDV' : 'SEIR'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistical Interpretation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Model Interpretation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Epidemic Trajectory:</h4>
              <p className="text-sm text-muted-foreground">
                {results.metrics?.r0 > 1
                  ? `With R₀ = ${results.metrics.r0.toFixed(2)}, this disease will spread exponentially. The epidemic peaks on day ${results.metrics?.peakDay} with ${results.metrics?.peakInfected?.toLocaleString()} infected individuals.`
                  : `With R₀ = ${results.metrics?.r0?.toFixed(2) || 'N/A'}, this disease will not sustain epidemic spread and will eventually die out naturally.`
                }
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Population Impact:</h4>
              <p className="text-sm text-muted-foreground">
                Approximately {((results.metrics?.attackRate || 0) * 100).toFixed(1)}% of the population ({results.metrics?.totalCases?.toLocaleString() || 'N/A'} individuals)
                will be infected during this epidemic. The estimated total deaths are {results.metrics?.totalDeaths?.toLocaleString() || 'N/A'} people.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Herd Immunity:</h4>
              <p className="text-sm text-muted-foreground">
                To achieve herd immunity and stop the spread, {((results.metrics?.herdImmunityThreshold || 0) * 100).toFixed(1)}%
                of the population needs to be immune (through infection or vaccination).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Disease Spread Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[500px]">
              <LineChart results={results} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <ToolPageWrapper
      title="Infectious Disease Modeling"
      description="Advanced compartmental models for analyzing the spread of infectious diseases with intervention strategies"
      category="Disease Modeling"
      onReset={handleReset}
      resultsSection={renderResults()}
    >
      {renderInputForm()}
    </ToolPageWrapper>
  );
}
