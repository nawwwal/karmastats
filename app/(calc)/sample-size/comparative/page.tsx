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
import { CaseControlForm } from "@/components/sample-size/CaseControlForm";
import { CohortForm } from "@/components/sample-size/CohortForm";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';

export default function ComparativeStudyPage() {
  const [activeTab, setActiveTab] = useState("case-control");
  const [results, setResults] = useState<any>(null);

  const handleReset = () => {
    setResults(null);
  };

  const renderInputForm = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="case-control">Case-Control</TabsTrigger>
        <TabsTrigger value="cohort">Cohort Study</TabsTrigger>
      </TabsList>

      <TabsContent value="case-control">
        <Card>
          <CardHeader>
            <CardTitle>Case-Control Study Sample Size</CardTitle>
            <CardDescription>
              Calculate sample size for retrospective case-control studies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CaseControlForm onResultsChange={setResults} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cohort">
        <Card>
          <CardHeader>
            <CardTitle>Cohort Study Sample Size</CardTitle>
            <CardDescription>
              Calculate sample size for prospective cohort studies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CohortForm onResultsChange={setResults} />
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
          <CardTitle>Comparative Study Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Results will be rendered here based on the active tab and form data */}
            <div className="text-center text-muted-foreground">
              <p>Comparative study results will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ToolPageWrapper
      title="Comparative Study Sample Size"
      description="Calculate sample sizes for case-control and cohort studies with precise statistical power analysis"
      category="Sample Size Calculator"
      onReset={handleReset}
      resultsSection={renderResults()}
    >
      {renderInputForm()}
    </ToolPageWrapper>
  );
}
