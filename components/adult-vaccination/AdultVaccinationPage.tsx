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
      label: '🎯 Health',
      shortLabel: '🎯',
      description: 'Personal screening'
    },
    {
      value: 'vaccines' as TabType,
      label: '💉 Library',
      shortLabel: '💉',
      description: 'Vaccine guide'
    },
    {
      value: 'conditions' as TabType,
      label: '🏥 Risk',
      shortLabel: '🏥',
      description: 'Conditions'
    },
    {
      value: 'timeline' as TabType,
      label: '📅 Timeline',
      shortLabel: '📅',
      description: 'Schedule'
    },
    {
      value: 'travel' as TabType,
      label: '✈️ Travel',
      shortLabel: '✈️',
      description: 'Travel vaccines'
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
          <EnhancedTabsList className="grid w-full grid-cols-5 gap-0.5 max-w-full overflow-hidden" variant="modern">
            {tabs.map((tab) => (
              <EnhancedTabsTrigger
                key={tab.value}
                value={tab.value}
                variant="modern"
                className="min-h-[2.5rem] px-0.5 py-1 whitespace-normal !justify-center !items-center max-w-full overflow-hidden tab-container"
              >
                <div className="flex flex-col items-center gap-0.5 text-center w-full max-w-full overflow-hidden">
                  <span className="font-medium leading-none w-full overflow-hidden text-center tab-text-safe">
                    <span className="hidden md:inline text-xs">{tab.label}</span>
                    <span className="hidden sm:inline md:hidden text-[10px]">{tab.label.split(' ')[0] + ' ' + tab.label.split(' ')[1]}</span>
                    <span className="sm:hidden text-lg">{tab.shortLabel}</span>
                  </span>
                  <span className="text-[7px] lg:text-[9px] text-muted-foreground hidden lg:block leading-none w-full tab-text-safe">
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
