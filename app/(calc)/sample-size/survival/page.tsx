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

    return (
      <Card>
        <CardHeader>
          <CardTitle>Survival Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Results will be rendered here based on the active tab and form data */}
            <div className="text-center text-muted-foreground">
              <p>Survival analysis results will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
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
