import { Card, CardContent } from "@/components/ui/card";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { ModernResultsDisplay } from "@/components/ui/modern-results-display";
import { FamilyMember } from "@/lib/family-study/types";

interface FamilyStatisticsProps {
  members: FamilyMember[];
  animated?: boolean;
}

export function FamilyStatistics({ members, animated = true }: FamilyStatisticsProps) {
  const maleCount = members.filter(m => m.sex === 'male').length;
  const femaleCount = members.filter(m => m.sex === 'female').length;
  const childrenCount = members.filter(m => m.age < 18).length;
  const adultsCount = members.filter(m => m.age >= 18 && m.age < 60).length;
  const elderlyCount = members.filter(m => m.age >= 60).length;

  const familyMetrics = [
    {
      label: 'Total Members',
      value: members.length,
      format: 'integer' as const,
      category: 'primary' as const,
      trend: 'up' as const,
      comparison: {
        baseline: 4,
        label: 'vs. avg family size'
      }
    },
    {
      label: 'Male Members',
      value: maleCount,
      format: 'integer' as const,
      category: 'info' as const,
      change: {
        value: Math.round((maleCount / members.length) * 100),
        type: 'neutral' as const,
        label: 'of total'
      }
    },
    {
      label: 'Female Members',
      value: femaleCount,
      format: 'integer' as const,
      category: 'secondary' as const,
      change: {
        value: Math.round((femaleCount / members.length) * 100),
        type: 'neutral' as const,
        label: 'of total'
      }
    },
    {
      label: 'Children',
      value: childrenCount,
      format: 'integer' as const,
      category: 'success' as const,
      significance: {
        level: 'medium' as const,
        indicator: 'Under 18 years'
      },
      trend: childrenCount > 2 ? 'up' as const : 'down' as const
    },
    {
      label: 'Adults',
      value: adultsCount,
      format: 'integer' as const,
      category: 'warning' as const,
      significance: {
        level: 'medium' as const,
        indicator: '18-59 years'
      },
      trend: 'stable' as const
    },
    {
      label: 'Elderly',
      value: elderlyCount,
      format: 'integer' as const,
      category: 'info' as const,
      significance: {
        level: 'low' as const,
        indicator: '60+ years'
      },
      trend: elderlyCount > 0 ? 'up' as const : 'stable' as const
    }
  ];

  return (
    <ModernResultsDisplay
      title="Family Demographics"
      metrics={familyMetrics}
      layout="grid-auto"
      animated={animated}
      showComparisons={true}
    />
  );
}
