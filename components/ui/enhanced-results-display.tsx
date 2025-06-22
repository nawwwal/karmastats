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
      case 'primary': return <Target className="h-5 w-5 text-blue-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'statistical': return <BarChart3 className="h-5 w-5 text-purple-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColors = (category?: string, highlight?: boolean) => {
    const base = highlight ? 'ring-2 ring-offset-2' : '';
    switch (category) {
      case 'primary':
        return cn(base, highlight && 'ring-blue-300', "bg-blue-50 border-blue-200 text-blue-900");
      case 'success':
        return cn(base, highlight && 'ring-green-300', "bg-green-50 border-green-200 text-green-900");
      case 'warning':
        return cn(base, highlight && 'ring-amber-300', "bg-amber-50 border-amber-200 text-amber-900");
      case 'critical':
        return cn(base, highlight && 'ring-red-300', "bg-red-50 border-red-200 text-red-900");
      case 'statistical':
        return cn(base, highlight && 'ring-purple-300', "bg-purple-50 border-purple-200 text-purple-900");
      default:
        return cn(base, highlight && 'ring-gray-300', "bg-gray-50 border-gray-200 text-gray-900");
    }
  };

  const getChangeIcon = (type?: string) => {
    switch (type) {
      case 'increase': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'decrease': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
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
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-lg text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Critical Results Alert */}
      {criticalResults.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
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
                        <p className="text-gray-600">
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
                      <p className="text-sm text-gray-700 font-medium">
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
              <PieChart className="h-6 w-6 text-indigo-600" />
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
              <BarChart3 className="h-6 w-6 text-purple-600" />
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
                    <p className="text-xs mt-2 text-gray-600">{result.interpretation}</p>
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
            <Target className="h-6 w-6 text-blue-600" />
            <span>Detailed Results Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Parameter</TableHead>
                <TableHead className="text-right font-bold">Value</TableHead>
                <TableHead className="text-right font-bold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index} className={result.highlight ? 'bg-blue-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(result.category)}
                      <span>{result.label}</span>
                      {result.highlight && (
                        <Badge variant="secondary" className="text-xs">Key</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {formatValue(result.value, result.format, result.unit)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-600">
                    {result.confidence && (
                      <span>CI: {result.confidence.lower.toFixed(2)}-{result.confidence.upper.toFixed(2)}</span>
                    )}
                    {result.benchmark && (
                      <span className="ml-2">
                        Target: {result.benchmark.value} ({result.benchmark.comparison})
                      </span>
                    )}
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
            <Alert className="border-blue-200 bg-blue-50">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p className="font-semibold">Effect Size Analysis</p>
                  <p>{interpretation.effectSize}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {interpretation.statisticalSignificance && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-semibold">Statistical Significance</p>
                  <p>{interpretation.statisticalSignificance}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {interpretation.clinicalSignificance && (
            <Alert className="border-purple-200 bg-purple-50">
              <Activity className="h-5 w-5 text-purple-600" />
              <AlertDescription className="text-purple-800">
                <div className="space-y-2">
                  <p className="font-semibold">Clinical Significance</p>
                  <p>{interpretation.clinicalSignificance}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interpretation.recommendations && interpretation.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-6 w-6 text-cyan-600" />
                    <span>Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {interpretation.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {interpretation.assumptions && interpretation.assumptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                    <span>Assumptions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {interpretation.assumptions.map((assumption, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{assumption}</span>
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
