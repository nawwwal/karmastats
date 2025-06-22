"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Target, Info, AlertCircle } from 'lucide-react';
import { NumberFlowDisplay } from './number-flow';
import { AnimatedGradient } from './animated-gradient';

interface ResultItem {
  label: string;
  value: string | number;
  unit?: string;
  category?: 'primary' | 'secondary' | 'statistical';
  highlight?: boolean;
  format?: 'number' | 'percentage' | 'decimal' | 'integer';
}

interface ResultsDisplayProps {
  title: string;
  results: ResultItem[];
  interpretation?: {
    effectSize?: string;
    recommendations?: string[];
    assumptions?: string[];
  };
  additionalContent?: React.ReactNode;
  showInterpretation?: boolean;
  animated?: boolean;
  animationColors?: string[];
}

export function ResultsDisplay({
  title,
  results,
  interpretation,
  additionalContent,
  showInterpretation = true,
  animated = true,
  animationColors = [
    "hsl(var(--primary) / 0.3)",
    "hsl(var(--secondary) / 0.25)",
    "hsl(var(--accent) / 0.2)"
  ]
}: ResultsDisplayProps) {
  const formatValue = (value: string | number, format?: string, unit?: string) => {
    if (typeof value === 'number') {
      switch (format) {
        case 'percentage':
          return (
            <NumberFlowDisplay
              value={value}
              suffix="%"
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          );
        case 'decimal':
          return (
            <NumberFlowDisplay
              value={value}
              suffix={unit ? ` ${unit}` : ''}
              format={{ minimumFractionDigits: 4, maximumFractionDigits: 4 }}
            />
          );
        case 'integer':
          return (
            <NumberFlowDisplay
              value={Math.round(value)}
              suffix={unit ? ` ${unit}` : ''}
              format={{ maximumFractionDigits: 0 }}
            />
          );
        default:
          return (
            <NumberFlowDisplay
              value={value}
              suffix={unit ? ` ${unit}` : ''}
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          );
      }
    }

    return unit ? `${value} ${unit}` : value;
  };

  // Group results by category
  const primaryResults = results.filter(r => r.category === 'primary' || r.highlight);
  const secondaryResults = results.filter(r => r.category === 'secondary' && !r.highlight);
  const statisticalResults = results.filter(r => r.category === 'statistical');

  return (
    <div className="space-y-6">
      {/* Key Results Cards */}
      {primaryResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {primaryResults.map((result, index) => (
            <Card key={index} className="relative bg-primary/5 border-primary/20 overflow-hidden">
              {animated && (
                <AnimatedGradient
                  colors={animationColors}
                  speed={3}
                  blur="medium"
                  className="pointer-events-none"
                />
              )}
              <CardContent className="relative z-10 p-4 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{result.label}</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatValue(result.value, result.format, result.unit)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Results Table */}
      <Card className="relative overflow-hidden">
        {animated && (
          <AnimatedGradient
            colors={animationColors}
            speed={4}
            blur="heavy"
            className="pointer-events-none opacity-40"
          />
        )}
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index} className={result.highlight ? 'bg-primary/5' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{result.label}</span>
                      {result.highlight && (
                        <Badge variant="secondary" className="text-xs">Key Result</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatValue(result.value, result.format, result.unit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistical Interpretation */}
      {showInterpretation && interpretation && (
        <div className="space-y-4">
          {interpretation.effectSize && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Effect Size:</strong> {interpretation.effectSize}
              </AlertDescription>
            </Alert>
          )}

          {interpretation.recommendations && interpretation.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <span>Methodological Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm">
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
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span>Statistical Assumptions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
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
      {additionalContent && (
        <>
          <Separator />
          {additionalContent}
        </>
      )}
    </div>
  );
}
