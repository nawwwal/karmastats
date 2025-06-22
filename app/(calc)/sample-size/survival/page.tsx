"use client";

import { useState } from "react";
import { LogRankForm } from "@/components/sample-size/LogRankForm";
import { CoxRegressionForm } from "@/components/sample-size/CoxRegressionForm";
import { OneArmSurvivalForm } from "@/components/sample-size/OneArmSurvivalForm";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import {
  EnhancedTabs,
  EnhancedTabsList,
  EnhancedTabsTrigger
} from '@/components/ui/enhanced-tabs';
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
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <EnhancedTabsList className="grid w-full grid-cols-3" variant="modern">
          {tabs.map((tab) => (
            <EnhancedTabsTrigger key={tab.value} value={tab.value} variant="modern">
              <div className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
            </EnhancedTabsTrigger>
          ))}
        </EnhancedTabsList>
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
          category: 'statistical' as const,
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
          category: 'statistical' as const,
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
          category: 'statistical' as const,
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

    return (
      <div className="space-y-8">
        <EnhancedResultsDisplay
          title={title}
          subtitle="Time-to-Event Analysis"
          results={keyMetrics}
          interpretation={{
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
          }}
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
