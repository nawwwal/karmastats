"use client";

import { useState } from "react";
import ComparativeFormFormedible from "@/components/sample-size/ComparativeFormFormedible";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calculator, Info, Microscope, Download } from 'lucide-react';

export default function ComparativeStudyPage() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setResults(null);
    setError(null);
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
          { label: "Total Sample Size", value: interpretation.totalSample, highlight: true, category: "primary", format: "integer" },
          { label: isCaseControl ? "Cases Required" : "Exposed Group Size", value: isCaseControl ? interpretation.nCases : interpretation.nExposed, category: "secondary", format: "integer" },
          { label: isCaseControl ? "Controls Required" : "Unexposed Group Size", value: isCaseControl ? interpretation.nControls : interpretation.nUnexposed, category: "secondary", format: "integer" },
          { label: isCaseControl ? "Odds Ratio" : "Relative Risk", value: isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk, category: "statistical", format: "decimal", precision: 2 }
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

  const renderContent = () => (
    <div className="space-y-8">
      <ComparativeFormFormedible onResults={setResults} onError={setError} />
    </div>
  );

  const renderResults = () => {
    if (!results) return null;
    const isCaseControl = results.type === 'case-control';
    const interpretation = results.interpretation;
    const safeToFixed = (value: any, decimals: number): string => (typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : 'N/A');

    const keyMetrics = [
      { label: isCaseControl ? 'Cases Required' : 'Exposed Group', value: isCaseControl ? interpretation.nCases : interpretation.nExposed, category: 'primary' as const },
      { label: isCaseControl ? 'Controls Required' : 'Unexposed Group', value: isCaseControl ? interpretation.nControls : interpretation.nUnexposed, category: 'secondary' as const },
      { label: 'Total Sample Size', value: interpretation.totalSample, category: 'statistical' as const, highlight: true },
      { label: isCaseControl ? 'Odds Ratio' : 'Relative Risk', value: typeof (isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk) === 'number' ? (isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk) : 0, category: 'success' as const, format: 'decimal' as const }
    ];

    const sampleSizeData = [
      { name: isCaseControl ? 'Cases' : 'Exposed', value: isCaseControl ? interpretation.nCases : interpretation.nExposed, percentage: safeToFixed((isCaseControl ? interpretation.nCases : interpretation.nExposed) / interpretation.totalSample * 100, 1) },
      { name: isCaseControl ? 'Controls' : 'Unexposed', value: isCaseControl ? interpretation.nControls : interpretation.nUnexposed, percentage: safeToFixed((isCaseControl ? interpretation.nControls : interpretation.nUnexposed) / interpretation.totalSample * 100, 1) }
    ];

    const effectSizeValue = isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk;
    const safeEffectSize = typeof effectSizeValue === 'number' ? effectSizeValue : 1;

    const effectSizeData = [
      { measure: isCaseControl ? 'Odds Ratio' : 'Relative Risk', value: safeEffectSize, interpretation: isCaseControl ? (safeEffectSize > 2 ? 'Strong Association' : safeEffectSize > 1.5 ? 'Moderate Association' : safeEffectSize > 1.2 ? 'Weak Association' : 'No/Weak Association') : (safeEffectSize > 2 ? 'High Risk' : safeEffectSize > 1.5 ? 'Moderate Risk' : safeEffectSize > 1.2 ? 'Low Risk' : 'No/Low Risk') }
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
        <EnhancedResultsDisplay title={`${isCaseControl ? 'Case-Control' : 'Cohort'} Study Results`} subtitle={`${isCaseControl ? 'Retrospective' : 'Prospective'} Study Design`} results={keyMetrics} interpretation={interpretationData} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdvancedVisualization title="Sample Size Distribution" type="pie" data={sampleSizeData.map(d => ({ label: d.name, value: Number(d.value) }))} insights={[ { key: sampleSizeData[0].name, value: `${sampleSizeData[0].percentage}%`, significance: 'high' as const }, { key: sampleSizeData[1].name, value: `${sampleSizeData[1].percentage}%`, significance: 'high' as const } ]} />
          <AdvancedVisualization title="Effect Size" type="comparison" data={effectSizeData.map(e => ({ label: e.measure, value: parseFloat(e.value as any) }))} insights={[ { key: 'Interpretation', value: effectSizeData[0].interpretation, significance: 'medium' as const } ]} />
        </div>
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
              {[
                { parameter: 'Study Design', value: isCaseControl ? 'Case-Control (Retrospective)' : 'Cohort (Prospective)' },
                { parameter: 'Confidence Level', value: `${results.parameters.confidenceLevel}%` },
                { parameter: 'Statistical Power', value: `${results.parameters.power}%` },
                { parameter: 'Group Ratio', value: `1:${results.parameters.ratio}` },
              ].map((param, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                  <span className="font-medium text-foreground">{param.parameter}</span>
                  <Badge variant="outline" className="font-mono">{param.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-semibold text-lg">Export Your Results</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Download comprehensive PDF report with calculations and interpretations</p>
              </div>
              <Button onClick={generatePdf} size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg px-8 py-3 text-base font-semibold shrink-0">
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
    <ToolPageWrapper title="Comparative Study Sample Size Calculator" description="Calculate sample sizes for case-control and cohort studies with comprehensive analysis" icon={Users} layout="single-column" onReset={handleReset}>
      {renderContent()}
      {renderResults()}
    </ToolPageWrapper>
  );
}
