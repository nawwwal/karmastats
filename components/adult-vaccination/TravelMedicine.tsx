"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TravelFormData {
  destination: string
  duration: string
  purpose: string
  departureDate: string
}

export function TravelMedicine() {
  const [formData, setFormData] = useState<TravelFormData>({
    destination: '',
    duration: '',
    purpose: '',
    departureDate: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [minDate, setMinDate] = useState('')

  // Set minimum date after hydration to avoid SSR mismatch
  useEffect(() => {
    setMinDate(new Date().toISOString().split('T')[0])
  }, [])

  const handleSubmit = async () => {
    if (!formData.destination || !formData.duration || !formData.departureDate) {
      alert('Please complete travel destination, duration, and departure date')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setShowResults(true)
    }, 2500)
  }

  const travelVaccines = [
    {
      category: 'Required/Routine',
      icon: '🔴',
      description: 'Mandatory or essential vaccines for most international travel',
      vaccines: [
        {
          name: 'Yellow Fever',
          requirement: 'Required for Africa/South America',
          timing: '10 days before travel',
          cost: '₹3,000-4,500',
          validity: 'Lifetime',
          notes: 'International certificate required'
        },
        {
          name: 'Routine Boosters',
          requirement: 'Update all routine vaccines',
          timing: '2-4 weeks before',
          cost: 'Variable',
          validity: 'As per schedule',
          notes: 'Tdap, MMR, Flu, COVID-19'
        }
      ]
    },
    {
      category: 'Routine Travel',
      icon: '🟡',
      description: 'Recommended for most international destinations',
      vaccines: [
        {
          name: 'Hepatitis A',
          requirement: 'Most international destinations',
          timing: '2 weeks before travel',
          cost: '₹1,500-2,500',
          validity: '25+ years after series',
          notes: 'Food/water-borne protection'
        },
        {
          name: 'Typhoid',
          requirement: 'High-risk areas (South Asia, Africa)',
          timing: '2-4 weeks before',
          cost: '₹800-1,500',
          validity: '3 years',
          notes: 'Oral or injection available'
        },
        {
          name: 'Hepatitis B',
          requirement: 'Extended stay/high-risk activities',
          timing: '6 months for full series',
          cost: '₹300-800 per dose',
          validity: 'Lifetime',
          notes: '3-dose series recommended'
        }
      ]
    },
    {
      category: 'High-Risk Travel',
      icon: '🔶',
      description: 'Specific destinations or high-risk activities',
      vaccines: [
        {
          name: 'Japanese Encephalitis',
          requirement: 'Rural Asia, monsoon travel',
          timing: '28 days for 2-dose series',
          cost: '₹1,500-2,500 per dose',
          validity: '3 years',
          notes: 'Rural/agricultural areas'
        },
        {
          name: 'Meningococcal ACWY',
          requirement: 'Hajj, Umrah, Sub-Saharan Africa',
          timing: '2 weeks before travel',
          cost: '₹2,000-3,500',
          validity: '5 years',
          notes: 'Certificate required for Saudi Arabia'
        },
        {
          name: 'Rabies Pre-exposure',
          requirement: 'Remote areas, animal contact',
          timing: '21-28 days for series',
          cost: '₹1,200-2,000 per dose',
          validity: '3 years',
          notes: 'Reduces post-exposure treatment'
        },
        {
          name: 'Cholera',
          requirement: 'High-risk humanitarian work',
          timing: '2 weeks before travel',
          cost: '₹1,000-1,800',
          validity: '2 years',
          notes: 'Limited efficacy, special circumstances'
        }
      ]
    }
  ]

  if (showResults) {
    return <TravelResults formData={formData} onBack={() => setShowResults(false)} />
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gradient mb-4">
          Travel Medicine & Vaccines
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Destination-specific vaccination recommendations and travel health guidance
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Travel Health Planning
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Get personalized recommendations based on your travel plans
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="section-icon w-12 h-12 rounded-xl text-xl">
                ✈️
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Travel Information
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Destination</Label>
                <Select value={formData.destination} onValueChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}>
                  <SelectTrigger className="form-glass">
                    <SelectValue placeholder="Select destination region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="southeast-asia">Southeast Asia</SelectItem>
                    <SelectItem value="east-asia">East Asia</SelectItem>
                    <SelectItem value="middle-east">Middle East</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                    <SelectItem value="south-america">South America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="oceania">Oceania</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger className="form-glass">
                    <SelectValue placeholder="Length of stay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short term (&lt; 2 weeks)</SelectItem>
                    <SelectItem value="medium">Medium term (2 weeks - 3 months)</SelectItem>
                    <SelectItem value="long">Long term (&gt; 3 months)</SelectItem>
                    <SelectItem value="permanent">Permanent relocation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Purpose</Label>
                <Select value={formData.purpose} onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}>
                  <SelectTrigger className="form-glass">
                    <SelectValue placeholder="Purpose of travel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourism">Tourism/Leisure</SelectItem>
                    <SelectItem value="business">Business Travel</SelectItem>
                    <SelectItem value="education">Education/Study</SelectItem>
                    <SelectItem value="work">Work Assignment</SelectItem>
                    <SelectItem value="volunteer">Volunteer/Humanitarian</SelectItem>
                    <SelectItem value="medical">Medical Treatment</SelectItem>
                    <SelectItem value="visiting">Visiting Family/Friends</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Departure Date</Label>
                <Input
                  type="date"
                  className="form-glass"
                  value={formData.departureDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                  min={minDate}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary w-full md:w-auto mx-auto block px-8 py-4 text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-secondary hover:shadow-xl"
          >
            {isLoading && <div className="loading-spinner mr-2" />}
            {isLoading ? 'Analyzing Travel Requirements...' : '🗺️ Generate Travel Health Plan'}
          </Button>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          Quick Reference Travel Vaccines
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {travelVaccines.map((category, index) => (
            <div key={index} className="vaccine-card p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl">{category.icon}</span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  {category.category}
                </h4>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {category.description}
              </p>

              <div className="space-y-4">
                {category.vaccines.map((vaccine, vIndex) => (
                  <div key={vIndex} className="glass-card p-4 rounded-xl">
                    <h5 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {vaccine.name}
                    </h5>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <div><strong>Requirement:</strong> {vaccine.requirement}</div>
                      <div><strong>Timing:</strong> {vaccine.timing}</div>
                      <div><strong>Cost:</strong> {vaccine.cost}</div>
                      <div><strong>Validity:</strong> {vaccine.validity}</div>
                      <div className="text-xs italic">{vaccine.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TravelResults({ formData, onBack }: { formData: TravelFormData; onBack: () => void }) {
  const [weeksUntilTravel, setWeeksUntilTravel] = useState(0)

  useEffect(() => {
    if (formData.departureDate) {
      const departure = new Date(formData.departureDate)
      const now = new Date()
      const weeks = Math.ceil((departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7))
      setWeeksUntilTravel(weeks)
    }
  }, [formData.departureDate])

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-3">
            Your Travel Health Plan
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Customized for {formData.destination} • {formData.duration} • {weeksUntilTravel} weeks until departure
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border-l-4 border-orange-500">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              ⏰ Timing Alert
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              You have <strong>{weeksUntilTravel} weeks</strong> until travel.
              {weeksUntilTravel < 4 ? ' This is cutting it close for some vaccines! ' : ' You have adequate time for most vaccines. '}
              Start planning immediately and consult a travel medicine specialist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl text-center border-l-4 border-red-500">
              <div className="text-3xl font-bold text-red-500 mb-2">2</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Required Vaccines
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center border-l-4 border-yellow-500">
              <div className="text-3xl font-bold text-yellow-500 mb-2">4</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Recommended
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center border-l-4 border-primary">
              <div className="text-3xl font-bold text-primary mb-2">1</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Consider
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border-l-4 border-green-500">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              📋 Action Plan
            </h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">1.</span>
                <span>Schedule appointment with travel medicine clinic within 1 week</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">2.</span>
                <span>Update routine vaccines (Tdap, MMR, Flu, COVID-19) immediately</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">3.</span>
                <span>Start Hepatitis A series (can accelerate schedule if needed)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">4.</span>
                <span>Consider travel insurance and emergency medical evacuation coverage</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">5.</span>
                <span>Research local healthcare facilities at destination</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={onBack} variant="outline" className="px-6 py-2">
            ← Back to Travel Planning
          </Button>
        </div>
      </div>
    </div>
  )
}
