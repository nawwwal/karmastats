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
import { LogRankForm } from "@/components/sample-size/LogRankForm";
import { CoxRegressionForm } from "@/components/sample-size/CoxRegressionForm";
import { OneArmSurvivalForm } from "@/components/sample-size/OneArmSurvivalForm";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { ResultsDisplay } from '@/components/ui/results-display';

export default function SurvivalAnalysisPage() {
  const [activeTab, setActiveTab] = useState("log-rank");
  const [results, setResults] = useState<any>(null);

  const handleReset = () => {
    setResults(null);
  };

  const renderInputForm = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="log-rank">Log-Rank</TabsTrigger>
        <TabsTrigger value="cox">Cox Regression</TabsTrigger>
        <TabsTrigger value="one-arm">One-Arm</TabsTrigger>
      </TabsList>

      <TabsContent value="log-rank">
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
      </TabsContent>

      <TabsContent value="cox">
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
      </TabsContent>

      <TabsContent value="one-arm">
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
      </TabsContent>
    </Tabs>
  );

  const renderResults = () => {
    if (!results) return null;

    let resultItems: any[] = [];
    let title = "Survival Analysis Results";

    if (activeTab === "log-rank") {
      title = "Log-Rank Test Results";
      resultItems = [
        { label: 'Total Sample Size', value: results.totalSampleSize, category: 'primary' as const, highlight: true, format: 'integer' as const },
        { label: 'Sample Size Group 1', value: results.n1, category: 'secondary' as const, format: 'integer' as const },
        { label: 'Sample Size Group 2', value: results.n2, category: 'secondary' as const, format: 'integer' as const },
        { label: 'Total Events Required', value: results.totalEvents, category: 'statistical' as const, format: 'integer' as const },
      ];
    } else if (activeTab === "cox") {
      title = "Cox Regression Results";
      resultItems = [
        { label: 'Total Sample Size', value: results.totalSampleSize, category: 'primary' as const, highlight: true, format: 'integer' as const },
        { label: 'Total Events Required', value: results.totalEvents, category: 'statistical' as const, format: 'integer' as const },
      ];
    } else if (activeTab === "one-arm") {
      title = "One-Arm Survival Results";
      resultItems = [
        { label: 'Total Sample Size', value: results.totalSampleSize, category: 'primary' as const, highlight: true, format: 'integer' as const },
        { label: 'Total Events Required', value: results.totalEvents, category: 'secondary' as const, format: 'integer' as const },
        { label: 'Study Duration', value: results.studyDuration, category: 'secondary' as const, format: 'integer' as const },
        { label: 'Statistical Power', value: results.power * 100, category: 'statistical' as const, format: 'percentage' as const },
      ];
    }

    const interpretation = {
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
      <ResultsDisplay
        title={title}
        results={resultItems}
        interpretation={interpretation}
        showInterpretation={true}
      />
    );
  };

  return (
    <ToolPageWrapper
      title="Survival Analysis Sample Size"
      description="Calculate sample sizes for time-to-event studies including log-rank tests, Cox regression, and one-arm survival studies"
      category="Sample Size Calculator"
      onReset={handleReset}
      resultsSection={renderResults()}
    >
      {renderInputForm()}
    </ToolPageWrapper>
  );
}
