'use client';

import React from 'react';
import Link from 'next/link';
import { karmaTheme } from '@/components/ui/theme';

const calculators = {
    "Infectious Disease": [
        {
            title: "SEIRDV Model",
            description: "Model the dynamics of infectious diseases with compartments for Susceptible, Exposed, Infectious, Recovered, Deceased, and Vaccinated.",
            href: "/disease-math",
        },
    ],
    "Regression": [
        {
            title: "Regression Analysis",
            description: "Perform linear, polynomial, and logistic regression to model the relationship between variables.",
            href: "/regression",
        },
    ],
    "Sample Size": [
        {
            title: "T-Test",
            description: "Calculate sample size for Independent, Paired, and One-Sample T-Tests.",
            href: "/sample-size/t-test",
        },
        {
            title: "Diagnostic Study",
            description: "Determine sample size for single-test, comparative, and ROC analysis studies.",
            href: "/sample-size/diagnostic",
        },
        {
            title: "Clinical Trials",
            description: "Calculate sample size for superiority, non-inferiority, and equivalence trials.",
            href: "/sample-size/clinical-trials",
        },
        {
            title: "Cross-Sectional Study",
            description: "Estimate sample size for prevalence studies with advanced options.",
            href: "/sample-size/cross-sectional",
        },
         {
            title: "Survival Analysis",
            description: "Calculate sample size for survival studies (Log-Rank test).",
            href: "/sample-size/survival",
        },
        {
            title: "Comparative Study",
            description: "For Case-Control and Cohort studies.",
            href: "/sample-size/comparative",
        },
        {
            title: "Intelligent Study Detector",
            description: "Automatically detect the appropriate statistical study design.",
            href: "/sample-size/intelligent-detector",
        },
    ],
};

const CalcCard = ({ title, description, href }: { title: string; description: string; href: string }) => (
    <Link href={href} className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1">
        <h5 className="mb-2 text-2xl font-bold tracking-tight" style={{ color: karmaTheme.primary }}>{title}</h5>
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
