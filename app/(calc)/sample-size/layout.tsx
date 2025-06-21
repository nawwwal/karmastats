'use client';

import React from 'react';
import { Calculator, Activity, Users, Brain, TrendingUp, BarChart3, TestTube, Stethoscope, Target, Database, Sparkles, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const sampleSizeTools = [
  {
    title: "Intelligent Study Detector",
    description: "AI-powered study type detection and sample size recommendations with machine learning algorithms",
    href: "/sample-size/intelligent-detector",
    icon: Brain,
    features: ["AI-Powered", "Smart Detection", "Instant Results"],
    themeColor: "primary"
  },
  {
    title: "Survival Analysis",
    description: "Log-rank test, Cox regression, and one-arm survival studies with advanced statistical modeling",
    href: "/sample-size/survival",
    icon: TrendingUp,
    features: ["Log-rank", "Cox Regression", "One-arm"],
    themeColor: "secondary"
  },
  {
    title: "Comparative Studies",
    description: "Case-control and cohort study sample size calculations with precision analysis",
    href: "/sample-size/comparative",
    icon: BarChart3,
    features: ["Case-Control", "Cohort", "Power Analysis"],
    themeColor: "primary"
  },
  {
    title: "T-Test Calculator",
    description: "Independent and paired t-test sample size calculations with effect size estimation",
    href: "/sample-size/t-test",
    icon: TestTube,
    features: ["Independent", "Paired", "Effect Size"],
    themeColor: "secondary"
  },
  {
    title: "Diagnostic Tests",
    description: "Sensitivity, specificity, and ROC analysis calculations for diagnostic accuracy",
    href: "/sample-size/diagnostic",
    icon: Stethoscope,
    features: ["Sensitivity", "Specificity", "ROC Analysis"],
    themeColor: "primary"
  },
  {
    title: "Clinical Trials",
    description: "Superiority, non-inferiority, and equivalence trials with regulatory compliance",
    href: "/sample-size/clinical-trials",
    icon: Target,
    features: ["Superiority", "Non-inferiority", "Equivalence"],
    themeColor: "secondary"
  },
  {
    title: "Cross-sectional Studies",
    description: "Prevalence and descriptive study calculations with confidence interval estimation",
    href: "/sample-size/cross-sectional",
    icon: Database,
    features: ["Prevalence", "Descriptive", "Confidence Intervals"],
    themeColor: "primary"
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
    <div className="space-y-8 relative">
      {/* Header Section */}
      <div className="text-center space-y-6 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/20 rounded-full text-sm font-medium mb-6 animate-fadeInDown">
          <Calculator className="w-4 h-4 text-primary" />
          <span>7 Advanced Calculators</span>
          <Sparkles className="w-4 h-4 text-secondary" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient animate-fadeInUp">
          Sample Size Calculators
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fadeInUp">
          Comprehensive suite of sample size calculators for various study designs,
          powered by statistical precision and validated methodologies with beautiful interactive interfaces.
        </p>
      </div>

      {/* Enhanced Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleSizeTools.map((tool, index) => (
          <Link key={tool.href} href={tool.href} className="group">
            <EnhancedCard
              className="h-full border-2 hover:border-primary/30 relative overflow-hidden"
              glass={true}
              glow={true}
              hover={true}
              gradient={true}
            >
              {/* Theme gradient overlay */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-600",
                tool.themeColor === "primary" ? "bg-gradient-to-br from-primary/20 to-primary/5" : "bg-gradient-to-br from-secondary/20 to-secondary/5"
              )} />

              <EnhancedCardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-all duration-500 group-hover:scale-105 group-hover:glow-primary",
                    tool.themeColor === "primary" ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg" : "bg-gradient-to-r from-secondary to-secondary/80 text-white shadow-lg"
                  )}>
                    <tool.icon className="h-8 w-8" />
                  </div>
                </div>

                <EnhancedCardTitle className="group-hover:text-shimmer transition-colors duration-500 text-lg">
                  {tool.title}
                </EnhancedCardTitle>

                <EnhancedCardDescription className="text-sm leading-relaxed">
                  {tool.description}
                </EnhancedCardDescription>
              </EnhancedCardHeader>

              <EnhancedCardContent className="relative z-10">
                {/* Feature tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.features.map((feature, featureIndex) => (
                    <span
                      key={feature}
                      className={cn(
                        "px-2 py-1 text-xs border rounded-full glass-card animate-slideInLeft transition-all duration-300",
                        tool.themeColor === "primary"
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary hover:bg-primary/20"
                          : "bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20 text-secondary hover:bg-secondary/20"
                      )}
                      style={{ animationDelay: `${(index * 400) + (featureIndex * 200)}ms` }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Enhanced hover indication with arrow icon */}
                <div className="flex items-center font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <span className={cn(
                    "text-sm",
                    tool.themeColor === "primary" ? "text-primary" : "text-secondary"
                  )}>
                    Launch Calculator
                  </span>
                  <ChevronRight className={cn(
                    "ml-2 h-4 w-4 transition-all duration-300 group-hover:translate-x-1",
                    tool.themeColor === "primary" ? "text-primary" : "text-secondary"
                  )} />
                </div>
              </EnhancedCardContent>

              {/* Enhanced shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
              </div>
            </EnhancedCard>
          </Link>
        ))}
      </div>

      {/* Additional Information Section */}
      <div className="mt-16 text-center">
        <EnhancedCard
          className="max-w-4xl mx-auto border-2 border-primary/20"
          glass={true}
          glow={true}
          gradient={true}
        >
          <EnhancedCardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gradient">
                Why Choose Our Sample Size Calculators?
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our calculators are built on rigorous statistical foundations, validated against
                established literature, and designed for both novice researchers and experienced statisticians.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="space-y-3 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto transition-all duration-500 group-hover:glow-primary group-hover:scale-110">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-primary">Research-Grade Accuracy</h4>
                  <p className="text-sm text-muted-foreground">Validated algorithms ensure precise calculations</p>
                </div>

                <div className="space-y-3 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary/80 rounded-full flex items-center justify-center mx-auto transition-all duration-500 group-hover:glow-secondary group-hover:scale-110">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-secondary">User-Friendly Interface</h4>
                  <p className="text-sm text-muted-foreground">Intuitive design with guided input validation</p>
                </div>

                <div className="space-y-3 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto transition-all duration-500 group-hover:glow-primary group-hover:scale-110">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-primary">Real-Time Results</h4>
                  <p className="text-sm text-muted-foreground">Instant calculations with detailed explanations</p>
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {children}
    </div>
  );
  }

  // For individual tool pages, just render the children without catalogue
  return children;
}
