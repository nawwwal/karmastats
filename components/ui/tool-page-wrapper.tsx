"use client";

import { ReactNode } from "react";
import { ChevronLeft, Calculator } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface ToolPageWrapperProps {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onReset?: () => void;
  children: ReactNode;
  lastModified?: string;
}

export function ToolPageWrapper({
  title,
  description,
  backHref,
  backLabel,
  icon: Icon = Calculator,
  onReset,
  children,
  lastModified,
}: ToolPageWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb and Back Navigation */}
        <div className="flex flex-col space-y-4">
          {backHref && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link
                href={backHref}
                className="flex items-center space-x-1 hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{backLabel || "Back"}</span>
              </Link>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {backLabel?.includes("Calculator") ? backLabel : "Sample Size Calculator"}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {description}
              </p>
              {lastModified && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastModified}
                </p>
              )}
            </div>

            {onReset && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="flex items-center space-x-1"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}
