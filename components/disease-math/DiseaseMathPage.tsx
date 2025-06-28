'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StandardModel } from './StandardModel';
import { AdvancedModel } from './AdvancedModel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { Badge } from '@/components/ui/badge';
import { LineChart } from './LineChart';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import { Activity, TrendingUp, Users, AlertTriangle, BarChart3, Target } from 'lucide-react';

export function DiseaseMathPage() {
  const [activeTab, setActiveTab] = useState('standard');
  const [results, setResults] = useState<any>(null);

  const handleReset = () => {
    setResults(null);
  };

  const handleResultsChange = (newResults: any) => {
    setResults({ ...newResults, modelType: activeTab });
  };

  const renderInputForm = () => (
    <ErrorBoundary>
              <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <span>Disease Modeling Configuration</span>
          </CardTitle>
          <CardDescription className="text-lg">
            Configure your infectious disease model parameters and run simulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedTabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <EnhancedTabsList className="grid w-full grid-cols-2" variant="modern">
              <EnhancedTabsTrigger value="standard" variant="modern">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Standard SEIR</span>
                </div>
              </EnhancedTabsTrigger>
              <EnhancedTabsTrigger value="advanced" variant="modern">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Advanced SEIRDV</span>
                </div>
              </EnhancedTabsTrigger>
            </EnhancedTabsList>

            <EnhancedTabsContent value="standard">
              <Card className="border-primary/20 bg-primary/10 dark:bg-primary/20 dark:border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Standard SEIR Model</CardTitle>
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
            </EnhancedTabsContent>

            <EnhancedTabsContent value="advanced">
              <Card className="border-secondary/20 bg-secondary/10 dark:bg-secondary/20 dark:border-secondary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Advanced SEIRDV Model</CardTitle>
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
            </EnhancedTabsContent>
          </EnhancedTabs>
        </CardContent>
      </Card>
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

    const getSeverityCategory = (): 'critical' | 'warning' | 'secondary' | 'success' => {
      const attackRate = results.metrics?.attackRate || 0;
      if (attackRate >= 0.6) return 'critical';
      if (attackRate >= 0.3) return 'warning';
      if (attackRate >= 0.1) return 'secondary';
      return 'success';
    };

    // Prepare results for enhanced display
    const enhancedResults = [
      {
        label: "Peak Infected Cases",
        value: results.metrics?.peakInfected || 0,
        format: "integer" as const,
        category: "primary" as const,
        highlight: true,
        interpretation: `Maximum simultaneous infections on day ${results.metrics?.peakDay || 'N/A'}`,
        confidence: results.metrics?.peakInfected ? {
          lower: results.metrics.peakInfected * 0.85,
          upper: results.metrics.peakInfected * 1.15,
          level: 95
        } : undefined
      },
      {
        label: "Attack Rate",
        value: (results.metrics?.attackRate || 0) * 100,
        format: "percentage" as const,
        unit: "%",
        category: getSeverityCategory() as 'critical' | 'warning' | 'secondary' | 'success',
        highlight: true,
        interpretation: "Percentage of population that gets infected",
        benchmark: {
          value: 30,
          label: "Moderate epidemic threshold",
          comparison: ((results.metrics?.attackRate || 0) * 100 > 30 ? 'above' : 'below') as 'above' | 'below'
        }
      },
      {
        label: "R₀ (Basic Reproduction Number)",
        value: results.metrics?.r0 || 0,
        format: "decimal" as const,
        category: ((results.metrics?.r0 || 0) > 1 ? "warning" : "success") as 'warning' | 'success',
        interpretation: (results.metrics?.r0 || 0) > 1 ? "Epidemic potential (R₀ > 1)" : "Disease will die out (R₀ < 1)"
      },
      {
        label: "Total Deaths",
        value: results.metrics?.totalDeaths || 0,
        format: "integer" as const,
        category: "critical" as const,
        interpretation: `Mortality rate: ${((results.metrics?.mortalityRate || 0) * 100).toFixed(2)}%`
      },
      {
        label: "Herd Immunity Threshold",
        value: (results.metrics?.herdImmunityThreshold || 0) * 100,
        format: "percentage" as const,
        category: "statistical" as const,
        interpretation: "Population immunity needed to stop transmission"
      },
      {
        label: "Total Cases",
        value: results.metrics?.totalCases || 0,
        format: "integer" as const,
        category: "secondary" as const
      }
    ];

    // Prepare visualization data
    const compartmentData = [
              { label: "Susceptible", value: results.susceptible?.[results.susceptible.length - 1] || 0, color: "hsl(var(--primary))" },
        { label: "Exposed", value: results.exposed?.[results.exposed.length - 1] || 0, color: "hsl(var(--warning))" },
        { label: "Infected", value: results.infected?.[results.infected.length - 1] || 0, color: "hsl(var(--destructive))" },
        { label: "Recovered", value: results.recovered?.[results.recovered.length - 1] || 0, color: "hsl(var(--success))" }
    ];

    if (results.modelType === 'advanced') {
      compartmentData.push(
        { label: "Deaths", value: results.dead?.[results.dead.length - 1] || 0, color: "hsl(var(--muted-foreground))" },
        { label: "Vaccinated", value: results.vaccinated?.[results.vaccinated.length - 1] || 0, color: "hsl(var(--secondary))" }
      );
    }

    const timelineData = results.infected?.map((value: number, index: number) => ({
      label: `Day ${index}`,
      value: value,
      category: "infected"
    })).slice(0, Math.min(30, results.infected?.length || 0)) || [];

    return (
      <div className="space-y-8">
        <EnhancedResultsDisplay
          title={`${getModelName()} Results`}
          subtitle="Comprehensive epidemic simulation analysis"
          results={enhancedResults}
          interpretation={{
            effectSize: `Attack rate of ${((results.metrics?.attackRate || 0) * 100).toFixed(1)}% indicates ${getSeverityCategory() === 'critical' ? 'severe' : getSeverityCategory() === 'warning' ? 'moderate' : 'mild'} epidemic impact`,
            statisticalSignificance: `R₀ = ${(results.metrics?.r0 || 0).toFixed(2)} ${(results.metrics?.r0 || 0) > 1 ? 'confirms epidemic potential' : 'suggests disease will not spread'}`,
            clinicalSignificance: `Peak healthcare demand: ${(results.metrics?.peakInfected || 0).toLocaleString()} simultaneous cases on day ${results.metrics?.peakDay || 'N/A'}`,
            recommendations: [
              "Monitor R₀ value - values above 1.0 indicate sustained transmission",
              "Prepare healthcare capacity for peak infected cases",
              "Consider intervention measures if attack rate exceeds 30%",
              "Track vaccination coverage progress toward herd immunity threshold",
              "Implement contact tracing during early epidemic phases"
            ],
            assumptions: [
              "Homogeneous population mixing patterns",
              "Constant transmission and recovery rates",
              "No seasonal effects or behavioral changes",
              "Perfect immunity after recovery",
              "No demographic or spatial structure"
            ]
          }}
          visualizations={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvancedVisualization
                title="Final Population Distribution"
                type="pie"
                data={compartmentData}
                insights={[
                  {
                    key: "Most affected",
                    value: compartmentData.reduce((max, current) =>
                      current.label !== "Susceptible" && current.value > max.value ? current : max
                    ).label,
                    significance: "high"
                  },
                  {
                    key: "Immunity level",
                    value: `${(((results.recovered?.[results.recovered.length - 1] || 0) + (results.vaccinated?.[results.vaccinated.length - 1] || 0)) / (results.populationSize || 1) * 100).toFixed(1)}%`,
                    trend: "up",
                    significance: "medium"
                  }
                ]}
              />

              <AdvancedVisualization
                title="Infection Timeline (First 30 Days)"
                type="trend"
                data={timelineData}
                insights={[
                  {
                    key: "Peak infections",
                    value: `Day ${results.metrics?.peakDay || 'N/A'}`,
                    significance: "high"
                  },
                  {
                    key: "Growth phase",
                    value: timelineData.findIndex((d: any) => d.value === Math.max(...timelineData.map((t: any) => t.value))) > 15 ? "Slow" : "Rapid",
                    trend: timelineData.findIndex((d: any) => d.value === Math.max(...timelineData.map((t: any) => t.value))) > 15 ? "down" : "up",
                    significance: "medium"
                  }
                ]}
              />
            </div>
          }
        />

        {/* Traditional Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span>Epidemic Curve - Complete Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
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
      description="Model and simulate infectious disease spread using advanced mathematical models with comprehensive visualization and analysis"
      backHref="/"
      backLabel="Sample Size Calculator"
      onReset={handleReset}
      icon={Activity}
      layout="single-column"
    >
      <div className="space-y-8">
        {/* Input Form */}
        {renderInputForm()}

        {/* Results */}
        {results && renderResults()}
      </div>
    </ToolPageWrapper>
  );
}
