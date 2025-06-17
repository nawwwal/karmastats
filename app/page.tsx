'use client';

import React from 'react';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calculator, Activity, Microscope, ChevronRight } from 'lucide-react';

const tools = {
  calculators: [
    {
      title: "Sample Size Calculator",
      description: "Comprehensive suite of sample size calculation tools for various study designs",
      href: "/sample-size",
      icon: <Calculator className="h-8 w-8 text-primary" />
    },
    {
      title: "Regression Analysis",
      description: "Perform linear, polynomial, and logistic regression to model relationships between variables",
      href: "/regression",
      icon: <Activity className="h-8 w-8 text-primary" />
    },
    {
      title: "Disease Modeling",
      description: "Advanced epidemiological modeling with SEIRDV compartments and intervention analysis",
      href: "/disease-math",
      icon: <Microscope className="h-8 w-8 text-primary" />
    }
  ],
  studies: [
    {
      title: "Family Health Study",
      description: "Comprehensive family health assessment based on ICMR-NIN 2020 guidelines",
      href: "/family-study",
      icon: <Activity className="h-8 w-8 text-primary" />
    }
  ]
};

const CalcCard = ({ title, description, href, icon }) => (
  <Link href={href} className="block">
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardHeader>
        <div className="flex items-center space-x-3">
          {icon}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-600">
          {description}
        </CardDescription>
        <div className="flex items-center mt-4 text-primary">
          <span className="text-sm font-medium">Open Tool</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="text-white text-center p-12 bg-blue-800">
        <h1 className="text-6xl font-extrabold font-mono">
          KARMASTAT
        </h1>
        <p className="text-xl mt-4 text-blue-200">
          Unifying statistical tools into one maintainable Next.js application.
        </p>
      </header>

      <main className="container mx-auto px-4 py-12">
        {Object.entries(tools).map(([category, calcs]) => (
          <section key={category} className="mb-12">
            <h2 className="text-4xl font-bold mb-6 border-b-4 pb-2 border-blue-500 text-blue-800 capitalize">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {calcs.map((calc) => (
                <CalcCard key={calc.href} {...calc} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}