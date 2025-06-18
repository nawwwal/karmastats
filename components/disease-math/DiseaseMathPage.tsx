'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StandardModel } from './StandardModel';
import { AdvancedModel } from './AdvancedModel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';

export function DiseaseMathPage() {
  const [activeTab, setActiveTab] = useState('standard');
  const [results, setResults] = useState<any>(null);

  const handleReset = () => {
    setResults(null);
    setActiveTab('standard');
  };

  const renderInputForm = () => (
    <ErrorBoundary>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="standard">Standard SEIR</TabsTrigger>
            <TabsTrigger value="advanced">Advanced SEIRDV</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="standard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard SEIR Model</CardTitle>
              <CardDescription>
                Basic susceptible-exposed-infected-recovered model for disease spread analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <StandardModel onResultsChange={setResults} />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced SEIRDV Model</CardTitle>
              <CardDescription>
                Extended model including deaths and vaccination compartments with intervention analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <AdvancedModel onResultsChange={setResults} />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ErrorBoundary>
  );

  const renderResults = () => {
    if (!results) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Disease Modeling Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Results will be rendered here based on the active model */}
            <div className="text-center text-muted-foreground">
              <p>Disease modeling results and visualizations will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ToolPageWrapper
      title="Infectious Disease Modeling"
      description="Advanced compartmental models for analyzing the spread of infectious diseases, including vaccination strategies and intervention measures"
      category="Disease Modeling"
      onReset={handleReset}
      resultsSection={renderResults()}
    >
      {renderInputForm()}
    </ToolPageWrapper>
  );
}
