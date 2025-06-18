'use client';

import React from 'react';
import { Calculator, Activity, Users, Brain, TrendingUp, BarChart3, TestTube, Stethoscope, Target, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const sampleSizeTools = [
  {
    title: "Intelligent Study Detector",
    description: "AI-powered study type detection and sample size recommendations",
    href: "/sample-size/intelligent-detector",
    icon: Brain,
    status: "Complete"
  },
  {
    title: "Survival Analysis",
    description: "Log-rank test, Cox regression, and one-arm survival studies",
    href: "/sample-size/survival",
    icon: TrendingUp,
    status: "Complete"
  },
  {
    title: "Comparative Studies",
    description: "Case-control and cohort study sample size calculations",
    href: "/sample-size/comparative",
    icon: BarChart3,
    status: "Complete"
  },
  {
    title: "T-Test Calculator",
    description: "Independent and paired t-test sample size calculations",
    href: "/sample-size/t-test",
    icon: TestTube,
    status: "Complete"
  },
  {
    title: "Diagnostic Tests",
    description: "Sensitivity, specificity, and ROC analysis calculations",
    href: "/sample-size/diagnostic",
    icon: Stethoscope,
    status: "Complete"
  },
  {
    title: "Clinical Trials",
    description: "Superiority, non-inferiority, and equivalence trials",
    href: "/sample-size/clinical-trials",
    icon: Target,
    status: "Complete"
  },
  {
    title: "Cross-sectional Studies",
    description: "Prevalence and descriptive study calculations",
    href: "/sample-size/cross-sectional",
    icon: Database,
    status: "Complete"
  }
];

export default function SampleSizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMainSampleSizePage = pathname === '/sample-size';

  // If on main sample-size page, show the full catalogue
  if (isMainSampleSizePage) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Sample Size Calculators</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive suite of sample size calculators for various study designs,
          powered by statistical precision and validated methodologies.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleSizeTools.map((tool, index) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <tool.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {tool.status}
                  </span>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

        {children}
    </div>
  );
  }

  // For individual tool pages, just render the children without catalogue
  return children;
}
