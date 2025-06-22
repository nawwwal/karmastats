"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import Link from 'next/link';
import {
  Calculator,
  Activity,
  Microscope,
  Users,
  ChevronRight,
  TreePine,
  Heart,
  Globe,
  Target,
  Award,
  Zap,
  Shield,
  Sparkles,
  Star
} from 'lucide-react';

const tools = {
  calculators: [
    {
      title: "Sample Size Calculator",
      description: "Comprehensive suite of 7 specialized sample size calculation tools covering all major study designs with statistical power analysis",
      href: "/sample-size",
      icon: <Calculator className="h-8 w-8" />,
      features: [
        "Intelligent Study Detector (AI-powered)",
        "Survival Analysis (Log-rank, Cox, One-arm)",
        "Comparative Studies (Case-control & Cohort)",
        "T-Test Calculator (Independent & Paired)",
        "Diagnostic Studies (Sensitivity & Specificity)",
        "Clinical Trials (RCT, Non-inferiority, Equivalence)",
        "Cross-sectional Studies (Prevalence & Survey)"
      ],
      status: "Complete",
      toolCount: "7 Tools"
    },
    {
      title: "Regression Analysis",
      description: "Advanced statistical modeling suite with interactive visualizations, sample datasets, and comprehensive file upload capabilities",
      href: "/regression",
      icon: <Activity className="h-8 w-8" />,
      features: [
        "Linear Regression (Simple & Multiple variables)",
        "Polynomial Regression (2nd-6th degree fitting)",
        "Multiple Regression (Multi-variable analysis)",
        "Logistic Regression (Binary classification)",
        "Interactive Charts & Visualizations",
        "CSV/TXT File Upload Support",
        "Sample Datasets Included"
      ],
      status: "Complete",
      toolCount: "4 Models"
    },
    {
      title: "Disease Modeling",
      description: "Advanced epidemiological modeling with SEIRDV compartments, intervention analysis, and real-time parameter adjustment",
      href: "/disease-math",
      icon: <Microscope className="h-8 w-8" />,
      features: [
        "Standard SEIR Model (Basic epidemic modeling)",
        "Advanced SEIRDV Model (Deaths & Vaccination)",
        "Intervention Analysis (Policy impact assessment)",
        "Real-time Parameter Adjustment",
        "Interactive Epidemic Curves",
        "R₀ & Herd Immunity Calculations",
        "Population Impact Metrics"
      ],
      status: "Complete",
      toolCount: "2 Models"
    }
  ],
  studies: [
    {
      title: "Family Health Study",
      description: "Comprehensive family health assessment platform based on ICMR-NIN 2020 guidelines with nutritional analysis and health tracking",
      href: "/family-study",
      icon: <Users className="h-8 w-8" />,
      features: [
        "ICMR-NIN 2020 Compliance",
        "Family Member Demographics",
        "Nutritional Adequacy Analysis",
        "Health Records Management",
        "Immunization Tracking",
        "Socioeconomic Status Assessment",
        "Consumption Unit Calculations"
      ],
      status: "Complete",
      toolCount: "7 Modules"
    }
  ]
};

const impactStats = [
  {
    icon: <TreePine className="h-8 w-8 text-success" />,
    number: "48 lbs",
    description: "CO₂ absorbed annually by a mature tree",
    detail: "Demonstrating nature's extraordinary balance"
  },
  {
    icon: <Globe className="h-8 w-8 text-info" />,
    number: "100+",
    description: "Oxygen produced by one acre of forest",
    detail: "Four tons of oxygen annually"
  },
  {
    icon: <Zap className="h-8 w-8 text-warning" />,
    number: "30%",
    description: "Energy reduction with proper tree placement",
    detail: "Natural air conditioning efficiency"
  }
];

const CalcCard = ({ title, description, href, icon, features, status, toolCount }: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  features: string[];
  status: string;
  toolCount?: string;
}) => (
  <Link href={href} className="block group">
    <EnhancedCard
      className="h-full border-2 hover:border-primary/30"
      glass={true}
      glow={true}
      hover={true}
      gradient={true}
    >
      <EnhancedCardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:text-white transition-all duration-300">
            {icon}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={status === "Complete" ? "default" : "secondary"} className="text-xs bg-gradient-to-r from-primary to-secondary text-white">
              <Star className="w-3 h-3 mr-1" />
              {status}
            </Badge>
            {toolCount && (
              <Badge variant="outline" className="text-xs glass-card border-primary/30">
                {toolCount}
              </Badge>
            )}
          </div>
        </div>
        <div>
          <EnhancedCardTitle className="text-xl font-semibold tracking-tight group-hover:text-shimmer transition-colors">
            {title}
          </EnhancedCardTitle>
          <EnhancedCardDescription className="text-base text-muted-foreground mt-2">
            {description}
          </EnhancedCardDescription>
        </div>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-4">
        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary mr-2 mt-2 flex-shrink-0" />
              <span className="leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center text-primary font-medium group-hover:text-primary/80">
          <span className="text-sm">Access Tool</span>
          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  </Link>
);

const StatCard = ({ icon, number, description, detail }: {
  icon: React.ReactNode;
  number: string;
  description: string;
  detail: string;
}) => (
  <EnhancedCard
    className="text-center"
    glass={true}
    glow={true}
    hover={true}
  >
    <EnhancedCardContent className="pt-6 space-y-4">
      <div className="flex justify-center">
        {icon}
      </div>
      <div className="space-y-2">
        <div className="text-3xl font-semibold tracking-tight text-gradient">
          {parseFloat(number.replace(/[^\d.-]/g, '')) || 0}
          {number.replace(/[\d.-]/g, '')}
        </div>
        <div className="font-medium text-foreground">{description}</div>
        <div className="text-sm text-muted-foreground">{detail}</div>
      </div>
    </EnhancedCardContent>
  </EnhancedCard>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Simple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/60 to-accent/40" />
        <div className="absolute inset-0 bg-black/10" />

        {/* Static decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-secondary/20 rounded-full blur-xl" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-primary/15 rounded-full blur-xl" />

        <div className="relative container mx-auto px-4 text-center w-full text-white">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Enhanced Visual Experience</span>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>

              <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-shimmer">
                KARMASTAT
              </h1>
              <div className="text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed">
                Advanced Statistical Analysis Platform
              </div>
              <div className="text-lg text-white/80 max-w-2xl mx-auto">
                Comprehensive tools for research, epidemiology, and data science with beautiful interactive visualizations
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <EnhancedButton
                variant="glass"
                size="lg"
                animation="hover"
                icon={<Calculator className="h-4 w-4" />}
                className="min-w-[200px] text-white border-white/30 hover:text-white"
              >
                <Link href="/sample-size">
                  Explore Tools
                </Link>
              </EnhancedButton>

              <EnhancedButton
                variant="outline"
                size="lg"
                animation="bounce"
                icon={<Heart className="h-4 w-4" />}
                className="min-w-[200px] border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="#mission">
                  Our Mission
                </Link>
              </EnhancedButton>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-gradient mb-4">
              Powerful Statistical Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete suite of research-grade calculators and analysis tools designed for accuracy, efficiency, and ease of use
            </p>
          </div>

          {/* Calculators Grid */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold mb-8 text-center text-gradient">
              Statistical Calculators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <CalcCard
                icon={<Calculator className="h-8 w-8" />}
                title="Sample Size Calculator"
                description="Calculate required sample sizes for various study designs"
                href="/sample-size"
                features={[
                  "Intelligent Study Detector (AI-powered)",
                  "Survival Analysis (Log-rank, Cox, One-arm)",
                  "Comparative Studies (Case-control & Cohort)",
                  "T-Test Calculator (Independent & Paired)",
                  "Diagnostic Studies (Sensitivity & Specificity)",
                  "Clinical Trials (RCT, Non-inferiority, Equivalence)",
                  "Cross-sectional Studies (Prevalence & Survey)"
                ]}
                status="Complete"
                toolCount="7 Tools"
              />
              <CalcCard
                icon={<Heart className="h-8 w-8" />}
                title="Infectious Disease Modeling"
                description="Model disease spread and predict outcomes"
                href="/disease-math"
                features={[
                  "Standard SEIR Model (Basic epidemic modeling)",
                  "Advanced SEIRDV Model (Deaths & Vaccination)",
                  "Intervention Analysis (Policy impact assessment)",
                  "Real-time Parameter Adjustment",
                  "Interactive Epidemic Curves",
                  "R₀ & Herd Immunity Calculations",
                  "Population Impact Metrics"
                ]}
                status="Complete"
                toolCount="2 Models"
              />
            </div>
          </div>

          {/* Studies Grid */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold mb-8 text-center text-gradient">
              Health Studies Platform
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tools.studies.map((tool, index) => (
                <div key={tool.title}>
                  <CalcCard {...tool} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 bg-gradient-to-r from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gradient mb-4">
              Environmental Impact Awareness
            </h2>
            <p className="text-lg text-muted-foreground">
              Understanding our planet's remarkable natural systems
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactStats.map((stat, index) => (
              <div key={stat.number}>
                <StatCard {...stat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold tracking-tight text-gradient">
              Our Mission
            </h2>
            <div className="text-xl text-muted-foreground leading-relaxed space-y-6">
              <p>
                KARMASTAT is dedicated to democratizing advanced statistical analysis by providing
                research-grade tools that are both powerful and accessible to researchers, students,
                and professionals worldwide.
              </p>
              <p>
                Our platform combines rigorous statistical methodologies with intuitive interfaces,
                enabling users to conduct complex analyses without compromising on accuracy or depth.
                From epidemiological modeling to family health studies, we empower evidence-based
                decision making across diverse fields.
              </p>
              <p>
                We believe that quality statistical tools should be freely available to all,
                fostering innovation and advancing knowledge for the betterment of society.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <EnhancedButton
                variant="gradient"
                size="lg"
                animation="hover"
                icon={<Calculator className="h-4 w-4" />}
                className="min-w-[200px] text-white"
              >
                <Link href="/sample-size">
                  Start Analyzing
                </Link>
              </EnhancedButton>

              <EnhancedButton
                variant="outline"
                size="lg"
                animation="wiggle"
                icon={<Users className="h-4 w-4" />}
                className="min-w-[200px]"
              >
                <Link href="/family-study">
                  Health Studies
                </Link>
              </EnhancedButton>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold tracking-tight text-gradient">
              Ready to Transform Your Research?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join researchers worldwide using KARMASTAT for precise statistical analysis and compelling data visualizations
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <EnhancedButton
                variant="gradient"
                size="xl"
                animation="hover"
                icon={<Target className="h-4 w-4" />}
                className="min-w-[240px] text-white"
              >
                <Link href="/sample-size">
                  Start Calculating
                </Link>
              </EnhancedButton>

              <EnhancedButton
                variant="outline"
                size="xl"
                animation="wiggle"
                icon={<Award className="h-4 w-4" />}
                className="min-w-[240px]"
              >
                <Link href="/regression">
                  Explore Analysis
                </Link>
              </EnhancedButton>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-8">
              <Shield className="w-4 h-4" />
              <span>Research-grade accuracy • No registration required • Free to use</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
