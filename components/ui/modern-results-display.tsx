"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, CheckCircle, Info, Lightbulb, AlertTriangle, BarChart3 } from 'lucide-react';
import { Progress } from './progress';
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

// Helper function to format numbers
const formatNumber = (
  value: number,
  format?: 'integer' | 'decimal' | 'percentage' | 'currency'
) => {
  if (format === 'integer') {
    return Math.round(value).toLocaleString();
  }
  if (format === 'percentage') {
    return `${value.toFixed(1)}%`;
  }
  if (format === 'currency') {
    return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
};

export interface ModernResultItem {
  label: string;
  value: number;
  category?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  highlight?: boolean;
  format?: 'integer' | 'decimal' | 'percentage' | 'currency';
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  progress?: number; // 0-100 for progress bars
}

export function ModernResultsDisplay({
  title,
  metrics,
  layout = 'grid-auto',
  animated = true,
  showComparisons = true,
  className
}: ModernResultsDisplayProps) {

  const getGridCols = () => {
    switch (layout) {
      case 'grid-2': return 'grid-cols-1 sm:grid-cols-2';
      case 'grid-3': return 'grid-cols-1 sm:grid-cols-2'; // Limited to 2 columns max
      case 'grid-4': return 'grid-cols-1 sm:grid-cols-2'; // Limited to 2 columns max
      default:
        // Always limit to maximum 2 columns to avoid clutter
        return 'grid-cols-1 sm:grid-cols-2';
    }
  };

  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'primary':
        return {
          icon: "text-primary",
          text: "text-primary",
          bg: "bg-primary/10 dark:bg-primary/20",
          border: "border-primary/20 dark:border-primary/30",
        };
      case 'secondary':
        return {
          icon: "text-secondary",
          text: "text-secondary",
          bg: "bg-secondary/10 dark:bg-secondary/20",
          border: "border-secondary/20 dark:border-secondary/30",
        };
      default:
        return {
          icon: "text-muted-foreground",
          text: "text-muted-foreground",
          bg: "bg-muted/50 dark:bg-muted/20",
          border: "border-muted dark:border-muted/30",
        };
    }
  };

  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case 'increase': return <TrendingUp className="h-6 w-6 text-success" />;
      case 'decrease': return <TrendingDown className="h-6 w-6 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-warning" />;
      case 'info': return <Info className="h-6 w-6 text-info" />;
      case 'success': return <CheckCircle className="h-6 w-6 text-success" />;
      case 'primary': return <Target className="h-6 w-6 text-primary" />;
      default: return <Minus className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getChangeStyle = (changeType?: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return 'text-success bg-success/10 border-success/20 dark:bg-success/20 dark:border-success/30';
      case 'decrease': return 'text-destructive bg-destructive/10 border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30';
      default: return 'text-muted-foreground bg-muted/50 border-muted dark:bg-muted/20 dark:border-muted/30';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'primary': return <Target className="h-4 w-4 text-primary" />;
      case 'secondary': return <BarChart3 className="h-4 w-4 text-secondary" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCardStyle = (category?: string, highlight?: boolean) => {
    if (highlight) {
      return 'border-primary/20 bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary/30';
    }

    switch (category) {
      case 'primary':
        return 'border-primary/20 bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary/30';
      case 'secondary':
        return 'border-secondary/20 bg-secondary/10 text-secondary dark:bg-secondary/20 dark:border-secondary/30';
      case 'success':
        return 'border-success/20 bg-success/10 text-success dark:bg-success/20 dark:border-success/30';
      case 'warning':
        return 'border-warning/20 bg-warning/10 text-warning dark:bg-warning/20 dark:border-warning/30';
      case 'error':
        return 'border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:border-destructive/30';
      default:
        return 'border-border bg-card text-card-foreground';
    }
  };

  const TrendIndicator = ({ trend }: { trend?: 'up' | 'down' | 'neutral' }) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const ResultCard: React.FC<{ item: ModernResultItem }> = ({ item }) => {
    const getCategoryStyles = (category?: string) => {
      switch (category) {
        case 'primary':
          return 'border-primary/20 bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary/30';
        case 'secondary':
          return 'border-muted bg-muted/50 text-muted-foreground dark:bg-muted/20 dark:border-muted/30';
        case 'success':
          return 'border-success/20 bg-success/10 text-success dark:bg-success/20 dark:border-success/30';
        case 'warning':
          return 'border-warning/20 bg-warning/10 text-warning dark:bg-warning/20 dark:border-warning/30';
        case 'error':
          return 'border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:border-destructive/30';
        default:
          return 'border-border bg-card text-card-foreground';
      }
    };

    const getTrendIcon = (trend?: string) => {
      switch (trend) {
        case 'up':
          return <TrendingUp className="h-4 w-4 text-success" />;
        case 'down':
          return <TrendingDown className="h-4 w-4 text-destructive" />;
        default:
          return null;
      }
    };

    return (
      <Card className={`${getCardStyle(item.category, item.highlight)}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-muted-foreground">{item.label}</h3>
            {getTrendIcon(item.trend)}
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {formatNumber(item.value, item.format)}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
            {item.progress !== undefined && (
              <Progress value={item.progress} className="h-2" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {title && (
        <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <p className="text-lg text-muted-foreground">
            Statistical analysis results
          </p>
        </div>
      )}

      <div className={cn("grid gap-4", getGridCols())}>
        {metrics.map((metric, index) => {
          const colors = getCategoryColors(metric.category as string);

          return (
            <ResultCard key={index} item={{
              label: metric.label,
              value: typeof metric.value === 'number' ? metric.value : parseFloat(metric.value),
              category: metric.category as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | undefined,
              format: metric.format as any,
              trend: metric.trend as any,
              description: metric.significance?.indicator
            }} />
          );
        })}
      </div>
    </div>
  );
}
