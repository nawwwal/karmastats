"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseControlForm } from "@/components/sample-size/CaseControlForm";
import { CohortForm } from "@/components/sample-size/CohortForm";
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NumberFlowDisplay } from '@/components/ui/number-flow';
import {
  Users,
  BarChart3,
  TrendingUp,
  Calculator,
  Target,
  Activity,
  Info
} from 'lucide-react';

export default function ComparativeStudyPage() {
  const [activeTab, setActiveTab] = useState("case-control");
  const [results, setResults] = useState<any>(null);

  const handleReset = () => {
    setResults(null);
    setActiveTab("case-control");
  };

  const renderInputForm = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="case-control" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Case-Control
        </TabsTrigger>
        <TabsTrigger value="cohort" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Cohort Study
        </TabsTrigger>
      </TabsList>

      <TabsContent value="case-control" className="mt-6">
        <CaseControlForm onResultsChange={setResults} />
      </TabsContent>

      <TabsContent value="cohort" className="mt-6">
        <CohortForm onResultsChange={setResults} />
      </TabsContent>
    </Tabs>
  );

  const renderResults = () => {
    if (!results) return null;

    const isCaseControl = results.type === 'case-control';
    const interpretation = results.interpretation;

    return (
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              {isCaseControl ? <Users className="h-6 w-6 text-primary" /> : <TrendingUp className="h-6 w-6 text-secondary" />}
              <div>
                <CardTitle className="text-xl">{isCaseControl ? 'Case-Control' : 'Cohort'} Study Results</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default">
                    {isCaseControl ? 'Retrospective Design' : 'Prospective Design'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Total Sample: {interpretation.totalSample.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  <NumberFlowDisplay
                    value={isCaseControl ? interpretation.nCases : interpretation.nExposed}
                    format={{ notation: "standard" }}
                    className="text-2xl font-bold"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {isCaseControl ? 'Cases Required' : 'Exposed Group'}
                </div>
                <div className="text-xs mt-1">
                  {isCaseControl ? 'With disease/outcome' : 'With risk factor'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  <NumberFlowDisplay
                    value={isCaseControl ? interpretation.nControls : interpretation.nUnexposed}
                    format={{ notation: "standard" }}
                    className="text-2xl font-bold"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {isCaseControl ? 'Controls Required' : 'Unexposed Group'}
                </div>
                <div className="text-xs mt-1">
                  {isCaseControl ? 'Without disease/outcome' : 'Without risk factor'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  <NumberFlowDisplay
                    value={interpretation.totalSample}
                    format={{ notation: "standard" }}
                    className="text-2xl font-bold"
                  />
                </div>
                <div className="text-sm text-muted-foreground">Total Sample Size</div>
                <div className="text-xs mt-1">
                  Combined groups
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Study Parameters & Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Study Design</TableCell>
                  <TableCell className="text-right">
                    {isCaseControl ? 'Case-Control (Retrospective)' : 'Cohort (Prospective)'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Confidence Level</TableCell>
                  <TableCell className="text-right">{results.parameters.confidenceLevel}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Statistical Power</TableCell>
                  <TableCell className="text-right">{results.parameters.power}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Group Ratio</TableCell>
                  <TableCell className="text-right">1:{results.parameters.ratio}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    {isCaseControl ? 'Exposure Rate (Controls)' : 'Disease Rate (Unexposed)'}
                  </TableCell>
                  <TableCell className="text-right">
                    {((isCaseControl ? results.parameters.p0 : results.parameters.p2) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    {isCaseControl ? 'Exposure Rate (Cases)' : 'Disease Rate (Exposed)'}
                  </TableCell>
                  <TableCell className="text-right">
                    {((isCaseControl ? results.parameters.p1 : results.parameters.p1) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
                <TableRow className="bg-primary/5">
                  <TableCell className="font-medium">
                    {isCaseControl ? 'Odds Ratio' : 'Relative Risk'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {isCaseControl ? interpretation.oddsRatio : interpretation.relativeRisk}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Effect Size</TableCell>
                  <TableCell className="text-right">{interpretation.effectSize}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Statistical Interpretation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Statistical Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Study Results:</strong> {
                  isCaseControl ?
                    `This case-control study requires ${interpretation.nCases} cases and ${interpretation.nControls} controls (total n=${interpretation.totalSample}) to detect an odds ratio of ${interpretation.oddsRatio} with ${results.parameters.power}% power at α=${(1 - results.parameters.confidenceLevel/100).toFixed(2)} significance level. The exposure rates differ by ${(Math.abs(results.parameters.p1 - results.parameters.p0) * 100).toFixed(1)} percentage points between cases and controls.` :
                    `This cohort study requires ${interpretation.nExposed} exposed and ${interpretation.nUnexposed} unexposed participants (total n=${interpretation.totalSample}) to detect a relative risk of ${interpretation.relativeRisk} with ${results.parameters.power}% power at α=${(1 - results.parameters.confidenceLevel/100).toFixed(2)} significance level. The disease incidence differs by ${(Math.abs(results.parameters.p1 - results.parameters.p2) * 100).toFixed(1)} percentage points between exposed and unexposed groups.`
                }
              </AlertDescription>
            </Alert>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Methodology Note</h4>
                <p className="text-sm text-muted-foreground">
                  {isCaseControl ?
                    'Case-control studies are efficient for studying rare diseases or outcomes with long latency periods. They compare exposure history between cases (with disease) and controls (without disease). This design is particularly useful when the outcome is rare, making prospective studies impractical.' :
                    'Cohort studies are ideal for studying multiple outcomes and establishing temporal relationships. They follow exposed and unexposed groups prospectively to measure disease incidence. This design provides stronger evidence for causal relationships but requires larger samples and longer follow-up periods.'
                  }
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
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
