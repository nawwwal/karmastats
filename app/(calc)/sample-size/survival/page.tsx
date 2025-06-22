"use client";

import { useState } from "react";
import { LogRankForm } from "@/components/sample-size/LogRankForm";
import { CoxRegressionForm } from "@/components/sample-size/CoxRegressionForm";
import { OneArmSurvivalForm } from "@/components/sample-size/OneArmSurvivalForm";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { EnhancedTabs } from '@/components/ui/enhanced-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, Activity } from 'lucide-react';

export default function SurvivalAnalysisPage() {
  const [activeTab, setActiveTab] = useState("log-rank");
  const [results, setResults] = useState<any>(null);

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
        tabs={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        {activeTab === "log-rank" && (
          <Card>
            <CardHeader>
              <CardTitle>Log-Rank Test Sample Size</CardTitle>
              <CardDescription>
                Compare survival distributions between two independent groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogRankForm onResultsChange={setResults} />
            </CardContent>
          </Card>
        )}

        {activeTab === "cox" && (
          <Card>
            <CardHeader>
              <CardTitle>Cox Proportional Hazards Sample Size</CardTitle>
              <CardDescription>
                Survival analysis with covariate adjustment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CoxRegressionForm onResultsChange={setResults} />
            </CardContent>
          </Card>
        )}

        {activeTab === "one-arm" && (
          <Card>
            <CardHeader>
              <CardTitle>One-Arm Survival Study Sample Size</CardTitle>
              <CardDescription>
                Single-arm studies comparing against historical controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OneArmSurvivalForm onResultsChange={setResults} />
            </CardContent>
          </Card>
        )}
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
          format: 'integer' as const,
          description: 'Total participants needed'
        },
        {
          label: 'Sample Size Group 1',
          value: results.group1SampleSize,
          category: 'secondary' as const,
          format: 'integer' as const,
          description: 'First group size'
        },
        {
          label: 'Sample Size Group 2',
          value: results.group2SampleSize,
          category: 'secondary' as const,
          format: 'integer' as const,
          description: 'Second group size'
        },
        {
          label: 'Total Events Required',
          value: results.totalEvents,
          category: 'info' as const,
          format: 'integer' as const,
          description: 'Events needed for analysis'
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
          format: 'integer' as const,
          description: 'Total participants needed'
        },
        {
          label: 'Total Events Required',
          value: results.totalEvents,
          category: 'info' as const,
          format: 'integer' as const,
          description: 'Events needed for analysis'
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
          format: 'integer' as const,
          description: 'Total participants needed'
        },
        {
          label: 'Total Events Required',
          value: results.totalEvents,
          category: 'secondary' as const,
          format: 'integer' as const,
          description: 'Events needed for analysis'
        },
        {
          label: 'Study Duration',
          value: results.studyDuration,
          category: 'info' as const,
          format: 'integer' as const,
          description: 'Expected study length'
        },
        {
          label: 'Statistical Power',
          value: (results.power || 0.8) * 100,
          category: 'success' as const,
          format: 'percentage' as const,
          description: 'Power to detect effect'
        },
      ];
    }

    return (
      <div className="space-y-8">
        <EnhancedResultsDisplay
          title={title}
          subtitle="Time-to-Event Analysis"
          metrics={keyMetrics}
          insights={[
            `Total sample size: ${results.totalSampleSize} participants`,
            `Events required: ${results.totalEvents} for adequate power`,
            'Survival analysis accounts for censoring and time-to-event',
            'Consider loss to follow-up in study planning'
          ]}
          recommendations={[
            'Ensure adequate follow-up time to observe required events',
            'Consider interim analyses for early stopping if appropriate',
            'Plan for potential loss to follow-up in the study design',
            'Validate assumptions about event rates and hazard ratios'
          ]}
          assumptions={[
            'Proportional hazards assumption holds throughout study',
            'Event rates are consistent with historical data',
            'Censoring is non-informative and independent',
            'Study population is representative of target population'
          ]}
          statisticalDetails={{
            sampleSize: results.totalSampleSize,
            power: results.power || 0.8,
            alpha: 0.05,
            effectSize: activeTab === "log-rank" ? 0.5 : 0.7,
            designType: 'Survival Analysis'
          }}
        />

        <AdvancedVisualization
          title="Survival Study Design Analysis"
          data={{
            sampleSize: keyMetrics,
            studyDesign: activeTab,
            powerAnalysis: [
              { power: 70, sampleSize: Math.round(results.totalSampleSize * 0.7) },
              { power: 80, sampleSize: results.totalSampleSize },
              { power: 90, sampleSize: Math.round(results.totalSampleSize * 1.3) },
              { power: 95, sampleSize: Math.round(results.totalSampleSize * 1.6) }
            ]
          }}
          insights={[
            `Study design: ${activeTab.replace('-', ' ')} analysis`,
            `Power-sample size trade-off: Higher power requires more participants`,
            'Events drive the analysis power, not just sample size',
            'Consider recruitment timeline and follow-up duration'
          ]}
          chartTypes={['bar', 'trend']}
        />
      </div>
    );
  };

  return (
    <ToolPageWrapper
      title="Survival Analysis Sample Size Calculator"
      description="Calculate sample sizes for time-to-event studies including log-rank tests, Cox regression, and one-arm survival studies"
      icon={Clock}
      layout="single-column"
    >
      {renderContent()}
      {renderResults()}
    </ToolPageWrapper>
  );
}
