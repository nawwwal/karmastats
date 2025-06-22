"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Target, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileText, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper function to format numbers
const formatNumber = (
  value: number,
  format?: 'integer' | 'decimal' | 'percentage' | 'currency',
  minimumFractionDigits?: number,
  maximumFractionDigits?: number
) => {
  if (format === 'integer') {
    return Math.round(value).toLocaleString();
  }
  if (format === 'percentage') {
    return `${value.toFixed(minimumFractionDigits || 1)}%`;
  }
  if (format === 'currency') {
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: minimumFractionDigits || 2,
      maximumFractionDigits: maximumFractionDigits || 2
    });
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: minimumFractionDigits || 0,
    maximumFractionDigits: maximumFractionDigits || 3
  });
};

export interface ResultItem {
  label: string;
  value: number;
  category?: 'primary' | 'secondary' | 'tertiary' | 'statistical' | 'warning' | 'error';
  highlight?: boolean;
  format?: 'integer' | 'decimal' | 'percentage' | 'currency';
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface Interpretation {
  summary?: string;
  recommendations?: string[];
  assumptions?: string[];
  limitations?: string[];
  references?: string[];
}

interface ResultsDisplayProps {
  title: string;
  subtitle?: string;
  results: ResultItem[];
  interpretation?: Interpretation;
  showInterpretation?: boolean;
  className?: string;
  onExport?: () => void;
}

const ResultValueDisplay: React.FC<{
  item: ResultItem;
  size?: 'sm' | 'md' | 'lg'
}> = ({ item, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold'
  };

  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-green-500" />,
    down: <TrendingDown className="h-4 w-4 text-red-500" />,
    neutral: <Minus className="h-4 w-4 text-gray-500" />
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn(sizeClasses[size])}>
        {formatNumber(
          item.value,
          item.format,
          item.minimumFractionDigits,
          item.maximumFractionDigits
        )}
      </span>
      {item.trend && trendIcon[item.trend]}
    </div>
  );
};

export function ResultsDisplay({
  title,
  subtitle,
  results,
  interpretation,
  showInterpretation = true,
  className,
  onExport
}: ResultsDisplayProps) {
  // Group results by category
  const primaryResults = results.filter(r => r.category === 'primary' || r.highlight);
  const secondaryResults = results.filter(r => r.category === 'secondary' && !r.highlight);
  const statisticalResults = results.filter(r => r.category === 'statistical');

  return (
    <div className={cn("space-y-4", className)}>
      {/* Key Results Cards */}
      {primaryResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {primaryResults.map((result, index) => (
            <Card key={index} className="bg-indigo-50 border-indigo-300">
              <CardContent className="p-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-gray-700 uppercase tracking-wide">{result.label}</h3>
                  <div className="text-4xl font-black text-indigo-700 tracking-tight">
                    <ResultValueDisplay item={result} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-bold text-gray-700">Parameter</TableHead>
                <TableHead className="text-right text-base font-bold text-gray-700">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index} className={result.highlight ? 'bg-indigo-50' : ''}>
                  <TableCell className="font-semibold text-gray-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{result.label}</span>
                      {result.highlight && (
                        <Badge variant="secondary" className="text-sm font-bold">Key Result</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-lg font-bold text-gray-900">
                    <ResultValueDisplay item={result} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistical Interpretation */}
      {showInterpretation && interpretation && (
        <div className="space-y-3">
          {interpretation.summary && (
            <Alert>
              <TrendingUp className="h-5 w-5" />
              <AlertDescription className="text-base font-medium">
                <strong className="text-lg">Summary:</strong> {interpretation.summary}
              </AlertDescription>
            </Alert>
          )}

          {interpretation.recommendations && interpretation.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-6 w-6 text-cyan-600" />
                  <span className="text-lg font-bold text-gray-900">Methodological Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-base font-medium text-gray-700">
                  {interpretation.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
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
                  <span className="text-lg font-bold text-gray-900">Statistical Assumptions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-base font-medium text-gray-600">
                  {interpretation.assumptions.map((assumption, index) => (
                    <li key={index}>{assumption}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Additional Content */}
      {onExport && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-700">Export Results</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onExport}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
