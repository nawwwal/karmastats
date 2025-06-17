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

        <p className="font-normal text-gray-700">{description}</p>
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
        {Object.entries(calculators).map(([category, calcs]) => (
          <section key={category} className="mb-12">
            <h2 className="text-4xl font-bold mb-6 border-b-4 pb-2 border-blue-500 text-blue-800">
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
