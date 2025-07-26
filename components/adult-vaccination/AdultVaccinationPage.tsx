"use client"

import React, { useState } from 'react'
import { Shield } from 'lucide-react'
import { ToolPageWrapper } from '@/components/ui/tool-page-wrapper'
import {
  EnhancedTabs,
  EnhancedTabsList,
  EnhancedTabsTrigger,
  EnhancedTabsContent,
} from '@/components/ui/enhanced-tabs'
import { WellnessAssessment } from './WellnessAssessment'
import { VaccineLibrary } from './VaccineLibrary'
import { RiskBasedProtection } from './RiskBasedProtection'
import { VaccinationTimeline } from './VaccinationTimeline'
import { TravelMedicine } from './TravelMedicine'

type TabType = 'wellness' | 'vaccines' | 'conditions' | 'timeline' | 'travel'

export function AdultVaccinationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('wellness')

  const handleReset = () => {
    setActiveTab('wellness')
  }

  const tabs = [
    {
      value: 'wellness' as TabType,
      label: '🎯 Health Assessment',
      description: 'Personal health screening'
    },
    {
      value: 'vaccines' as TabType,
      label: '💉 Vaccine Library',
      description: 'Complete vaccination guide'
    },
    {
      value: 'conditions' as TabType,
      label: '🏥 Risk Protection',
      description: 'Condition-based recommendations'
    },
    {
      value: 'timeline' as TabType,
      label: '📅 Timeline',
      description: 'Vaccination scheduling'
    },
    {
      value: 'travel' as TabType,
      label: '✈️ Travel Medicine',
      description: 'Travel-specific vaccines'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wellness':
        return <WellnessAssessment />
      case 'vaccines':
        return <VaccineLibrary />
      case 'conditions':
        return <RiskBasedProtection />
      case 'timeline':
        return <VaccinationTimeline />
      case 'travel':
        return <TravelMedicine />
      default:
        return <WellnessAssessment />
    }
  }

  return (
    <ToolPageWrapper
      title="Adult Vaccination Assessment"
      description="Comprehensive immunization planning based on WHO, CDC, and Indian guidelines for optimal health protection"
      icon={Shield}
      layout="single-column"
      onReset={handleReset}
    >
      <div className="space-y-8">
        <EnhancedTabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="space-y-6"
        >
          <EnhancedTabsList className="grid w-full grid-cols-5" variant="modern">
            {tabs.map((tab) => (
              <EnhancedTabsTrigger key={tab.value} value={tab.value} variant="modern">
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-medium">{tab.label}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {tab.description}
                  </span>
                </div>
              </EnhancedTabsTrigger>
            ))}
          </EnhancedTabsList>

          <EnhancedTabsContent value="wellness">
            <WellnessAssessment />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="vaccines">
            <VaccineLibrary />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="conditions">
            <RiskBasedProtection />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="timeline">
            <VaccinationTimeline />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="travel">
            <TravelMedicine />
          </EnhancedTabsContent>
        </EnhancedTabs>
      </div>
    </ToolPageWrapper>
  )
}
