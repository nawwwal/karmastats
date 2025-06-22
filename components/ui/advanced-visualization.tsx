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
      'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500',
      'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  const getTextColor = (index: number) => {
    const colors = [
      'text-blue-700', 'text-emerald-700', 'text-amber-700', 'text-purple-700',
      'text-rose-700', 'text-cyan-700', 'text-orange-700', 'text-pink-700'
    ];
    return colors[index % colors.length];
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
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
              stroke="#f1f5f9"
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
              <div className="text-2xl font-bold">{data.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <div
                  className={cn("w-4 h-4 rounded-full", getColorPalette(index))}
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{item.value.toFixed(1)}</div>
                <div className="text-sm text-gray-600">
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
      <div className="relative h-40 bg-gradient-to-b from-blue-50 to-transparent rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 400 120">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 24}
              x2="400"
              y2={i * 24}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Trend line */}
          <polyline
            points={data.map((item, index) =>
              `${(index / (data.length - 1)) * 380 + 10},${120 - (item.value / maxValue) * 100}`
            ).join(' ')}
            fill="none"
            stroke="#3b82f6"
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
              fill="#3b82f6"
              className="drop-shadow-sm"
            />
          ))}
        </svg>
      </div>

      {/* Data Points */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.map((item, index) => (
          <div key={index} className="text-center p-3 rounded-lg bg-blue-50">
            <div className="font-bold text-lg">{item.value.toFixed(1)}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
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
            isHighest && "bg-green-50 border-green-200",
            isLowest && "bg-red-50 border-red-200",
            !isHighest && !isLowest && "bg-gray-50"
          )}>
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold",
                getColorPalette(index)
              )}>
                {index + 1}
              </div>
              <span className="font-medium">{item.label}</span>
              {isHighest && <Badge className="bg-green-600">Highest</Badge>}
              {isLowest && <Badge className="bg-red-600">Lowest</Badge>}
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{item.value.toFixed(2)}</div>
              <div className="text-sm text-gray-600">
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
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{mean.toFixed(2)}</div>
            <div className="text-sm text-blue-600">Mean</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{stdDev.toFixed(2)}</div>
            <div className="text-sm text-purple-600">Std. Deviation</div>
          </div>
        </div>

        {/* Histogram */}
        <div className="space-y-2">
          {data.map((item, index) => {
            const zScore = (item.value - mean) / stdDev;
            const isOutlier = Math.abs(zScore) > 2;

            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-20 text-sm font-medium truncate">{item.label}</div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-gray-200 rounded">
                    <div
                      className={cn(
                        "h-full rounded transition-all duration-700",
                        isOutlier ? "bg-red-500" : getColorPalette(index)
                      )}
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                  {isOutlier && (
                    <AlertCircle className="absolute right-2 top-1 h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="w-16 text-sm text-right font-mono">{item.value.toFixed(1)}</div>
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
              <div className="h-8 bg-gray-100 rounded-lg relative overflow-hidden">
                <div
                  className={cn("h-full rounded-lg opacity-30", getColorPalette(index))}
                  style={{
                    marginLeft: `${(lower / maxValue) * 100}%`,
                    width: `${((upper - lower) / maxValue) * 100}%`
                  }}
                />
                {/* Point estimate */}
                <div
                  className="absolute top-1 bottom-1 w-1 bg-gray-800 rounded"
                  style={{ left: `${(item.value / maxValue) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-600 mt-1">
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
            {subtitle && <p className="text-sm text-gray-600 font-normal mt-1">{subtitle}</p>}
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
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{insight.key}</span>
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
