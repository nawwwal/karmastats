"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, PieChart, Activity, TrendingUp, Target,
  ArrowUp, ArrowDown, Minus, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
  category?: string;
}

interface AdvancedVisualizationProps {
  title: string;
  subtitle?: string;
  type: 'bar' | 'pie' | 'trend' | 'comparison' | 'distribution' | 'confidence';
  data: DataPoint[];
  insights?: {
    key: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
    significance?: 'high' | 'medium' | 'low';
  }[];
  className?: string;
}

export function AdvancedVisualization({
  title,
  subtitle,
  type,
  data,
  insights,
  className
}: AdvancedVisualizationProps) {

  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
  const totalValue = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const getColorPalette = (index: number) => {
    const colors = [
      'bg-primary', 'bg-success', 'bg-warning', 'bg-secondary',
      'bg-destructive', 'bg-info', 'bg-accent', 'bg-muted'
    ];
    return colors[index % colors.length];
  };

  const getTextColor = (index: number) => {
    const colors = [
      'text-primary', 'text-success', 'text-warning', 'text-secondary',
      'text-destructive', 'text-info', 'text-accent', 'text-muted-foreground'
    ];
    return colors[index % colors.length];
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-success" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const renderBarChart = () => (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{item.label}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">{item.value.toFixed(1)}</span>
              <Badge variant="outline" className="text-xs">
                {((item.value / totalValue) * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
          <div className="relative">
            <Progress
              value={(item.value / maxValue) * 100}
              className="h-3"
            />
            <div
              className={cn(
                "absolute top-0 left-0 h-3 rounded-full transition-all duration-700",
                item.color || getColorPalette(index)
              )}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    let cumulativePercentage = 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Pie Representation */}
        <div className="relative aspect-square max-w-64 mx-auto">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="40"
            />
            {data.map((item, index) => {
              const percentage = (item.value / totalValue) * 100;
              const strokeDasharray = `${percentage * 5.03} 502`;
              const strokeDashoffset = -cumulativePercentage * 5.03;
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={item.color || `hsl(${index * 137.5}, 70%, 50%)`}
                  strokeWidth="40"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{data.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-muted/20">
              <div className="flex items-center space-x-3">
                <div
                  className={cn("w-4 h-4 rounded-full", getColorPalette(index))}
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">{item.value.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">
                  {((item.value / totalValue) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTrendChart = () => (
    <div className="space-y-6">
      {/* Trend Line Visualization */}
      <div className="relative h-40 bg-gradient-to-b from-primary/10 to-transparent rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 400 120">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 24}
              x2="400"
              y2={i * 24}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          ))}

          {/* Trend line */}
          <polyline
            points={data.map((item, index) =>
              `${(index / (data.length - 1)) * 380 + 10},${120 - (item.value / maxValue) * 100}`
            ).join(' ')}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            className="drop-shadow-sm"
          />

          {/* Data points */}
          {data.map((item, index) => (
            <circle
              key={index}
              cx={(index / (data.length - 1)) * 380 + 10}
              cy={120 - (item.value / maxValue) * 100}
              r="5"
              fill="hsl(var(--primary))"
              className="drop-shadow-sm"
            />
          ))}
        </svg>
      </div>

      {/* Data Points */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.map((item, index) => (
          <div key={index} className="text-center p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
            <div className="font-bold text-lg text-foreground">{item.value.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComparison = () => (
    <div className="space-y-4">
      {data.map((item, index) => {
        const isHighest = item.value === maxValue;
        const isLowest = item.value === minValue;

        return (
          <div key={index} className={cn(
            "flex items-center justify-between p-4 rounded-lg transition-all",
            isHighest && "bg-success/10 border-success/20 dark:bg-success/20 dark:border-success/30",
            isLowest && "bg-destructive/10 border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30",
            !isHighest && !isLowest && "bg-muted/50 dark:bg-muted/20"
          )}>
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold",
                getColorPalette(index)
              )}>
                {index + 1}
              </div>
              <span className="font-medium text-foreground">{item.label}</span>
              {isHighest && <Badge className="bg-success text-success-foreground">Highest</Badge>}
              {isLowest && <Badge className="bg-destructive text-destructive-foreground">Lowest</Badge>}
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-foreground">{item.value.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                vs avg: {item.value > (totalValue / data.length) ? '+' : ''}
                {(item.value - (totalValue / data.length)).toFixed(1)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDistribution = () => {
    const mean = totalValue / data.length;
    const variance = data.reduce((sum, item) => sum + Math.pow(item.value - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return (
      <div className="space-y-6">
        {/* Distribution Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-primary/10 dark:bg-primary/20 rounded-lg">
            <div className="text-2xl font-bold text-primary">{mean.toFixed(2)}</div>
            <div className="text-sm text-primary/80">Mean</div>
          </div>
          <div className="text-center p-4 bg-secondary/10 dark:bg-secondary/20 rounded-lg">
            <div className="text-2xl font-bold text-secondary">{stdDev.toFixed(2)}</div>
            <div className="text-sm text-secondary/80">Std. Deviation</div>
          </div>
        </div>

        {/* Histogram */}
        <div className="space-y-2">
          {data.map((item, index) => {
            const zScore = (item.value - mean) / stdDev;
            const isOutlier = Math.abs(zScore) > 2;

            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-20 text-sm font-medium truncate text-foreground">{item.label}</div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-muted rounded">
                    <div
                      className={cn(
                        "h-full rounded transition-all duration-700",
                        isOutlier ? "bg-destructive" : getColorPalette(index)
                      )}
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                  {isOutlier && (
                    <AlertCircle className="absolute right-2 top-1 h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="w-16 text-sm text-right font-mono text-foreground">{item.value.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConfidenceInterval = () => (
    <div className="space-y-6">
      {data.map((item, index) => {
        // Simulate confidence intervals (in real usage, these would be provided)
        const margin = item.value * 0.1;
        const lower = item.value - margin;
        const upper = item.value + margin;

        return (
          <div key={index} className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">{item.label}</span>
              <Badge variant="outline">95% CI</Badge>
            </div>

            <div className="relative">
              {/* Confidence interval bar */}
              <div className="h-8 bg-muted/50 dark:bg-muted/20 rounded-lg relative overflow-hidden">
                <div
                  className={cn("h-full rounded-lg opacity-30", getColorPalette(index))}
                  style={{
                    marginLeft: `${(lower / maxValue) * 100}%`,
                    width: `${((upper - lower) / maxValue) * 100}%`
                  }}
                />
                {/* Point estimate */}
                <div
                  className="absolute top-1 bottom-1 w-1 bg-foreground rounded"
                  style={{ left: `${(item.value / maxValue) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{lower.toFixed(2)}</span>
                <span className="font-bold">{item.value.toFixed(2)}</span>
                <span>{upper.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const getVisualizationIcon = () => {
    switch (type) {
      case 'bar': return <BarChart3 className="h-6 w-6" />;
      case 'pie': return <PieChart className="h-6 w-6" />;
      case 'trend': return <TrendingUp className="h-6 w-6" />;
      case 'comparison': return <Target className="h-6 w-6" />;
      case 'distribution': return <Activity className="h-6 w-6" />;
      case 'confidence': return <Target className="h-6 w-6" />;
      default: return <BarChart3 className="h-6 w-6" />;
    }
  };

  const renderVisualization = () => {
    switch (type) {
      case 'bar': return renderBarChart();
      case 'pie': return renderPieChart();
      case 'trend': return renderTrendChart();
      case 'comparison': return renderComparison();
      case 'distribution': return renderDistribution();
      case 'confidence': return renderConfidenceInterval();
      default: return renderBarChart();
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getVisualizationIcon()}
          <div>
            <span>{title}</span>
            {subtitle && <p className="text-sm text-muted-foreground font-normal mt-1">{subtitle}</p>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderVisualization()}

        {/* Insights */}
        {insights && insights.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3">Key Insights</h4>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 dark:bg-muted/20 rounded">
                  <span className="text-sm font-medium text-foreground">{insight.key}</span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(insight.trend)}
                    <span className="text-sm font-bold">{insight.value}</span>
                    <Badge
                      variant={insight.significance === 'high' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {insight.significance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
