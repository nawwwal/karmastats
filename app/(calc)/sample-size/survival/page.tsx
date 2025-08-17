"use client";

import React, { useState } from "react";
import SurvivalAnalysisFormFormedible from "@/components/sample-size/SurvivalAnalysisFormFormedible";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import {
  EnhancedTabs,
  EnhancedTabsList,
  EnhancedTabsTrigger,
  EnhancedTabsContent,
} from '@/components/ui/enhanced-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Target, Activity, Download } from 'lucide-react';

export default function SurvivalAnalysisPage() {
  const [activeTab, setActiveTab] = useState<"log-rank" | "cox" | "one-arm">("log-rank");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setResults(null);
    setError(null);
    setActiveTab("log-rank");
  };

  const generatePdf = async () => {
    if (!results) return;

    try {
      const { generateModernPDF } = await import('@/lib/pdf-utils');

      let config: any = {
        calculatorType: `Survival Analysis - ${activeTab.replace('-', ' ')}`,
        inputs: [
          { label: "Analysis Type", value: activeTab.replace('-', ' ') }
        ],
        results: [
          {
            label: "Total Sample Size",
            value: results.totalSampleSize,
            highlight: true,
            category: "primary",
            format: "integer"
          },
          {
            label: "Total Events Required",
            value: results.totalEvents,
            category: "secondary",
            format: "integer"
          }
        ],
        interpretation: {
          summary: `This ${activeTab.replace('-', ' ')} analysis requires ${results.totalSampleSize} participants to observe ${results.totalEvents} events with adequate statistical power.`,
          recommendations: [
            'Ensure adequate follow-up time to observe required events',
            'Consider interim analyses for early stopping if appropriate',
            'Plan for potential loss to follow-up in the study design',
            'Validate assumptions about event rates and hazard ratios'
          ],
          assumptions: [
            'Proportional hazards assumption holds throughout study',
            'Event rates are consistent with historical data',
            'Censoring is non-informative and independent',
            'Study population is representative of target population'
          ]
        }
      };

      if (activeTab === "log-rank") {
        config.title = "Log-Rank Test Sample Size Analysis";
        config.subtitle = "Survival Distribution Comparison";
        config.results.push(
          {
            label: "Group 1 Sample Size",
            value: results.group1SampleSize,
            category: "secondary",
            format: "integer"
          },
          {
            label: "Group 2 Sample Size",
            value: results.group2SampleSize,
            category: "secondary",
            format: "integer"
          }
        );
      } else if (activeTab === "cox") {
        config.title = "Cox Regression Sample Size Analysis";
        config.subtitle = "Proportional Hazards Model";
      } else if (activeTab === "one-arm") {
        config.title = "One-Arm Survival Study Analysis";
        config.subtitle = "Single-Arm vs Historical Control";
        config.results.push(
          {
            label: "Study Duration",
            value: results.studyDuration,
            category: "secondary",
            format: "integer",
            unit: "months"
          }
        );
      }

      await generateModernPDF(config);
    } catch (err: any) {
      setError(`Failed to generate PDF: ${err.message}`);
    }
  };

  const tabs = [
    {
      value: "log-rank",
      label: "Log-Rank Test",
      icon: Target,
      description: "Compare survival distributions"
    },
    {
      value: "cox",
      label: "Cox Regression",
      icon: Activity,
      description: "Covariate-adjusted analysis"
    },
    {
      value: "one-arm",
      label: "One-Arm Study",
      icon: Clock,
      description: "Single-arm vs historical"
    }
  ];

  const renderContent = () => (
    <div className="space-y-8">
      <EnhancedTabs
        value={activeTab}
        onValueChange={(tab) => setActiveTab(tab as "log-rank" | "cox" | "one-arm")}
        className="space-y-4"
      >
        <EnhancedTabsList className="grid w-full grid-cols-3" variant="modern">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <EnhancedTabsTrigger key={tab.value} value={tab.value} variant="modern">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
              </EnhancedTabsTrigger>
            );
          })}
        </EnhancedTabsList>

        <EnhancedTabsContent value="log-rank">
          <Card>
            <CardHeader>
              <CardTitle>Log-Rank Test Sample Size</CardTitle>
              <CardDescription>
                Compare survival distributions between two independent groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SurvivalAnalysisFormFormedible onResultsChange={setResults} analysisType="log-rank" />
            </CardContent>
          </Card>
        </EnhancedTabsContent>

        <EnhancedTabsContent value="cox">
          <Card>
            <CardHeader>
              <CardTitle>Cox Proportional Hazards Sample Size</CardTitle>
              <CardDescription>
                Survival analysis with covariate adjustment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SurvivalAnalysisFormFormedible onResultsChange={setResults} analysisType="cox" />
            </CardContent>
          </Card>
        </EnhancedTabsContent>

        <EnhancedTabsContent value="one-arm">
          <Card>
            <CardHeader>
              <CardTitle>One-Arm Survival Study Sample Size</CardTitle>
              <CardDescription>
                Single-arm studies comparing against historical controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SurvivalAnalysisFormFormedible onResultsChange={setResults} analysisType="one-arm" />
            </CardContent>
          </Card>
        </EnhancedTabsContent>
      </EnhancedTabs>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    let keyMetrics: any[] = [];
    let title = "Survival Analysis Results";

    if (activeTab === "log-rank") {
      title = "Log-Rank Test Results";
      keyMetrics = [
        {
          label: 'Total Sample Size',
          value: results.totalSampleSize,
          category: 'primary' as const,
          highlight: true,
          format: 'integer' as const
        },
        {
          label: 'Sample Size Group 1',
          value: results.group1SampleSize,
          category: 'secondary' as const,
          format: 'integer' as const
        },
        {
          label: 'Sample Size Group 2',
          value: results.group2SampleSize,
          category: 'secondary' as const,
          format: 'integer' as const
        },
        {
          label: 'Total Events Required',
          value: results.totalEvents,
          category: 'info' as const,
          format: 'integer' as const
        },
      ];
    } else if (activeTab === "cox") {
      title = "Cox Regression Results";
      keyMetrics = [
        {
          label: 'Total Sample Size',
          value: results.totalSampleSize,
          category: 'primary' as const,
          highlight: true,
          format: 'integer' as const
        },
        {
          label: 'Total Events Required',
          value: results.totalEvents,
          category: 'info' as const,
          format: 'integer' as const
        },
      ];
    } else if (activeTab === "one-arm") {
      title = "One-Arm Survival Results";
      keyMetrics = [
        {
          label: 'Total Sample Size',
          value: results.totalSampleSize,
          category: 'primary' as const,
          highlight: true,
          format: 'integer' as const
        },
        {
          label: 'Total Events Required',
          value: results.totalEvents,
          category: 'secondary' as const,
          format: 'integer' as const
        },
        {
          label: 'Study Duration',
          value: results.studyDuration,
          category: 'info' as const,
          format: 'integer' as const
        },
        {
          label: 'Statistical Power',
          value: (results.power || 0.8) * 100,
          category: 'success' as const,
          format: 'percentage' as const
        },
      ];
    }

    const interpretationData = {
      statisticalSignificance: `Power ${(results.power || 0.8) * 100}%`,
      recommendations: [
        'Ensure adequate follow-up time to observe required events',
        'Consider interim analyses for early stopping if appropriate',
        'Plan for potential loss to follow-up in the study design',
        'Validate assumptions about event rates and hazard ratios'
      ],
      assumptions: [
        'Proportional hazards assumption holds throughout study',
        'Event rates are consistent with historical data',
        'Censoring is non-informative and independent',
        'Study population is representative of target population'
      ]
    };

    return (
      <div className="space-y-8">
        <EnhancedResultsDisplay
          title={title}
          subtitle="Time-to-Event Analysis"
          results={keyMetrics}
          interpretation={interpretationData}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdvancedVisualization
            title="Event Distribution"
            type="pie"
            data={[
              { label: 'Events', value: results.totalEvents },
              { label: 'Non-events', value: results.totalSampleSize - results.totalEvents }
            ]}
            insights={[
              { key: 'Total Events', value: results.totalEvents.toString(), significance: 'high' as const }
            ]}
          />

          <AdvancedVisualization
            title="Power Analysis"
            type="trend"
            data={[
              { label: '70%', value: Math.round(results.totalSampleSize * 0.7) },
              { label: '80%', value: results.totalSampleSize },
              { label: '90%', value: Math.round(results.totalSampleSize * 1.3) },
              { label: '95%', value: Math.round(results.totalSampleSize * 1.6) }
            ]}
            insights={[
              { key: 'Design', value: activeTab.replace('-', ' '), significance: 'medium' as const }
            ]}
          />
        </div>

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-semibold text-lg">Export Your Results</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Download comprehensive PDF report with survival analysis calculations
                </p>
              </div>
              <Button
                onClick={generatePdf}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg px-8 py-3 text-base font-semibold shrink-0"
              >
                <Download className="h-5 w-5 mr-3" />
                Download PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <ToolPageWrapper
      title="Survival Analysis Sample Size Calculator"
      description="Calculate sample sizes for time-to-event studies including log-rank tests, Cox regression, and one-arm survival studies"
      icon={Clock}
      layout="single-column"
      onReset={handleReset}
    >
      {renderContent()}
      {renderResults()}
    </ToolPageWrapper>
  );
}
