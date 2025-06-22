"use client";

import { useState } from "react";
import { CaseControlForm } from "@/components/sample-size/CaseControlForm";
import { CohortForm } from "@/components/sample-size/CohortForm";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import {
  EnhancedTabs,
  EnhancedTabsList,
  EnhancedTabsTrigger
} from '@/components/ui/enhanced-tabs';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  Calculator,
  Target,
  Activity,
  Info,
  Microscope,
  Clock
} from 'lucide-react';

export default function ComparativeStudyPage() {
  const [activeTab, setActiveTab] = useState("case-control");
  const [results, setResults] = useState<any>(null);

  const handleReset = () => {
    setResults(null);
    setActiveTab("case-control");
  };

  const tabs = [
    {
      value: "case-control",
      label: "Case-Control",
      icon: Users,
      description: "Retrospective design"
    },
    {
      value: "cohort",
      label: "Cohort Study",
      icon: TrendingUp,
      description: "Prospective design"
    }
  ];

  const renderContent = () => (
    <div className="space-y-8">
      <EnhancedTabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <EnhancedTabsList className="grid w-full grid-cols-2" variant="modern">
          {tabs.map((tab) => (
            <EnhancedTabsTrigger key={tab.value} value={tab.value} variant="modern">
              <div className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
            </EnhancedTabsTrigger>
          ))}
        </EnhancedTabsList>
        {activeTab === "case-control" && (
          <CaseControlForm onResultsChange={setResults} />
        )}
        {activeTab === "cohort" && (
          <CohortForm onResultsChange={setResults} />
        )}
      </EnhancedTabs>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    const isCaseControl = results.type === 'case-control';
    const interpretation = results.interpretation;

    // Key metrics for enhanced results display
    const keyMetrics = [
      {
        label: isCaseControl ? 'Cases Required' : 'Exposed Group',
        value: isCaseControl ? interpretation.nCases : interpretation.nExposed,
        category: 'primary' as const
      },
      {
        label: isCaseControl ? 'Controls Required' : 'Unexposed Group',
        value: isCaseControl ? interpretation.nControls : interpretation.nUnexposed,
        category: 'secondary' as const
      },
      {
        label: 'Total Sample Size',
        value: interpretation.totalSample,
        category: 'statistical' as const,
        highlight: true
      },
      {
        label: isCaseControl ? 'Odds Ratio' : 'Relative Risk',
        value: isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk,
        category: 'success' as const,
        format: 'decimal' as const
      }
    ];

    // Study parameters for detailed view
    const studyParameters = [
      { parameter: 'Study Design', value: isCaseControl ? 'Case-Control (Retrospective)' : 'Cohort (Prospective)' },
      { parameter: 'Confidence Level', value: `${results.parameters.confidenceLevel}%` },
      { parameter: 'Statistical Power', value: `${results.parameters.power}%` },
      { parameter: 'Group Ratio', value: `1:${results.parameters.ratio}` },
      {
        parameter: isCaseControl ? 'Exposure Rate (Controls)' : 'Disease Rate (Unexposed)',
        value: `${((isCaseControl ? results.parameters.p0 : results.parameters.p2) * 100).toFixed(1)}%`
      },
      {
        parameter: isCaseControl ? 'Exposure Rate (Cases)' : 'Disease Rate (Exposed)',
        value: `${((isCaseControl ? results.parameters.p1 : results.parameters.p1) * 100).toFixed(1)}%`
      }
    ];

    // Sample size distribution data for visualization
    const sampleSizeData = [
      {
        name: isCaseControl ? 'Cases' : 'Exposed',
        value: isCaseControl ? interpretation.nCases : interpretation.nExposed,
        percentage: ((isCaseControl ? interpretation.nCases : interpretation.nExposed) / interpretation.totalSample * 100).toFixed(1)
      },
      {
        name: isCaseControl ? 'Controls' : 'Unexposed',
        value: isCaseControl ? interpretation.nControls : interpretation.nUnexposed,
        percentage: ((isCaseControl ? interpretation.nControls : interpretation.nUnexposed) / interpretation.totalSample * 100).toFixed(1)
      }
    ];

    // Effect size comparison data
    const effectSizeData = [
      {
        measure: isCaseControl ? 'Odds Ratio' : 'Relative Risk',
        value: isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk,
        interpretation: isCaseControl ?
          (interpretation.oddsRatio > 2 ? 'Strong Association' :
           interpretation.oddsRatio > 1.5 ? 'Moderate Association' :
           interpretation.oddsRatio > 1.2 ? 'Weak Association' : 'No/Weak Association') :
          (interpretation.relativeRisk > 2 ? 'High Risk' :
           interpretation.relativeRisk > 1.5 ? 'Moderate Risk' :
           interpretation.relativeRisk > 1.2 ? 'Low Risk' : 'No/Low Risk')
      }
    ];

    return (
      <div className="space-y-8">
        {/* Enhanced Results Display */}
        <EnhancedResultsDisplay
          title={`${isCaseControl ? 'Case-Control' : 'Cohort'} Study Results`}
          subtitle={`${isCaseControl ? 'Retrospective' : 'Prospective'} Study Design`}
          results={keyMetrics}
          interpretation={{
            recommendations: [
              `Recruit ${interpretation.totalSample.toLocaleString()} participants total`,
              `Maintain ${results.parameters.ratio}:1 ratio between groups`,
              'Consider potential dropouts and increase sample by 10-20%',
              'Ensure balanced recruitment across study sites',
              'Plan for adequate follow-up period if applicable'
            ],
            assumptions: [
              `Two-sided significance test at α = ${(1 - results.parameters.confidenceLevel/100).toFixed(3)}`,
              `Statistical power = ${results.parameters.power}%`,
              `Group allocation ratio = 1:${results.parameters.ratio}`,
              'Expected effect size as specified',
              'Independent observations within and between groups'
            ]
          }}
        />



        {/* Detailed Parameters Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Study Parameters & Calculations</CardTitle>
                <p className="text-muted-foreground">Detailed breakdown of sample size calculation</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {studyParameters.map((param, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                  <span className="font-medium text-foreground">{param.parameter}</span>
                  <Badge variant="outline" className="font-mono">
                    {param.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clinical Significance Card */}
        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Microscope className="h-6 w-6 text-success" />
              <div>
                <CardTitle className="text-xl">Clinical Significance</CardTitle>
                <p className="text-muted-foreground">Interpretation and clinical relevance</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-background/50">
                <h4 className="font-semibold text-primary mb-2">Effect Size</h4>
                <div className="text-2xl font-bold text-success">
                  {(isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isCaseControl ? 'Odds Ratio' : 'Relative Risk'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-background/50">
                <h4 className="font-semibold text-primary mb-2">Study Power</h4>
                <div className="text-2xl font-bold text-primary">
                  {results.parameters.power}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Probability to detect effect
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Study Design Considerations
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                <li>• {isCaseControl ?
                  'Case-control studies are efficient for studying rare diseases or outcomes' :
                  'Cohort studies are ideal for studying multiple outcomes from a single exposure'
                }</li>
                <li>• Consider potential confounding variables and matching strategies</li>
                <li>• Plan for appropriate statistical analysis methods</li>
                <li>• {isCaseControl ?
                  'Ensure representative case and control selection' :
                  'Plan for adequate follow-up duration and retention strategies'
                }</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <ToolPageWrapper
      title="Comparative Study Sample Size Calculator"
      description="Calculate sample sizes for case-control and cohort studies with comprehensive analysis"
      icon={Users}
      layout="single-column"
    >
      {renderContent()}
      {renderResults()}
    </ToolPageWrapper>
  );
}
