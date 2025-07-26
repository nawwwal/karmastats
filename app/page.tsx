"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Calculator,
  Activity,
  Microscope,
  Users,
  ChevronRight,
  Brain,
  TrendingUp,
  BarChart3,
  TestTube,
  Stethoscope,
  Target,
  Database,
  LineChart,
  PieChart,
  Waves,
  FlaskConical,
  Shield,
  Star,
  Zap,
  Award
} from 'lucide-react';

// Individual tool cards data
const allTools = [
  // Sample Size Calculators
  {
    title: "AI Study Detector",
    description: "Intelligent study design detection",
    href: "/sample-size/intelligent-detector",
    icon: <Brain className="h-5 w-5" />,
    category: "Sample Size",
    badge: "AI-Powered"
  },
  {
    title: "Clinical Trials",
    description: "RCT sample calculations",
    href: "/sample-size/clinical-trials",
    icon: <Target className="h-5 w-5" />,
    category: "Sample Size",
    badge: "RCT"
  },
  {
    title: "Diagnostic Studies",
    description: "Sensitivity & specificity",
    href: "/sample-size/diagnostic",
    icon: <Stethoscope className="h-5 w-5" />,
    category: "Sample Size",
    badge: "Medical"
  },
  {
    title: "Comparative Studies",
    description: "Case-control & cohort",
    href: "/sample-size/comparative",
    icon: <BarChart3 className="h-5 w-5" />,
    category: "Sample Size",
    badge: "Two-group"
  },
  {
    title: "Cross-sectional",
    description: "Prevalence & survey studies",
    href: "/sample-size/cross-sectional",
    icon: <Database className="h-5 w-5" />,
    category: "Sample Size",
    badge: "Survey"
  },
  {
    title: "Survival Analysis",
    description: "Time-to-event studies",
    href: "/sample-size/survival",
    icon: <TrendingUp className="h-5 w-5" />,
    category: "Sample Size",
    badge: "Log-rank"
  },
  {
    title: "T-Test Calculator",
    description: "Independent & paired tests",
    href: "/sample-size/t-test",
    icon: <TestTube className="h-5 w-5" />,
    category: "Sample Size",
    badge: "Statistical"
  },

  // Regression Analysis
  {
    title: "Linear Regression",
    description: "Simple & multiple variables",
    href: "/regression",
    icon: <LineChart className="h-5 w-5" />,
    category: "Regression",
    badge: "Linear"
  },
  {
    title: "Logistic Regression",
    description: "Binary classification",
    href: "/regression",
    icon: <Activity className="h-5 w-5" />,
    category: "Regression",
    badge: "Binary"
  },
  {
    title: "Multiple Regression",
    description: "Multi-variable analysis",
    href: "/regression",
    icon: <PieChart className="h-5 w-5" />,
    category: "Regression",
    badge: "Multi-var"
  },
  {
    title: "Polynomial Regression",
    description: "2nd-6th degree fitting",
    href: "/regression",
    icon: <Waves className="h-5 w-5" />,
    category: "Regression",
    badge: "Polynomial"
  },

  // Disease Modeling
  {
    title: "SEIR Disease Model",
    description: "Basic epidemic modeling",
    href: "/disease-math",
    icon: <Microscope className="h-5 w-5" />,
    category: "Disease Math",
    badge: "Standard"
  },
  {
    title: "SEIRDV Model",
    description: "Advanced with vaccination",
    href: "/disease-math",
    icon: <FlaskConical className="h-5 w-5" />,
    category: "Disease Math",
    badge: "Advanced"
  },

  // Health Studies
  {
    title: "Family Health Study",
    description: "ICMR-NIN 2020 compliance",
    href: "/family-study",
    icon: <Users className="h-5 w-5" />,
    category: "Health Studies",
    badge: "Complete"
  },
  {
    title: "Adult Vaccination",
    description: "Comprehensive immunization assessment",
    href: "/adult-vaccination",
    icon: <Shield className="h-5 w-5" />,
    category: "Health Studies",
    badge: "Assessment"
  }
];

const ToolCard = ({ title, description, href, icon, category, badge }: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: string;
  badge: string;
}) => (
  <Link href={href} className="block group">
    <Card className="h-full border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
            {category}
          </div>
          <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center text-primary font-medium group-hover:text-primary/80 text-sm">
          <span>Open Tool</span>
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-primary">15 Advanced Statistical Tools</span>
            </div>

            {/* Main Title with Sun-like Glow on Hover */}
            <div className="space-y-4">
              <div className="relative group cursor-pointer">
                {/* Main title */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground
                              transition-all duration-700 ease-out
                              group-hover:text-transparent group-hover:bg-gradient-to-r
                              group-hover:from-orange-400 group-hover:via-yellow-300 group-hover:to-orange-500
                              group-hover:bg-clip-text group-hover:drop-shadow-2xl
                              relative z-20">
                  KARMASTAT
                </h1>

                {/* Sun glow layers - only visible on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none">
                  {/* Outer glow */}
                  <div className="absolute inset-0 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight
                                text-orange-300/40 blur-3xl animate-pulse z-10
                                group-hover:animate-[pulse_2s_ease-in-out_infinite]">
                    KARMASTAT
                  </div>

                  {/* Middle glow */}
                  <div className="absolute inset-0 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight
                                text-yellow-400/30 blur-2xl animate-pulse z-10
                                group-hover:animate-[pulse_1.5s_ease-in-out_infinite_0.3s]">
                    KARMASTAT
                  </div>

                  {/* Inner glow */}
                  <div className="absolute inset-0 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight
                                text-orange-400/20 blur-xl animate-pulse z-10
                                group-hover:animate-[pulse_1s_ease-in-out_infinite_0.6s]">
                    KARMASTAT
                  </div>

                  {/* Radiating rays effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                    <div className="w-96 h-96 bg-gradient-radial from-orange-400/20 via-yellow-300/10 to-transparent
                                  rounded-full blur-2xl animate-spin-slow"></div>
                  </div>

                  {/* Additional rotating glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                    <div className="w-80 h-80 bg-gradient-radial from-yellow-400/15 via-orange-300/8 to-transparent
                                  rounded-full blur-xl animate-spin-reverse"></div>
                  </div>
                </div>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
                Advanced Statistical Analysis Platform
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools for research, epidemiology, and data science with
                <span className="text-primary font-medium"> interactive visualizations</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="text-white">
                <Link href="/sample-size/intelligent-detector" className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Explore Tools
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="#features" className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-2xl mx-auto">
              {[
                { number: "15", label: "Statistical Tools" },
                { number: "7", label: "Sample Size" },
                { number: "4", label: "Regression" },
                { number: "2", label: "Health Studies" }
              ].map((stat) => (
                <div key={stat.label} className="text-center space-y-1">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Complete Statistical Toolkit
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Specialized tools covering every aspect of statistical analysis, from sample size calculations
              to epidemiological modeling and health assessments
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {allTools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Research Grade</h3>
                <p className="text-muted-foreground text-sm">
                  Rigorous statistical methodologies with publication-ready accuracy
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Always Free</h3>
                <p className="text-muted-foreground text-sm">
                  No registration required, no hidden costs, accessible to everyone
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Open Source</h3>
                <p className="text-muted-foreground text-sm">
                  Transparent algorithms, community-driven development
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Our Mission
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed space-y-6">
              <p>
                KARMASTAT democratizes advanced statistical analysis by providing research-grade tools
                that are both powerful and accessible to researchers, students, and professionals worldwide.
              </p>
              <p>
                We combine rigorous statistical methodologies with intuitive interfaces, enabling users
                to conduct complex analyses without compromising on accuracy or depth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="text-white">
                <Link href="/sample-size/intelligent-detector" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Start Analyzing
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/family-study" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Health Studies
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Transform Your Research?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join researchers worldwide using KARMASTAT for precise statistical analysis
              and compelling data visualizations
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-white">
                <Link href="/sample-size/intelligent-detector" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Start Calculating
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/regression" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Explore Analysis
                </Link>
              </Button>
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
