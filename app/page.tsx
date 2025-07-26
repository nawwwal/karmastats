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
  Star,
  Brain,
  TrendingUp,
  BarChart3,
  TestTube,
  Stethoscope,
  Database,
  LineChart,
  PieChart,
  Waves,
  FlaskConical
} from 'lucide-react';

// Individual tool cards data
const allTools = [
  // Sample Size Calculators
  {
    title: "AI Study Detector",
    description: "Intelligent study design detection",
    href: "/sample-size/intelligent-detector",
    icon: <Brain className="h-6 w-6" />,
    category: "Sample Size",
    color: "from-purple-500 to-orange-500",
    badge: "AI-Powered"
  },
  {
    title: "Survival Analysis",
    description: "Time-to-event studies",
    href: "/sample-size/survival",
    icon: <TrendingUp className="h-6 w-6" />,
    category: "Sample Size",
    color: "from-green-500 to-teal-500",
    badge: "Log-rank"
  },
  {
    title: "Comparative Studies",
    description: "Case-control & cohort",
    href: "/sample-size/comparative",
    icon: <BarChart3 className="h-6 w-6" />,
    category: "Sample Size",
    color: "from-orange-500 to-red-500",
    badge: "Two-group"
  },
  {
    title: "T-Test Calculator",
    description: "Independent & paired tests",
    href: "/sample-size/t-test",
    icon: <TestTube className="h-6 w-6" />,
    category: "Sample Size",
    color: "from-orange-500 to-red-500",
    badge: "Statistical"
  },
  {
    title: "Diagnostic Studies",
    description: "Sensitivity & specificity",
    href: "/sample-size/diagnostic",
    icon: <Stethoscope className="h-6 w-6" />,
    category: "Sample Size",
    color: "from-pink-500 to-rose-500",
    badge: "Medical"
  },
  {
    title: "Clinical Trials",
    description: "RCT sample calculations",
    href: "/sample-size/clinical-trials",
    icon: <Target className="h-6 w-6" />,
    category: "Sample Size",
    color: "from-emerald-500 to-green-500",
    badge: "RCT"
  },
  {
    title: "Cross-sectional",
    description: "Prevalence & survey studies",
    href: "/sample-size/cross-sectional",
    icon: <Database className="h-6 w-6" />,
    category: "Sample Size",
    color: "from-cyan-500 to-teal-500",
    badge: "Survey"
  },

  // Regression Analysis
  {
    title: "Linear Regression",
    description: "Simple & multiple variables",
    href: "/regression",
    icon: <LineChart className="h-6 w-6" />,
    category: "Regression",
    color: "from-violet-500 to-purple-500",
    badge: "Linear"
  },
  {
    title: "Polynomial Regression",
    description: "2nd-6th degree fitting",
    href: "/regression",
    icon: <Waves className="h-6 w-6" />,
    category: "Regression",
    color: "from-amber-500 to-orange-500",
    badge: "Polynomial"
  },
  {
    title: "Multiple Regression",
    description: "Multi-variable analysis",
    href: "/regression",
    icon: <PieChart className="h-6 w-6" />,
    category: "Regression",
    color: "from-teal-500 to-cyan-500",
    badge: "Multi-var"
  },
  {
    title: "Logistic Regression",
    description: "Binary classification",
    href: "/regression",
    icon: <Activity className="h-6 w-6" />,
    category: "Regression",
    color: "from-amber-500 to-orange-500",
    badge: "Binary"
  },

  // Disease Modeling
  {
    title: "SEIR Disease Model",
    description: "Basic epidemic modeling",
    href: "/disease-math",
    icon: <Microscope className="h-6 w-6" />,
    category: "Disease Math",
    color: "from-red-500 to-pink-500",
    badge: "Standard"
  },
  {
    title: "SEIRDV Model",
    description: "Advanced with vaccination",
    href: "/disease-math",
    icon: <FlaskConical className="h-6 w-6" />,
    category: "Disease Math",
    color: "from-rose-500 to-red-500",
    badge: "Advanced"
  },

  // Family Health Study
  {
    title: "Family Health Study",
    description: "ICMR-NIN 2020 compliance",
    href: "/family-study",
    icon: <Users className="h-6 w-6" />,
    category: "Health Studies",
    color: "from-green-500 to-emerald-500",
    badge: "Complete"
  },

  // Adult Vaccination Module
  {
    title: "Adult Vaccination",
    description: "Comprehensive immunization assessment",
    href: "/adult-vaccination",
    icon: <Shield className="h-6 w-6" />,
    category: "Health Studies",
    color: "from-amber-500 to-orange-500",
    badge: "Assessment"
  }
];

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

const ToolCard = ({ title, description, href, icon, category, color, badge }: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: string;
  color: string;
  badge: string;
}) => (
  <Link href={href} className="block group">
    <EnhancedCard
      className="h-full border-2 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
      glass={true}
      glow={true}
      hover={true}
    >
      <EnhancedCardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            {badge}
          </Badge>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
            {category}
          </div>
          <EnhancedCardTitle className="text-lg font-semibold tracking-tight group-hover:text-shimmer transition-colors">
            {title}
          </EnhancedCardTitle>
          <EnhancedCardDescription className="text-sm text-muted-foreground mt-1">
            {description}
          </EnhancedCardDescription>
        </div>
      </EnhancedCardHeader>
      <EnhancedCardContent className="pt-0">
        <div className="flex items-center text-primary font-medium group-hover:text-primary/80 text-sm">
          <span>Launch Tool</span>
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
        {/* Dynamic Background with Multiple Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent animate-gradient-x" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-warning/20 to-transparent animate-pulse-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,107,53,0.3),transparent_50%)] animate-float" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,215,0,0.3),transparent_50%)] animate-float-delayed" />

        {/* Animated Sun Rays */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-warning/30 to-primary/30 animate-spin-slow blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-secondary/40 to-warning/40 animate-spin-reverse blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-primary/50 to-secondary/50 animate-pulse-fast blur-xl" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white/40 rounded-full animate-float-particle-${i % 3 + 1}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Geometric Shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-warning/30 to-primary/30 rounded-full blur-xl animate-bounce-slow" />
        <div className="absolute top-1/4 right-20 w-24 h-24 bg-gradient-to-br from-secondary/40 to-accent/40 rounded-full blur-lg animate-float" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-primary/25 to-warning/25 rounded-full blur-2xl animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-accent/50 to-secondary/50 rotate-45 blur-sm animate-spin-slow" />
        <div className="absolute bottom-1/4 right-10 w-20 h-20 bg-gradient-to-br from-warning/40 to-primary/40 rounded-full blur-lg animate-float-delayed" />

        <div className="relative container mx-auto px-4 text-center w-full text-white z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              {/* Enhanced Badge with Glow */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-sm font-medium mb-8 shadow-2xl animate-glow-pulse">
                <Sparkles className="w-4 h-4 text-warning animate-spin-slow" />
                <span className="bg-gradient-to-r from-white to-warning bg-clip-text text-transparent font-semibold">15 Advanced Statistical Tools</span>
                <Sparkles className="w-4 h-4 text-warning animate-spin-slow" />
              </div>

              {/* Main Title with Sun-like Radiance */}
              <div className="relative">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-transparent bg-gradient-to-r from-warning via-white to-warning bg-clip-text animate-shimmer drop-shadow-2xl">
                  KARMASTAT
                </h1>
                {/* Radiating Glow Effect */}
                <div className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-warning/20 blur-sm animate-pulse-fast">
                  KARMASTAT
                </div>
                <div className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-white/10 blur-lg animate-pulse-slow">
                  KARMASTAT
                </div>
              </div>

              {/* Subtitle with Enhanced Typography */}
              <div className="text-xl md:text-3xl text-white/95 font-light max-w-3xl mx-auto leading-relaxed tracking-wide animate-fade-in-up">
                <span className="bg-gradient-to-r from-white via-warning/80 to-white bg-clip-text text-transparent">
                  Advanced Statistical Analysis Platform
                </span>
              </div>

              {/* Description with Motion */}
              <div className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed animate-fade-in-up-delayed">
                Comprehensive tools for research, epidemiology, and data science with beautiful
                <span className="text-warning font-semibold"> interactive visualizations</span>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <EnhancedButton
                variant="default"
                size="lg"
                animation="hover"
                icon={<Calculator className="h-5 w-5" />}
                className="min-w-[220px] bg-white/90 text-primary hover:bg-white hover:text-primary shadow-2xl hover:shadow-warning/25 transform hover:scale-110 border-0 font-semibold text-lg py-4 rounded-xl backdrop-blur-sm animate-glow-button"
              >
                <Link href="/sample-size/intelligent-detector">
                  🚀 Explore Tools
                </Link>
              </EnhancedButton>

              <EnhancedButton
                variant="ghost"
                size="lg"
                animation="bounce"
                icon={<Heart className="h-5 w-5" />}
                className="min-w-[220px] border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/70 font-semibold text-lg py-4 rounded-xl backdrop-blur-md shadow-xl animate-border-glow"
              >
                <Link href="#mission">
                  💫 Our Mission
                </Link>
              </EnhancedButton>
            </div>

            {/* Quick Stats with Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 animate-fade-in-up-late">
              {[
                { number: "25+", label: "Advanced Tools", icon: "🔬" },
                { number: "100%", label: "Open Source", icon: "🌟" },
                { number: "∞", label: "Possibilities", icon: "🚀" },
                { number: "0₹", label: "Always Free", icon: "💎" }
              ].map((stat, index) => (
                <div key={stat.label} className="text-center space-y-2 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="text-2xl">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-warning drop-shadow-lg">{stat.number}</div>
                  <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-gradient mb-4">
              Complete Statistical Toolkit
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              15 specialized tools covering every aspect of statistical analysis, from sample size calculations to epidemiological modeling and health assessments
            </p>
          </div>

          {/* All Tools Grid */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allTools.map((tool, index) => (
                <div key={tool.title}>
                  <ToolCard {...tool} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gradient">15</div>
              <div className="text-sm text-muted-foreground">Statistical Tools</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gradient">7</div>
              <div className="text-sm text-muted-foreground">Sample Size Calculators</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gradient">4</div>
              <div className="text-sm text-muted-foreground">Regression Models</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gradient">2</div>
              <div className="text-sm text-muted-foreground">Health Studies</div>
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
                <Link href="/sample-size/intelligent-detector">
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
                <Link href="/sample-size/intelligent-detector">
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
