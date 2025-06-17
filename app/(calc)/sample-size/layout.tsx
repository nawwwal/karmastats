'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const modules = [
  {
    title: 'Intelligent Study Type Detector',
    href: '/sample-size/detector',
  },
  {
    title: 'Survival Analysis',
    href: '/sample-size/survival',
  },
  {
    title: 'Comparative Study',
    href: '/sample-size/comparative',
  },
  {
    title: 'T-Test',
    href: '/sample-size/t-test',
  },
  {
    title: 'Diagnostic Study',
    href: '/sample-size/diagnostic',
  },
  {
    title: 'Clinical Trials',
    href: '/sample-size/clinical',
  },
  {
    title: 'Cross-sectional / Descriptive',
    href: '/sample-size/cross-sectional',
  },
];

export default function SampleSizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="heading-1">Sample Size Calculators</h1>
        <p className="text-muted-foreground">
          Tools to help you determine the right sample size for your study.
        </p>
      </header>
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}
