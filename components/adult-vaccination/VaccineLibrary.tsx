"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

type AgeGroup = 'young-adult' | 'mid-adult' | 'mature-adult' | 'senior' | 'all'

const ageGroups = [
  { id: 'young-adult' as AgeGroup, label: 'Young Adults (18-29)', active: true },
  { id: 'mid-adult' as AgeGroup, label: 'Mid Adults (30-49)', active: false },
  { id: 'mature-adult' as AgeGroup, label: 'Mature Adults (50-64)', active: false },
  { id: 'senior' as AgeGroup, label: 'Active Seniors (65+)', active: false },
  { id: 'all' as AgeGroup, label: 'All Vaccines', active: false },
]

export function VaccineLibrary() {
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('young-adult')

  const renderVaccinesByAge = () => {
    switch (selectedAge) {
      case 'young-adult':
        return <YoungAdultVaccines />
      case 'mid-adult':
        return <MidAdultVaccines />
      case 'mature-adult':
        return <MatureAdultVaccines />
      case 'senior':
        return <SeniorVaccines />
      case 'all':
        return <AllVaccines />
      default:
        return <YoungAdultVaccines />
    }
  }

  return (
    <div className="space-y-8">
      {/* Age Selector */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Adult Vaccination by Life Stage
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {ageGroups.map((group) => (
            <Button
              key={group.id}
              onClick={() => setSelectedAge(group.id)}
              className={`age-btn px-6 py-3 rounded-xl text-sm font-semibold min-w-[180px] ${
                selectedAge === group.id ? 'active' : ''
              }`}
              variant={selectedAge === group.id ? 'default' : 'outline'}
            >
              {group.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Vaccine Content */}
      <div className="animate-fadeInUp">
        {renderVaccinesByAge()}
      </div>
    </div>
  )
}

function YoungAdultVaccines() {
  const vaccines = [
    {
      name: 'Tdap (Tetanus-Diphtheria-Pertussis)',
      priority: '🔴',
      subtitle: 'Essential Adult Protection',
      description: 'Critical protection against tetanus, diphtheria, and whooping cough. Required every 10 years.',
      frequency: 'Every 10 years',
      cost: '₹500-1,800',
      efficacy: '95% protection against tetanus',
      sideEffects: ['Mild pain at injection site', 'Low-grade fever', 'Fatigue'],
      contraindications: ['Severe allergy to vaccine components', 'Severe illness'],
      schedule: '1 dose if last dose >10 years ago',
      indiaSpecific: 'Available at all government health centers. WHO-prequalified vaccines used.'
    },
    {
      name: 'HPV (Human Papillomavirus)',
      priority: '🔴',
      subtitle: 'Cancer Prevention Priority',
      description: 'Prevents cervical, anal, and other cancers. Most effective when given before age 26.',
      frequency: '2-3 dose series',
      cost: '₹2,500-4,000 per dose',
      efficacy: '90% prevention of targeted cancer-causing HPV types',
      sideEffects: ['Injection site pain', 'Mild fever', 'Fainting (rare)'],
      contraindications: ['Pregnancy', 'Severe allergy', 'Moderate/severe illness'],
      schedule: '2 doses (6-12 months apart) if age <15; 3 doses if age >15',
      indiaSpecific: 'Gardasil-9 available. Government programs in select states for girls.'
    },
    {
      name: 'Hepatitis B',
      priority: '🟡',
      subtitle: 'Liver Protection Essential',
      description: 'Protects against hepatitis B virus causing liver damage. Essential for healthcare workers.',
      frequency: '3-dose series (lifetime)',
      cost: '₹300-800 per dose',
      efficacy: '95% protection after complete series',
      sideEffects: ['Mild soreness', 'Low fever', 'Headache'],
      contraindications: ['Severe allergy to yeast', 'Severe illness'],
      schedule: '0, 1, 6 months schedule',
      indiaSpecific: 'High prevalence area. Free in govt hospitals. Combined Hep A+B available.'
    },
    {
      name: 'Annual Influenza',
      priority: '🔴',
      subtitle: 'Seasonal Protection',
      description: 'Annual protection against seasonal flu. India-specific strains for monsoon season.',
      frequency: 'Annual',
      cost: '₹500-1,500',
      efficacy: '40-60% when well-matched to circulating strains',
      sideEffects: ['Mild arm soreness', 'Low fever', 'Mild aches'],
      contraindications: ['Severe egg allergy (for egg-based vaccines)', 'Previous severe reaction'],
      schedule: 'Single annual dose before monsoon season',
      indiaSpecific: 'Southern hemisphere formula. Best given May-July before monsoon.'
    }
  ]

  return <VaccineGrid vaccines={vaccines} />
}

function MidAdultVaccines() {
  const vaccines = [
    {
      name: 'Pneumococcal PCV20/PCV21',
      priority: '🟡',
      subtitle: 'Pneumonia Prevention',
      description: 'Protects against pneumococcal pneumonia, meningitis, and blood infections.',
      frequency: 'Once (may need PPSV23 later)',
      cost: '₹3,500-6,000',
      efficacy: '75% reduction in invasive pneumococcal disease',
      sideEffects: ['Injection site reactions', 'Muscle aches', 'Fatigue'],
      contraindications: ['Severe allergy to vaccine components', 'Severe illness'],
      schedule: '1 dose of PCV20 OR PCV15 + PPSV23',
      indiaSpecific: 'High pneumonia burden. Especially important for urban pollution exposure.'
    },
    {
      name: 'Shingles (Zoster) Vaccine',
      priority: '🟡',
      subtitle: 'Nerve Pain Prevention',
      description: 'Prevents shingles and post-herpetic neuralgia. Recommended starting age 50.',
      frequency: '2-dose series',
      cost: '₹8,000-12,000 per dose',
      efficacy: '90% reduction in shingles risk',
      sideEffects: ['Injection site pain', 'Muscle pain', 'Fatigue', 'Headache'],
      contraindications: ['Immunocompromised', 'Pregnancy', 'Active shingles'],
      schedule: '2 doses, 2-6 months apart',
      indiaSpecific: 'Shingrix vaccine available. Higher risk in diabetes patients common in India.'
    }
  ]

  return <VaccineGrid vaccines={vaccines} />
}

function MatureAdultVaccines() {
  const vaccines = [
    {
      name: 'RSV (Respiratory Syncytial Virus)',
      priority: '🟡',
      subtitle: 'Respiratory Protection',
      description: 'New vaccine for adults 60+. Prevents severe RSV lower respiratory tract disease.',
      frequency: 'Single dose',
      cost: '₹4,000-6,500',
      efficacy: '82% reduction in lower respiratory tract disease',
      sideEffects: ['Injection site pain', 'Fatigue', 'Muscle pain'],
      contraindications: ['Severe allergy to vaccine components'],
      schedule: '1 dose for adults 60+ years',
      indiaSpecific: 'Recently introduced. Higher risk with air pollution and COPD prevalence.'
    }
  ]

  return <VaccineGrid vaccines={vaccines} />
}

function SeniorVaccines() {
  const vaccines = [
    {
      name: 'High-Dose Influenza',
      priority: '🔴',
      subtitle: 'Enhanced Senior Protection',
      description: '4x stronger flu vaccine for seniors. Better immune response than standard flu vaccine.',
      frequency: 'Annual',
      cost: '₹800-2,000',
      efficacy: '24% more effective than standard flu vaccine in seniors',
      sideEffects: ['More pronounced injection site reactions', 'Muscle aches', 'Fatigue'],
      contraindications: ['Severe egg allergy', 'Previous severe reaction'],
      schedule: 'Single annual dose',
      indiaSpecific: 'Fluzone High-Dose available. Critical for monsoon season protection.'
    },
    {
      name: 'PPSV23 Completion',
      priority: '🟡',
      subtitle: 'Pneumonia Series Completion',
      description: 'Completes pneumococcal protection if received PCV15 earlier.',
      frequency: 'Once (if indicated)',
      cost: '₹2,000-3,500',
      efficacy: 'Additional coverage for 8 pneumococcal serotypes',
      sideEffects: ['Injection site reactions', 'Mild fever'],
      contraindications: ['Severe allergy to vaccine components'],
      schedule: '1 dose, 1 year after PCV15',
      indiaSpecific: 'Complements PCV15 for broader coverage in high-burden setting.'
    }
  ]

  return <VaccineGrid vaccines={vaccines} />
}

function AllVaccines() {
  const vaccines = [
    {
      name: 'Yellow Fever',
      priority: '✈️',
      subtitle: 'Travel Required',
      description: 'Required for travel to endemic areas in Africa and South America.',
      frequency: 'Single dose (lifetime)',
      cost: '₹3,000-4,500',
      efficacy: '95% protection for life',
      sideEffects: ['Mild fever', 'Headache', 'Muscle aches'],
      contraindications: ['Age >60 (higher risk)', 'Immunocompromised', 'Egg allergy'],
      schedule: 'Single dose 10 days before travel',
      indiaSpecific: 'Available at designated yellow fever centers. International certificate required.'
    },
    {
      name: 'Japanese Encephalitis',
      priority: '🟡',
      subtitle: 'Regional Risk Protection',
      description: 'Important for travel to rural areas in Asia or endemic regions in India.',
      frequency: '2-dose series',
      cost: '₹1,500-2,500 per dose',
      efficacy: '95% protection after 2 doses',
      sideEffects: ['Injection site pain', 'Headache', 'Muscle aches'],
      contraindications: ['Severe allergy to vaccine components'],
      schedule: '2 doses, 28 days apart',
      indiaSpecific: 'Endemic in UP, Bihar, West Bengal. Important for rural travel/residence.'
    }
  ]

  return <VaccineGrid vaccines={vaccines} />
}

function VaccineGrid({ vaccines }: { vaccines: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {vaccines.map((vaccine, index) => (
        <div key={index} className="vaccine-card p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {vaccine.name}
            </h3>
            <span className="text-3xl animate-pulse">{vaccine.priority}</span>
          </div>

          <div className="text-lg font-semibold text-orange-600 mb-6">{vaccine.subtitle}</div>

          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {vaccine.description}
          </p>

          <div className="space-y-4">
            <div className="glass-card p-5 rounded-xl border-l-4 border-green-500">
              <div className="text-green-600 font-semibold text-sm mb-2 flex items-center gap-2">
                ✨ Efficacy
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {vaccine.efficacy}
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl border-l-4 border-yellow-500">
              <div className="text-yellow-600 font-semibold text-sm mb-2 flex items-center gap-2">
                ⚠️ Side Effects
              </div>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {vaccine.sideEffects.map((effect: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    {effect}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-5 rounded-xl border-l-4 border-red-500">
              <div className="text-red-600 font-semibold text-sm mb-2 flex items-center gap-2">
                🚫 Contraindications
              </div>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {vaccine.contraindications.map((contra: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {contra}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-5 rounded-xl border-l-4 border-primary">
              <div className="text-primary font-semibold text-sm mb-2 flex items-center gap-2">
                📅 Schedule
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {vaccine.schedule}
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl border-l-4 border-teal-500">
              <div className="text-teal-600 font-semibold text-sm mb-2 flex items-center gap-2">
                🇮🇳 India-Specific
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {vaccine.indiaSpecific}
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl border-l-4 border-orange-500">
              <div className="text-orange-600 font-semibold text-sm mb-2 flex items-center gap-2">
                💰 Cost
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Frequency:</strong> {vaccine.frequency}<br />
                <strong>Cost:</strong> {vaccine.cost}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
