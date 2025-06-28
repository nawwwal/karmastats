"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp, Target, Info, AlertCircle, CheckCircle, Activity,
  BarChart3, PieChart, Calculator, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

interface ResultItem {
  label: string;
  value: string | number;
  unit?: string;
  category?: 'primary' | 'secondary' | 'statistical' | 'success' | 'warning' | 'critical';
  highlight?: boolean;
  format?: 'number' | 'percentage' | 'decimal' | 'integer';
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    baseline?: string | number;
  };
  confidence?: {
    lower: number;
    upper: number;
    level: number;
  };
  interpretation?: string;
  benchmark?: {
    value: number;
    label: string;
    comparison: 'above' | 'below' | 'within';
  };
}

interface EnhancedResultsDisplayProps {
  title: string;
  subtitle?: string;
  results: ResultItem[];
  interpretation?: {
    effectSize?: string;
    recommendations?: string[];
    assumptions?: string[];
    clinicalSignificance?: string;
    statisticalSignificance?: string;
  };
  additionalContent?: React.ReactNode;
  showInterpretation?: boolean;
  layout?: 'card' | 'dashboard' | 'detailed';
  visualizations?: React.ReactNode;
}

export function EnhancedResultsDisplay({
  title,
  subtitle,
  results,
  interpretation,
  additionalContent,
  showInterpretation = true,
  layout = 'dashboard',
  visualizations
}: EnhancedResultsDisplayProps) {

  const formatValue = (value: string | number, format?: string, unit?: string) => {
    if (typeof value === 'number') {
      let formattedValue: string;
      switch (format) {
        case 'percentage':
          formattedValue = `${value.toFixed(1)}%`;
          break;
        case 'decimal':
          formattedValue = value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 3
          });
          break;
        case 'integer':
          formattedValue = Math.round(value).toLocaleString();
          break;
        default:
          formattedValue = value.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
          });
          break;
      }
      return unit ? `${formattedValue} ${unit}` : formattedValue;
    }
    return unit ? `${value} ${unit}` : value;
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'primary': return <Target className="h-5 w-5 text-primary" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'statistical': return <BarChart3 className="h-5 w-5 text-secondary" />;
      default: return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getCategoryColors = (category?: string, highlight?: boolean) => {
    // Double outline effect with subtle dark mode styling - no ring offset in dark mode
    switch (category) {
      case 'primary':
        return cn(
          "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30",
          "ring-1 ring-primary/10 dark:ring-primary/5 ring-offset-2 dark:ring-offset-0 ring-offset-background shadow-lg shadow-primary/5 dark:shadow-primary/20"
        );
      case 'success':
        return cn(
          "bg-success/10 border-success/20 text-success dark:bg-success/20 dark:border-success/30",
          "ring-1 ring-success/10 dark:ring-success/5 ring-offset-2 dark:ring-offset-0 ring-offset-background shadow-lg shadow-success/5 dark:shadow-success/20"
        );
      case 'warning':
        return cn(
          "bg-warning/10 border-warning/20 text-warning dark:bg-warning/20 dark:border-warning/30",
          "ring-1 ring-warning/10 dark:ring-warning/5 ring-offset-2 dark:ring-offset-0 ring-offset-background shadow-lg shadow-warning/5 dark:shadow-warning/20"
        );
      case 'critical':
        return cn(
          "bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/20 dark:border-destructive/30",
          "ring-1 ring-destructive/10 dark:ring-destructive/5 ring-offset-2 dark:ring-offset-0 ring-offset-background shadow-lg shadow-destructive/5 dark:shadow-destructive/20"
        );
      case 'statistical':
        return cn(
          "bg-secondary/10 border-secondary/20 text-secondary dark:bg-secondary/20 dark:border-secondary/30",
          "ring-1 ring-secondary/10 dark:ring-secondary/5 ring-offset-2 dark:ring-offset-0 ring-offset-background shadow-lg shadow-secondary/5 dark:shadow-secondary/20"
        );
      default:
        return cn(
          "bg-muted/50 border-muted text-muted-foreground dark:bg-muted/20 dark:border-muted/30",
          "ring-1 ring-muted/10 dark:ring-muted/5 ring-offset-2 dark:ring-offset-0 ring-offset-background shadow-lg shadow-muted/5 dark:shadow-muted/20"
        );
    }
  };

  const getChangeIcon = (type?: string) => {
    switch (type) {
      case 'increase': return <ArrowUpRight className="h-4 w-4 text-success" />;
      case 'decrease': return <ArrowDownRight className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  // Group results by category
  const primaryResults = results.filter(r => r.category === 'primary' || r.highlight);
  const secondaryResults = results.filter(r => r.category === 'secondary' || r.category === 'success' || r.category === 'warning');
  const statisticalResults = results.filter(r => r.category === 'statistical');
  const criticalResults = results.filter(r => r.category === 'critical');

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Critical Results Alert */}
      {criticalResults.length > 0 && (
        <Alert className="border-destructive/20 bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            <div className="space-y-2">
              <p className="font-semibold">Critical findings require attention:</p>
              {criticalResults.map((result, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{result.label}:</span>
                  <span className="font-bold">{formatValue(result.value, result.format, result.unit)}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Primary Results - Hero Cards */}
      {primaryResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {primaryResults.map((result, index) => (
            <Card key={index} className={cn("relative overflow-hidden", getCategoryColors(result.category, result.highlight))}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(result.category)}
                      <h3 className="font-semibold text-base uppercase tracking-wide">{result.label}</h3>
                    </div>
                    <div className="text-4xl font-black tracking-tight">
                      {formatValue(result.value, result.format, result.unit)}
                    </div>

                    {/* Confidence Interval */}
                    {result.confidence && (
                      <div className="text-sm space-y-1">
                        <p className="font-medium">
                          {result.confidence.level}% Confidence Interval
                        </p>
                        <p className="text-muted-foreground">
                          {result.confidence.lower.toFixed(2)} - {result.confidence.upper.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {/* Change Indicator */}
                    {result.change && (
                      <div className="flex items-center space-x-2">
                        {getChangeIcon(result.change.type)}
                        <span className="text-sm font-medium">
                          {result.change.type === 'increase' ? '+' : ''}{result.change.value}
                          {result.change.baseline && ` vs ${result.change.baseline}`}
                        </span>
                      </div>
                    )}

                    {/* Interpretation */}
                    {result.interpretation && (
                                          <p className="text-sm text-muted-foreground font-medium">
                      {result.interpretation}
                    </p>
                    )}
                  </div>
                </div>

                {/* Benchmark Progress */}
                {result.benchmark && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>vs {result.benchmark.label}</span>
                      <span className="font-medium">
                        {result.benchmark.comparison === 'above' ? 'Above' :
                         result.benchmark.comparison === 'below' ? 'Below' : 'Within'} target
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (Number(result.value) / result.benchmark.value) * 100)}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Visualizations */}
      {visualizations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-6 w-6 text-primary" />
              <span>Data Visualization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visualizations}
          </CardContent>
        </Card>
      )}

      {/* Secondary Results */}
      {secondaryResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-secondary" />
              <span>Additional Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {secondaryResults.map((result, index) => (
                <div key={index} className={cn("p-4 rounded-lg border", getCategoryColors(result.category))}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{result.label}</p>
                      <p className="text-2xl font-bold">
                        {formatValue(result.value, result.format, result.unit)}
                      </p>
                    </div>
                    {getCategoryIcon(result.category)}
                  </div>
                  {result.interpretation && (
                    <p className="text-xs mt-2 text-muted-foreground">{result.interpretation}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-primary" />
            <span>Detailed Results Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border">
                <TableHead className="font-bold text-base py-4">Parameter</TableHead>
                <TableHead className="text-right font-bold text-base py-4">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "border-b hover:bg-muted/50 transition-colors py-2",
                    result.highlight ? 'bg-primary/10 dark:bg-primary/20 border-primary/20' : ''
                  )}
                >
                  <TableCell className="font-semibold py-6">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(result.category)}
                      <span className="text-base">{result.label}</span>
                      {result.highlight && (
                        <Badge variant="secondary" className="text-xs font-bold bg-primary/20 text-primary">Key</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-6">
                    <div className="space-y-2">
                      <div className="text-2xl font-black font-mono text-foreground">
                        {formatValue(result.value, result.format, result.unit)}
                      </div>
                      {result.interpretation && (
                        <div className="text-xs text-muted-foreground font-medium">
                          {result.interpretation}
                        </div>
                      )}
                      {result.confidence && (
                        <div className="text-xs font-medium text-muted-foreground">
                          <span className="uppercase tracking-wide">CI:</span> {result.confidence.lower.toFixed(2)}-{result.confidence.upper.toFixed(2)}
                        </div>
                      )}
                      {result.benchmark && (
                        <div className="text-xs font-medium text-muted-foreground">
                          <span className="uppercase tracking-wide">Target:</span> {result.benchmark.value} ({result.benchmark.comparison})
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistical Interpretation */}
      {showInterpretation && interpretation && (
        <div className="space-y-6">
          {interpretation.effectSize && (
            <Card className="border-primary/20 bg-primary/10 dark:bg-primary/20">
              <CardContent className="py-6">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-3 text-left">
                    <h3 className="font-bold text-lg text-primary text-left">Effect Size Analysis</h3>
                    <p className="text-base leading-relaxed text-primary text-left">{interpretation.effectSize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {interpretation.statisticalSignificance && (
            <Card className="border-success/20 bg-success/10 dark:bg-success/20">
              <CardContent className="py-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <div className="space-y-3 text-left">
                    <h3 className="font-bold text-lg text-success text-left">Statistical Significance</h3>
                    <p className="text-base leading-relaxed text-success text-left">{interpretation.statisticalSignificance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {interpretation.clinicalSignificance && (
            <Card className="border-secondary/20 bg-secondary/10 dark:bg-secondary/20">
              <CardContent className="py-6">
                <div className="flex items-start space-x-3">
                  <Activity className="h-6 w-6 text-secondary mt-0.5 flex-shrink-0" />
                  <div className="space-y-3 text-left">
                    <h3 className="font-bold text-lg text-secondary text-left">Clinical Significance</h3>
                    <p className="text-base leading-relaxed text-secondary text-left">{interpretation.clinicalSignificance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interpretation.recommendations && interpretation.recommendations.length > 0 && (
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Info className="h-6 w-6 text-info" />
                    <span>Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {interpretation.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-info mt-2.5 flex-shrink-0" />
                        <span className="text-base font-medium leading-relaxed text-left">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {interpretation.assumptions && interpretation.assumptions.length > 0 && (
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <AlertCircle className="h-6 w-6 text-warning" />
                    <span>Assumptions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {interpretation.assumptions.map((assumption, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-warning mt-2.5 flex-shrink-0" />
                        <span className="text-base font-medium leading-relaxed text-left">{assumption}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Additional Content */}
      {additionalContent && (
        <>
          <Separator />
          <div className="space-y-6">
            {additionalContent}
          </div>
        </>
      )}
    </div>
  );
}
