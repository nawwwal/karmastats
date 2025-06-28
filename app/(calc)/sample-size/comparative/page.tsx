"use client";

import { useState, useEffect } from "react";
import { CaseControlForm } from "@/components/sample-size/CaseControlForm";
import { CohortForm } from "@/components/sample-size/CohortForm";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import {
  EnhancedTabs,
  EnhancedTabsList,
  EnhancedTabsTrigger,
  EnhancedTabsContent,
} from '@/components/ui/enhanced-tabs';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  BarChart3,
  TrendingUp,
  Calculator,
  Target,
  Activity,
  Info,
  Microscope,
  Clock,
  Download
} from 'lucide-react';

export default function ComparativeStudyPage() {
  const [activeTab, setActiveTab] = useState("case-control");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setResults(null);
    setError(null);
    setActiveTab("case-control");
  };

  const generatePdf = async () => {
    if (!results) return;

    try {
      const { generateModernPDF } = await import('@/lib/pdf-utils');
      const isCaseControl = results.type === 'case-control';
      const interpretation = results.interpretation;

      const config = {
        calculatorType: `${isCaseControl ? 'Case-Control' : 'Cohort'} Study Sample Size`,
        title: `${isCaseControl ? 'Case-Control' : 'Cohort'} Study Design`,
        subtitle: `${isCaseControl ? 'Retrospective' : 'Prospective'} Study Sample Size Analysis`,
        inputs: [
          { label: "Confidence Level", value: results.parameters.confidenceLevel, unit: "%" },
          { label: "Statistical Power", value: results.parameters.power, unit: "%" },
          {
            label: isCaseControl ? "Controls to Cases Ratio" : "Unexposed to Exposed Ratio",
            value: results.parameters.ratio
          },
          {
            label: isCaseControl ? "Exposure Rate in Controls" : "Disease Rate in Unexposed",
            value: (isCaseControl ? results.parameters.p0 : results.parameters.p2) * 100,
            unit: "%"
          },
          {
            label: isCaseControl ? "Exposure Rate in Cases" : "Disease Rate in Exposed",
            value: (isCaseControl ? results.parameters.p1 : results.parameters.p1) * 100,
            unit: "%"
          }
        ],
        results: [
          {
            label: "Total Sample Size",
            value: interpretation.totalSample,
            highlight: true,
            category: "primary",
            format: "integer"
          },
          {
            label: isCaseControl ? "Cases Required" : "Exposed Group Size",
            value: isCaseControl ? interpretation.nCases : interpretation.nExposed,
            category: "secondary",
            format: "integer"
          },
          {
            label: isCaseControl ? "Controls Required" : "Unexposed Group Size",
            value: isCaseControl ? interpretation.nControls : interpretation.nUnexposed,
            category: "secondary",
            format: "integer"
          },
          {
            label: isCaseControl ? "Odds Ratio" : "Relative Risk",
            value: isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk,
            category: "statistical",
            format: "decimal",
            precision: 2
          }
        ],
        interpretation: {
          summary: `This ${isCaseControl ? 'case-control' : 'cohort'} study requires ${interpretation.totalSample.toLocaleString()} participants total to detect the expected effect size with adequate statistical power.`,
          recommendations: [
            `Recruit ${interpretation.totalSample.toLocaleString()} participants total`,
            `Maintain ${results.parameters.ratio}:1 ratio between groups`,
            'Consider potential dropouts and increase sample by 10-20%',
            'Ensure balanced recruitment across study sites',
            isCaseControl ? 'Ensure representative case and control selection' : 'Plan for adequate follow-up duration'
          ],
          assumptions: [
            `Two-sided significance test at α = ${((100 - results.parameters.confidenceLevel) / 100).toFixed(3)}`,
            `Statistical power = ${results.parameters.power}%`,
            `Group allocation ratio = 1:${results.parameters.ratio}`,
            'Expected effect size as specified',
            'Independent observations within and between groups'
          ]
        }
      };

      await generateModernPDF(config);
    } catch (err: any) {
      setError(`Failed to generate PDF: ${err.message}`);
    }
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
        className="space-y-4"
      >
        <EnhancedTabsList className="grid w-full grid-cols-2" variant="modern">
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

        <EnhancedTabsContent value="case-control">
          <CaseControlForm onResultsChange={setResults} />
        </EnhancedTabsContent>
        <EnhancedTabsContent value="cohort">
          <CohortForm onResultsChange={setResults} />
        </EnhancedTabsContent>
      </EnhancedTabs>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    const isCaseControl = results.type === 'case-control';
    const interpretation = results.interpretation;

    // Helper function to safely format numbers
    const safeToFixed = (value: any, decimals: number): string => {
      if (typeof value === 'number' && !isNaN(value)) {
        return value.toFixed(decimals);
      }
      return 'N/A';
    };

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
        value: typeof (isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk) === 'number'
          ? (isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk)
          : 0,
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
        value: `${safeToFixed((isCaseControl ? results.parameters.p0 : results.parameters.p2) * 100, 1)}%`
      },
      {
        parameter: isCaseControl ? 'Exposure Rate (Cases)' : 'Disease Rate (Exposed)',
        value: `${safeToFixed((isCaseControl ? results.parameters.p1 : results.parameters.p1) * 100, 1)}%`
      }
    ];

    // Sample size distribution data for visualization
    const sampleSizeData = [
      {
        name: isCaseControl ? 'Cases' : 'Exposed',
        value: isCaseControl ? interpretation.nCases : interpretation.nExposed,
        percentage: safeToFixed((isCaseControl ? interpretation.nCases : interpretation.nExposed) / interpretation.totalSample * 100, 1)
      },
      {
        name: isCaseControl ? 'Controls' : 'Unexposed',
        value: isCaseControl ? interpretation.nControls : interpretation.nUnexposed,
        percentage: safeToFixed((isCaseControl ? interpretation.nControls : interpretation.nUnexposed) / interpretation.totalSample * 100, 1)
      }
    ];

    // Effect size comparison data
    const effectSizeValue = isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk;
    const safeEffectSize = typeof effectSizeValue === 'number' ? effectSizeValue : 1;

    const effectSizeData = [
      {
        measure: isCaseControl ? 'Odds Ratio' : 'Relative Risk',
        value: safeEffectSize,
        interpretation: isCaseControl ?
          (safeEffectSize > 2 ? 'Strong Association' :
           safeEffectSize > 1.5 ? 'Moderate Association' :
           safeEffectSize > 1.2 ? 'Weak Association' : 'No/Weak Association') :
          (safeEffectSize > 2 ? 'High Risk' :
           safeEffectSize > 1.5 ? 'Moderate Risk' :
           safeEffectSize > 1.2 ? 'Low Risk' : 'No/Low Risk')
      }
    ];

    const interpretationData = {
      effectSize: `${isCaseControl ? 'Odds ratio' : 'Relative risk'} of ${safeToFixed(isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk, 2)}`,
      statisticalSignificance: `Power ${results.parameters.power}% at α = ${safeToFixed(1 - results.parameters.confidenceLevel/100, 3)}`,
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
    };

    return (
      <div className="space-y-8">
        {/* Enhanced Results Display */}
        <EnhancedResultsDisplay
          title={`${isCaseControl ? 'Case-Control' : 'Cohort'} Study Results`}
          subtitle={`${isCaseControl ? 'Retrospective' : 'Prospective'} Study Design`}
          results={keyMetrics}
          interpretation={interpretationData}
        />

        {/* Advanced Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdvancedVisualization
            title="Sample Size Distribution"
            type="pie"
            data={sampleSizeData.map(d => ({ label: d.name, value: Number(d.value) }))}
            insights={[
              { key: sampleSizeData[0].name, value: `${sampleSizeData[0].percentage}%`, significance: 'high' as const },
              { key: sampleSizeData[1].name, value: `${sampleSizeData[1].percentage}%`, significance: 'high' as const }
            ]}
          />

          <AdvancedVisualization
            title="Effect Size"
            type="comparison"
            data={effectSizeData.map(e => ({ label: e.measure, value: parseFloat(e.value as any) }))}
            insights={[
              { key: 'Interpretation', value: effectSizeData[0].interpretation, significance: 'medium' as const }
            ]}
          />
        </div>

        {/* Detailed Parameters Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 ring-1 ring-primary/10 dark:ring-primary/5 ring-offset-2 dark:ring-offset-0 ring-offset-background shadow-lg shadow-primary/5 dark:shadow-primary/20">
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
        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-primary/5 ring-1 ring-success/10 dark:ring-success/5 ring-offset-2 dark:ring-offset-0 ring-offset-background shadow-lg shadow-success/5 dark:shadow-success/20">
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
                  {safeToFixed(isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk, 2)}
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

        {/* PDF Export Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-semibold text-lg">Export Your Results</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Download comprehensive PDF report with calculations and interpretations
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
      title="Comparative Study Sample Size Calculator"
      description="Calculate sample sizes for case-control and cohort studies with comprehensive analysis"
      icon={Users}
      layout="single-column"
      onReset={handleReset}
    >
      {renderContent()}
      {renderResults()}
    </ToolPageWrapper>
  );
}
