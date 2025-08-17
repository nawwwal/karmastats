'use client';

import React, { useState } from 'react';
import * as z from 'zod';

import {
  SuperiorityBinaryOutput,
  SuperiorityContinuousOutput,
  NonInferiorityOutput,
  EquivalenceOutput,
} from '@/lib/clinicalTrial';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper';
import { EnhancedResultsDisplay } from '@/components/ui/enhanced-results-display';
import { AdvancedVisualization } from '@/components/ui/advanced-visualization';
import {
  EnhancedTabs,
  EnhancedTabsList,
  EnhancedTabsTrigger,
  EnhancedTabsContent,
} from '@/components/ui/enhanced-tabs';
import {
  Activity,
  Target,
  TrendingUp,
  Shield,
  Download,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import ClinicalTrialsFormFormedible from '@/components/sample-size/ClinicalTrialsFormFormedible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type Results =
  | SuperiorityBinaryOutput
  | SuperiorityContinuousOutput
  | NonInferiorityOutput
  | EquivalenceOutput;

export default function ClinicalTrialsPage() {
  const [activeTab, setActiveTab] = useState<
    'superiority' | 'non-inferiority' | 'equivalence'
  >('superiority');
  const [superiorityOutcome, setSuperiorityOutcome] = useState<
    'binary' | 'continuous'
  >('binary');
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastValues, setLastValues] = useState<Record<string, unknown> | null>(
    null,
  );

  const handleReset = () => {
    setResults(null);
    setError(null);
    setLastValues(null);
  };

  const generatePdf = async () => {
    if (!results || !lastValues) return;

    try {
      const { generateModernPDF } = await import('@/lib/pdf-utils');
      const formData = lastValues;

      let config: any = {
        calculatorType: `Clinical Trial ${
          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        }`,
        inputs: [],
        results: [],
        interpretation: {
          recommendations: [],
          assumptions: [],
        },
      };

      if ('nnt' in results) {
        // Superiority Binary
        config.title = 'Superiority Clinical Trial Design';
        config.subtitle = 'Binary Outcome Analysis';
        config.inputs = [
          {
            label: 'Control Group Event Rate',
            value: formData.controlRate,
            unit: '%',
          },
          {
            label: 'Treatment Group Event Rate',
            value: formData.treatmentRate,
            unit: '%',
          },
          { label: 'Allocation Ratio', value: formData.allocationRatio },
          {
            label: 'Significance Level',
            value: Number(formData.alpha) || 0,
            unit: '%',
          },
          {
            label: 'Statistical Power',
            value: Number(formData.power) || 0,
            unit: '%',
          },
          { label: 'Dropout Rate', value: formData.dropoutRate, unit: '%' },
        ];
        config.results = [
          {
            label: 'Total Required Sample Size',
            value: results.totalSize,
            highlight: true,
            category: 'primary',
            format: 'integer',
          },
          {
            label: 'Number Needed to Treat (NNT)',
            value: results.nnt,
            highlight: true,
            category: 'primary',
            format: 'decimal',
            precision: 1,
          },
          {
            label: 'Treatment Group Size',
            value: results.treatmentSize,
            category: 'secondary',
            format: 'integer',
          },
          {
            label: 'Control Group Size',
            value: results.controlSize,
            category: 'secondary',
            format: 'integer',
          },
        ];
        config.interpretation.summary = `This superiority trial requires ${
          results.totalSize
        } participants total to detect a difference between ${
          formData.controlRate
        }% and ${
          formData.treatmentRate
        }% event rates. The Number Needed to Treat (NNT = ${results.nnt.toFixed(
          1,
        )}) indicates you need to treat ${Math.round(
          results.nnt,
        )} patients to prevent one additional adverse event.`;
      }

      await generateModernPDF(config);
    } catch (err: any) {
      setError(`Failed to generate PDF: ${err.message}`);
    }
  };

  const renderResults = () => {
    if (!results || !lastValues) return null;

    const getTrialTypeName = () => {
      switch (activeTab) {
        case 'superiority':
          return 'Superiority Trial';
        case 'non-inferiority':
          return 'Non-Inferiority Trial';
        case 'equivalence':
          return 'Equivalence Trial';
        default:
          return 'Clinical Trial';
      }
    };

    let enhancedResults: any[] = [];
    let visualizationData: any[] = [];
    let interpretationData: any = {};

    const benefitDifference =
      (lastValues.treatmentRate as number) - (lastValues.controlRate as number);

    if ('nnt' in results) {
      // Superiority Binary
      enhancedResults = [
        {
          label: 'Total Sample Size',
          value: results.totalSize,
          format: 'integer' as const,
          category: 'primary' as const,
          highlight: true,
          interpretation: 'Total participants needed for adequate power',
        },
        {
          label: 'Number Needed to Treat (NNT)',
          value: results.nnt,
          format: 'decimal' as const,
          category: 'primary' as const,
          highlight: true,
          interpretation: 'Patients needed to treat to prevent one event',
        },
        {
          label: 'Treatment Group Size',
          value: results.treatmentSize,
          format: 'integer' as const,
          category: 'secondary' as const,
        },
        {
          label: 'Control Group Size',
          value: results.controlSize,
          format: 'integer' as const,
          category: 'secondary' as const,
        },
        {
          label: 'Effect Size (Benefit Difference)',
          value: benefitDifference,
          format: 'decimal' as const,
          category: 'statistical' as const,
          unit: '%',
        },
      ];

      visualizationData = [
        {
          label: 'Treatment Group',
          value: results.treatmentSize,
          color: 'hsl(var(--success))',
        },
        {
          label: 'Control Group',
          value: results.controlSize,
          color: 'hsl(var(--primary))',
        },
      ];

      interpretationData = {
        effectSize: `Benefit difference of ${benefitDifference.toFixed(
          1,
        )}% between treatment and control groups`,
        statisticalSignificance: `NNT = ${results.nnt.toFixed(
          1,
        )} indicates moderate treatment effect`,
        clinicalSignificance: `Trial requires ${results.totalSize} participants to detect meaningful clinical difference`,
        recommendations: [
          'Ensure balanced randomization between groups',
          'Plan for adequate follow-up duration',
          'Consider interim analyses for safety monitoring',
          'Account for potential dropout with 10-20% inflation',
          'Validate outcome measurement procedures',
        ],
        assumptions: [
          'Binary outcome with expected event rates',
          'Independent observations between participants',
          'Fixed treatment allocation ratio',
          'No interim efficacy analyses planned',
          'Adequate blinding procedures possible',
        ],
      };
    } else if ('totalSize' in results) {
      // Other trial types
      enhancedResults = [
        {
          label: 'Total Sample Size',
          value: results.totalSize,
          format: 'integer' as const,
          category: 'primary' as const,
          highlight: true,
          interpretation: 'Total participants needed for adequate power',
        },
      ];

      if ('treatmentSize' in results) {
        enhancedResults.push({
          label: 'Treatment Group Size',
          value: results.treatmentSize,
          format: 'integer' as const,
          category: 'secondary' as const,
        });
      }

      if ('controlSize' in results) {
        enhancedResults.push({
          label: 'Control Group Size',
          value: results.controlSize,
          format: 'integer' as const,
          category: 'secondary' as const,
        });
      }

      visualizationData = [
        {
          label: 'Required Sample',
          value: results.totalSize,
          color: 'hsl(var(--primary))',
        },
      ];
    }

    return (
      <div className="space-y-8">
        <EnhancedResultsDisplay
          title={`${getTrialTypeName()} Results`}
          subtitle="Clinical trial design and sample size analysis"
          results={enhancedResults}
          interpretation={interpretationData}
          visualizations={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvancedVisualization
                title="Sample Size Distribution"
                type="pie"
                data={visualizationData}
                insights={[
                  {
                    key: 'Total participants',
                    value: results.totalSize.toString(),
                    significance: 'high',
                  },
                  {
                    key: 'Study design',
                    value: getTrialTypeName(),
                    significance: 'medium',
                  },
                ]}
              />

              {'nnt' in results && (
                <AdvancedVisualization
                  title="Treatment Effectiveness"
                  type="comparison"
                  data={[
                    {
                      label: 'Control Success Rate',
                      value: (lastValues.controlRate as number) || 0,
                    },
                    {
                      label: 'Treatment Success Rate',
                      value: (lastValues.treatmentRate as number) || 0,
                    },
                    {
                      label: 'Absolute Benefit Increase',
                      value: benefitDifference,
                    },
                    { label: 'Number Needed to Treat', value: results.nnt },
                  ]}
                />
              )}
            </div>
          }
        />

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-semibold text-lg">Export Your Results</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Download a comprehensive PDF report with all calculations and
                  interpretations
                </p>
              </div>
              <Button
                type="button"
                onClick={generatePdf}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-base font-semibold shrink-0"
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

  const renderInputForm = () => (
    <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
      <CardContent className="space-y-8 pt-8">
        {error && (
          <Alert className="border-destructive/20 bg-destructive/10 text-left">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive font-bold">
              Calculation Error
            </AlertTitle>
            <AlertDescription className="text-destructive text-left">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <EnhancedTabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(
              value as 'superiority' | 'non-inferiority' | 'equivalence',
            )
          }
          className="space-y-8"
        >
          <EnhancedTabsList
            className="grid w-full grid-cols-3"
            variant="modern"
          >
            <EnhancedTabsTrigger value="superiority" variant="modern">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Superiority</span>
              </div>
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger value="non-inferiority" variant="modern">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Non-Inferiority</span>
              </div>
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger value="equivalence" variant="modern">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Equivalence</span>
              </div>
            </EnhancedTabsTrigger>
          </EnhancedTabsList>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-xl">Study Design Parameters</CardTitle>
              <CardDescription>
                Standard statistical parameters for clinical trial design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeTab === 'superiority' && (
                <RadioGroup
                  defaultValue="binary"
                  onValueChange={(v) =>
                    setSuperiorityOutcome(v as 'binary' | 'continuous')
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="binary" id="binary" />
                    <Label htmlFor="binary">Binary Outcome</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="continuous" id="continuous" />
                    <Label htmlFor="continuous">Continuous Outcome</Label>
                  </div>
                </RadioGroup>
              )}
              <ClinicalTrialsFormFormedible
                onResults={(r, v) => {
                  setResults(r);
                  setLastValues(v);
                }}
                onError={setError}
                activeTab={activeTab}
                superiorityOutcome={superiorityOutcome}
              />
            </CardContent>
          </Card>
        </EnhancedTabs>
      </CardContent>
    </Card>
  );

  return (
    <ToolPageWrapper
      title="Clinical Trial Sample Size Calculator"
      description="Design superior, non-inferiority, and equivalence trials with comprehensive sample size calculations and advanced visualizations"
      backHref="/"
      backLabel="Sample Size Calculator"
      onReset={handleReset}
      icon={Activity}
      layout="single-column"
    >
      <div className="space-y-8">
        {renderInputForm()}
        {results && renderResults()}
      </div>
    </ToolPageWrapper>
  );
}
