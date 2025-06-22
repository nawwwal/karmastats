"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { NumberFlowDisplay } from './number-flow';
import { AnimatedGradient } from './animated-gradient';
import { cn } from '@/lib/utils';

interface ModernMetricCard {
  label: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    label?: string;
  };
  comparison?: {
    baseline: string | number;
    label?: string;
  };
  significance?: {
    level: 'high' | 'medium' | 'low' | 'critical';
    indicator: string;
  };
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'percentage' | 'decimal' | 'integer' | 'currency';
  category?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info';
}

interface ModernResultsDisplayProps {
  title?: string;
  metrics: ModernMetricCard[];
  layout?: 'grid-2' | 'grid-3' | 'grid-4' | 'grid-auto';
  animated?: boolean;
  showComparisons?: boolean;
  className?: string;
}

export function ModernResultsDisplay({
  title,
  metrics,
  layout = 'grid-auto',
  animated = true,
  showComparisons = true,
  className
}: ModernResultsDisplayProps) {

  const formatValue = (value: string | number, format?: string, unit?: string) => {
    if (typeof value === 'number') {
      switch (format) {
        case 'percentage':
          return (
            <NumberFlowDisplay
              value={value}
              suffix="%"
              format={{ minimumFractionDigits: 1, maximumFractionDigits: 2 }}
            />
          );
        case 'decimal':
          return (
            <NumberFlowDisplay
              value={value}
              suffix={unit ? ` ${unit}` : ''}
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 4 }}
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
        case 'currency':
          return (
            <NumberFlowDisplay
              value={value}
              prefix="$"
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          );
        default:
          return (
            <NumberFlowDisplay
              value={value}
              suffix={unit ? ` ${unit}` : ''}
              format={{ minimumFractionDigits: 0, maximumFractionDigits: 3 }}
            />
          );
      }
    }
    return unit ? `${value} ${unit}` : value;
  };

  const getGridCols = () => {
    switch (layout) {
      case 'grid-2': return 'grid-cols-1 sm:grid-cols-2';
      case 'grid-3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 'grid-4': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default:
        const count = metrics.length;
        if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
        if (count <= 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const getCategoryColors = (category?: string) => {
    switch (category) {
      case 'primary':
        return {
          gradient: ["hsl(var(--primary) / 0.1)", "hsl(var(--primary) / 0.05)"],
          text: "text-primary",
          border: "border-primary/20"
        };
      case 'success':
        return {
          gradient: ["hsl(var(--success) / 0.1)", "hsl(var(--success) / 0.05)"],
          text: "text-success",
          border: "border-success/20"
        };
      case 'warning':
        return {
          gradient: ["hsl(var(--warning) / 0.1)", "hsl(var(--warning) / 0.05)"],
          text: "text-warning",
          border: "border-warning/20"
        };
      case 'destructive':
        return {
          gradient: ["hsl(var(--destructive) / 0.1)", "hsl(var(--destructive) / 0.05)"],
          text: "text-destructive",
          border: "border-destructive/20"
        };
      case 'info':
        return {
          gradient: ["hsl(var(--info) / 0.1)", "hsl(var(--info) / 0.05)"],
          text: "text-info",
          border: "border-info/20"
        };
      default:
        return {
          gradient: ["hsl(var(--muted) / 0.1)", "hsl(var(--muted) / 0.05)"],
          text: "text-foreground",
          border: "border-border"
        };
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeIcon = (type?: string) => {
    switch (type) {
      case 'increase': return <TrendingUp className="h-3 w-3" />;
      case 'decrease': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeColor = (type?: string) => {
    switch (type) {
      case 'increase': return 'text-success bg-success/10';
      case 'decrease': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  const getSignificanceIcon = (level?: string) => {
    switch (level) {
      case 'critical': return <AlertCircle className="h-3 w-3 text-destructive" />;
      case 'high': return <CheckCircle className="h-3 w-3 text-success" />;
      case 'medium': return <Info className="h-3 w-3 text-warning" />;
      default: return <Target className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {title && (
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Statistical analysis results
          </p>
        </div>
      )}

      <div className={cn("grid gap-6", getGridCols())}>
        {metrics.map((metric, index) => {
          const colors = getCategoryColors(metric.category);

          return (
            <Card
              key={index}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-white/50 backdrop-blur-sm",
                colors.border
              )}
            >
              {animated && (
                <AnimatedGradient
                  colors={colors.gradient}
                  speed={2 + (index * 0.3)}
                  blur="light"
                  className="pointer-events-none opacity-60"
                />
              )}

              <CardContent className="relative z-10 p-6">
                {/* Header with label and trend */}
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    {metric.significance && (
                      <div className="flex items-center gap-1">
                        {getSignificanceIcon(metric.significance.level)}
                        <span className="text-xs text-muted-foreground">
                          {metric.significance.indicator}
                        </span>
                      </div>
                    )}
                  </div>
                  {metric.trend && (
                    <div className="flex items-center">
                      {getTrendIcon(metric.trend)}
                    </div>
                  )}
                </div>

                {/* Main value */}
                <div className="space-y-3">
                  <div className={cn("text-3xl font-bold tracking-tight", colors.text)}>
                    {formatValue(metric.value, metric.format, metric.unit)}
                  </div>

                  {/* Change indicator */}
                  {metric.change && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-1 text-xs font-medium border-0",
                          getChangeColor(metric.change.type)
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {getChangeIcon(metric.change.type)}
                          {Math.abs(metric.change.value)}%
                        </div>
                      </Badge>
                      {metric.change.label && (
                        <span className="text-xs text-muted-foreground">
                          {metric.change.label}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Comparison baseline */}
                  {showComparisons && metric.comparison && (
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{metric.comparison.label || 'vs. baseline'}</span>
                        <span className="font-mono">
                          {formatValue(metric.comparison.baseline, metric.format, metric.unit)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
