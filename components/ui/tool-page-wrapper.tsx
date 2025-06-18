"use client";

import React from 'react';
import { ArrowLeft, Calculator, Download, RotateCcw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ToolPageWrapperProps {
  title: string;
  description?: string;
  backUrl?: string;
  children: React.ReactNode;
  resultsSection?: React.ReactNode;
  onReset?: () => void;
  onExportPDF?: () => void;
  showExportButton?: boolean;
  category?: string;
}

export function ToolPageWrapper({
  title,
  description,
  backUrl,
  children,
  resultsSection,
  onReset,
  onExportPDF,
  showExportButton = false,
  category = "Sample Size Calculator"
}: ToolPageWrapperProps) {
  const pathname = usePathname();

  // Auto-determine back URL if not provided
  const autoBackUrl = backUrl || pathname.split('/').slice(0, -1).join('/');

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4">
          {/* Breadcrumb / Back Navigation */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              href={autoBackUrl}
              className="flex items-center space-x-1 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to {category.replace('Calculator', 'Calculators')}</span>
            </Link>
          </div>

          {/* Title and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calculator className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-primary">{category}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
              )}
              {showExportButton && onExportPDF && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportPDF}
                  className="flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Export PDF</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Main Content Area - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-6">
          {/* Input Form Section */}
          <div className="lg:col-span-1 xl:col-span-5 space-y-6">
            <Card className="shadow-lg border bg-card">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span>Input Parameters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {children}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1 xl:col-span-7 space-y-6">
            {resultsSection ? (
              <Card className="shadow-lg border bg-card min-h-[400px]">
                <CardHeader className="bg-success/5 border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-success" />
                    <span>Results & Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {resultsSection}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border bg-card min-h-[400px]">
                <CardContent className="flex items-center justify-center h-[400px]">
                  <div className="text-center space-y-4 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto opacity-50" />
                    <p className="text-lg font-medium">Ready for Analysis</p>
                    <p className="text-sm">Fill in the parameters on the left to see your results here.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
