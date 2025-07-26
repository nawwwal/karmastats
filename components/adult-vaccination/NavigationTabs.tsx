import React from 'react'
import { cn } from '@/lib/utils'

type TabType = 'wellness' | 'vaccines' | 'conditions' | 'timeline' | 'travel'

interface NavigationTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs = [
  { id: 'wellness' as TabType, label: '🎯 Personal Health Assessment' },
  { id: 'vaccines' as TabType, label: '💉 Complete Vaccine Library' },
  { id: 'conditions' as TabType, label: '🏥 Risk-Based Protection' },
  { id: 'timeline' as TabType, label: '📅 Vaccination Timeline' },
  { id: 'travel' as TabType, label: '✈️ Travel Medicine' },
]

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <nav className="glass-card p-6 rounded-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'nav-tab px-5 py-4 rounded-xl text-sm font-semibold text-center transition-all duration-300',
              'border border-border',
              activeTab === tab.id
                ? 'active text-white shadow-lg'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
