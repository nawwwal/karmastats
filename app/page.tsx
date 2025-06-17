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
  TreePine,
  Heart,
  Globe,
  Target,
  Award,
  Zap,
  Shield
} from 'lucide-react';

const tools = {
  calculators: [
    {
      title: "Sample Size Calculator",
      description: "Comprehensive suite of sample size calculation tools for various study designs with statistical power analysis",
      href: "/sample-size",
      icon: <Calculator className="h-8 w-8" />,
      features: ["Multiple study designs", "Power analysis", "Effect size calculations"],
      status: "Complete"
    },
    {
      title: "Regression Analysis",
      description: "Perform linear, polynomial, and logistic regression to model relationships between variables",
      href: "/regression",
      icon: <Activity className="h-8 w-8" />,
      features: ["Linear regression", "Polynomial regression", "Logistic regression"],
      status: "Complete"
    },
    {
      title: "Disease Modeling",
      description: "Advanced epidemiological modeling with SEIRDV compartments and intervention analysis",
      href: "/disease-math",
      icon: <Microscope className="h-8 w-8" />,
      features: ["SEIRDV models", "Intervention analysis", "Geographic modeling"],
      status: "Complete"
    }
  ],
  studies: [
    {
      title: "Family Health Study",
      description: "Comprehensive family health assessment based on ICMR-NIN 2020 guidelines",
      href: "/family-study",
      icon: <Users className="h-8 w-8" />,
      features: ["ICMR-NIN 2020 compliance", "Nutritional analysis", "Health records"],
      status: "Complete"
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

const CalcCard = ({ title, description, href, icon, features, status }: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  features: string[];
  status: string;
}) => (
  <Link href={href} className="block group">
    <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border-2 hover:border-primary/20">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            {icon}
          </div>
          <Badge variant={status === "Complete" ? "default" : "secondary"} className="text-xs">
            {status}
          </Badge>
        </div>
        <div>
          <CardTitle className="heading-4 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="body-default text-muted-foreground mt-2">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center body-small text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
              {feature}
            </div>
          ))}
        </div>
        <div className="flex items-center text-primary font-medium group-hover:text-primary/80">
          <span className="body-small">Access Tool</span>
          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

const StatCard = ({ icon, number, description, detail }: {
  icon: React.ReactNode;
  number: string;
  description: string;
  detail: string;
}) => (
  <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <CardContent className="pt-6 space-y-4">
      <div className="flex justify-center">
        {icon}
      </div>
      <div className="space-y-2">
        <div className="heading-2 text-foreground">{number}</div>
        <div className="font-medium text-foreground">{description}</div>
        <div className="body-small text-muted-foreground">{detail}</div>
      </div>
    </CardContent>
  </Card>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="heading-display lg:text-7xl animate-fadeInDown">
                KARMASTAT
              </h1>
              <p className="lead-text lg:text-2xl text-white/90 font-light animate-fadeInUp animate-delay-200">
                Where Selfless Work Meets Calculated Precision
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeInUp animate-delay-300">
              <p className="body-large text-white/80">
                A powerful fusion of KARMA (selfless work performed with dedication and compassion)
                and STAT (commitment to precision with scientific rigor) - creating statistical tools
                that empower researchers to make informed decisions benefiting humanity.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Link href="#tools">Explore Tools</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  <Link href="#mission">Our Mission</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="heading-1 mb-6 text-gradient">Our Mission</h2>
              <p className="lead-text text-muted-foreground">
                KARMASTAT represents a transformative approach to research and innovation,
                combining ethical purpose with statistical precision.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Heart className="h-8 w-8 text-primary" />
                    <CardTitle className="heading-3">KARMA</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="body-default text-muted-foreground">
                    The principle of selfless work performed with dedication and compassion,
                    recognizing that our actions create ripples that extend far beyond ourselves.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Target className="h-8 w-8 text-secondary" />
                    <CardTitle className="heading-3">STAT</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="body-default text-muted-foreground">
                    The commitment to precision, where every analytical move is calculated
                    with scientific rigor to ensure accuracy and reliability.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="pt-6">
                <blockquote className="lead-text italic text-center text-muted-foreground">
                  "In nature, nothing is perfect and everything is perfect. Trees can be contorted,
                  bent in weird ways, and they're still beautiful. Just as in nature, our tools
                  embrace both precision and adaptation."
                </blockquote>
                <p className="text-right mt-4 label-text text-primary">— Alice Walker</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-1 mb-6">Research Tools</h2>
            <p className="lead-text text-muted-foreground max-w-3xl mx-auto">
              Our suite of specialized tools represents the culmination of rigorous methodological
              development and statistical innovation, designed to address complex research challenges
              with precision and insight.
            </p>
          </div>

          {Object.entries(tools).map(([category, calcs]) => (
            <div key={category} className="mb-16">
              <h3 className="heading-2 mb-8 capitalize flex items-center">
                {category === 'calculators' ? <Calculator className="h-8 w-8 mr-3 text-primary" /> : <Users className="h-8 w-8 mr-3 text-primary" />}
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {calcs.map((calc) => (
                  <CalcCard key={calc.href} {...calc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Environmental Impact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="heading-1 mb-6 text-gradient">Environmental Impact</h2>
              <p className="lead-text text-muted-foreground">
                At KARMASTAT, we embrace nature-inspired solutions and environmental consciousness
                as core principles guiding our work and research methodology.
              </p>
            </div>

            <Card className="mb-12 bg-gradient-to-r from-success/10 to-info/10 border-success/20">
              <CardContent className="pt-6">
                <blockquote className="lead-text italic text-center text-muted-foreground">
                  "The best time to plant a tree was 20 years ago. The second best time is now.
                  Similarly, the optimal time for implementing data-driven solutions is at the
                  earliest possible opportunity."
                </blockquote>
                <p className="text-right mt-4 label-text text-primary">— Adapted from Chinese Proverb</p>
              </CardContent>
            </Card>

            <h3 className="heading-2 mb-8 text-center">The Remarkable Impact of Trees</h3>

            <div className="grid md:grid-cols-3 gap-8">
              {impactStats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="heading-1 mb-6">Support Our Mission</h2>
              <p className="lead-text text-muted-foreground">
                Your voluntary contributions enable us to continue developing innovative research tools
                while promoting environmental sustainability.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center">
                <Card className="inline-block p-8 bg-card border-2 border-primary/20">
                  <div className="w-48 h-48 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white code-large">
                    QR CODE
                    <br />
                    ruchitnawal03@okaxis
                  </div>
                </Card>
                <p className="mt-4 body-small text-muted-foreground">Scan to support our environmental initiatives</p>
              </div>

              <div className="space-y-6">
                <h3 className="heading-3">Your Support Enables:</h3>
                <div className="space-y-4">
                  {[
                    "Development of advanced epidemiological modeling tools",
                    "Creation of educational resources on environmental conservation",
                    "Support for tree-planting initiatives in regions experiencing deforestation",
                    "Continuous improvement and maintenance of our digital platforms"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <Shield className="h-5 w-5 text-success mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Quote */}
      <section className="py-16 bg-background border-t">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto bg-accent/10 border-accent/20">
            <CardContent className="pt-6">
              <blockquote className="lead-text italic text-center text-muted-foreground">
                "The true meaning of life is to plant trees, under whose shade you do not expect to sit.
                Our research tools aim to create similar lasting impacts for future generations."
              </blockquote>
              <p className="text-right mt-4 label-text text-primary">— Nelson Henderson</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
