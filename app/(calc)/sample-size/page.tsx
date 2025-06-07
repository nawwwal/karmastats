import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const calculators = [
  {
    title: 'Intelligent Study Detector',
    description: 'Determine the appropriate sample size calculation method based on your study design',
    href: '/sample-size/intelligent-detector',
  },
  {
    title: 'Survival Analysis',
    description: 'Calculate sample size for survival analysis studies',
    href: '/sample-size/survival',
  },
  {
    title: 'Comparative Study',
    description: 'Sample size for comparing two groups',
    href: '/sample-size/comparative',
  },
  {
    title: 'T-Test Calculator',
    description: 'Calculate sample size for t-test studies',
    href: '/sample-size/t-test',
  },
  {
    title: 'Diagnostic Study',
    description: 'Sample size for diagnostic accuracy studies',
    href: '/sample-size/diagnostic',
  },
  {
    title: 'Clinical Trials',
    description: 'Sample size calculations for clinical trials',
    href: '/sample-size/clinical-trials',
  },
  {
    title: 'Cross-sectional Study',
    description: 'Sample size for descriptive/cross-sectional studies',
    href: '/sample-size/cross-sectional',
  },
]

export default function SampleSizePage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {calculators.map((calc) => (
        <Link key={calc.href} href={calc.href}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-primary">{calc.title}</CardTitle>
              <CardDescription>{calc.description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
