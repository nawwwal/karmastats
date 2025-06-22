"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, CheckCircle, Info, Lightbulb } from 'lucide-react';
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

  const getCategoryColors = (category?: string) => {
    switch (category) {
      case 'primary':
        return {
          text: "text-indigo-700",
          border: "border-indigo-300",
          bg: "bg-indigo-50"
        };
      case 'success':
        return {
          text: "text-emerald-700",
          border: "border-emerald-300",
          bg: "bg-emerald-50"
        };
      case 'warning':
        return {
          text: "text-amber-700",
          border: "border-amber-300",
          bg: "bg-amber-50"
        };
      case 'destructive':
        return {
          text: "text-rose-700",
          border: "border-rose-300",
          bg: "bg-rose-50"
        };
      case 'info':
        return {
          text: "text-cyan-700",
          border: "border-cyan-300",
          bg: "bg-cyan-50"
        };
      case 'secondary':
        return {
          text: "text-purple-700",
          border: "border-purple-300",
          bg: "bg-purple-50"
        };
      default:
        return {
          text: "text-slate-700",
          border: "border-slate-300",
          bg: "bg-slate-50"
        };
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-6 w-6 text-emerald-600" />;
      case 'down': return <TrendingDown className="h-6 w-6 text-rose-600" />;
      default: return <Minus className="h-6 w-6 text-slate-500" />;
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
      case 'increase': return 'text-green-700 bg-green-100 border-green-200';
      case 'decrease': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getSignificanceIcon = (level?: string) => {
    switch (level) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-rose-600" />;
      case 'high': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'medium': return <Info className="h-4 w-4 text-amber-600" />;
      default: return <Target className="h-4 w-4 text-slate-500" />;
    }
  };

  const ResultCard: React.FC<{ item: ModernResultItem }> = ({ item }) => {
    const getCategoryStyles = (category?: string) => {
      switch (category) {
        case 'primary':
          return 'border-blue-200 bg-blue-50/50 text-blue-900';
        case 'secondary':
          return 'border-gray-200 bg-gray-50/50 text-gray-900';
        case 'success':
          return 'border-green-200 bg-green-50/50 text-green-900';
        case 'warning':
          return 'border-yellow-200 bg-yellow-50/50 text-yellow-900';
        case 'error':
          return 'border-red-200 bg-red-50/50 text-red-900';
        default:
          return 'border-gray-200 bg-white text-gray-900';
      }
    };

    const getTrendIcon = (trend?: string) => {
      switch (trend) {
        case 'up':
          return <TrendingUp className="h-4 w-4 text-green-500" />;
        case 'down':
          return <TrendingDown className="h-4 w-4 text-red-500" />;
        default:
          return null;
      }
    };

    return (
      <Card className={`${getCategoryStyles(item.category)} ${item.highlight ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">{item.label}</h3>
            {getTrendIcon(item.trend)}
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {formatNumber(item.value, item.format)}
            </div>
            {item.description && (
              <p className="text-xs text-gray-500">{item.description}</p>
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
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-lg text-gray-600">
            Statistical analysis results
          </p>
        </div>
      )}

      <div className={cn("grid gap-4", getGridCols())}>
        {metrics.map((metric, index) => {
          const colors = getCategoryColors(metric.category);

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
