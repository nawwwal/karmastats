"use client"

import React, { useState } from 'react'
import { HeroSection } from './HeroSection'
import { NavigationTabs } from './NavigationTabs'
import { WellnessAssessment } from './WellnessAssessment'
import { VaccineLibrary } from './VaccineLibrary'
import { RiskBasedProtection } from './RiskBasedProtection'
import { VaccinationTimeline } from './VaccinationTimeline'
import { TravelMedicine } from './TravelMedicine'
import { ThemeToggle } from './ThemeToggle'
import { Footer } from './Footer'

type TabType = 'wellness' | 'vaccines' | 'conditions' | 'timeline' | 'travel'

export function AdultVaccinationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('wellness')

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
    <div className="min-h-screen relative">
      <ThemeToggle />

      <HeroSection />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-8 lg:mt-12">
          {renderTabContent()}
        </div>
      </main>

      <Footer />
    </div>
  )
}
