'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const sections = [
  {
    title: 'Infectious Disease Modelling',
    href: '/disease-math',
  },
  {
    title: 'Magical Sample Size Calculator',
    href: '/sample-size',
  },
  {
    title: 'Regression Analysis',
    href: '/regression',
  },
  {
    title: 'Family Study',
    href: '/family-study',
  },
];

export default function CalcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Karmastat
            </Link>
            <nav>
              <ul className="flex space-x-4">
                {sections.map((section) => (
                  <li key={section.href}>
                    <Link
                      href={section.href}
                      className={cn(
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        pathname.startsWith(section.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {section.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
