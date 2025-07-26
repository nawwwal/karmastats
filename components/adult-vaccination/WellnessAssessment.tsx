"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface FormData {
  fullName: string
  age: string
  gender: string
  state: string
  profession: string
  travel: string
  lastVaccine: string
  vaccineHistory: string
  conditions: string[]
}

export function WellnessAssessment() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    age: '',
    gender: '',
    state: '',
    profession: '',
    travel: '',
    lastVaccine: '',
    vaccineHistory: '',
    conditions: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const healthConditions = [
    { id: 'diabetes', label: 'Diabetes (Type 1 or 2)' },
    { id: 'heart', label: 'Heart Disease / Hypertension' },
    { id: 'lung', label: 'Lung Disease / Asthma' },
    { id: 'immune', label: 'Immunocompromised Condition' },
    { id: 'kidney', label: 'Kidney Disease' },
    { id: 'liver', label: 'Liver Disease' },
    { id: 'pregnant', label: 'Pregnancy / Planning Pregnancy' },
    { id: 'cancer', label: 'Cancer / Chemotherapy' },
    { id: 'autoimmune', label: 'Autoimmune Disorders' },
    { id: 'transplant', label: 'Organ Transplant' },
  ]

  const handleConditionChange = (conditionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      conditions: checked
        ? [...prev.conditions, conditionId]
        : prev.conditions.filter(id => id !== conditionId)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.age || !formData.gender) {
      alert('Please complete the required fields: Name, Age, and Gender')
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowResults(true)
    }, 3000)
  }

  if (showResults) {
    return <WellnessResults formData={formData} onBack={() => setShowResults(false)} />
  }

  return (
    <div className="glass-card p-8 rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-3">
          Comprehensive Health Assessment
        </h2>
        <p className="text-lg text-muted-foreground font-medium">
          WHO & CDC guidelines for Indian healthcare • Complete protection planning
        </p>
      </div>

      <div className="space-y-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="section-icon w-12 h-12 rounded-xl text-xl">
              👤
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Full Name *</Label>
              <Input
                className="form-glass"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Age *</Label>
              <Input
                type="number"
                className="form-glass"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger className="form-glass">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">State/Region</Label>
              <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                <SelectTrigger className="form-glass">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="chennai">Chennai</SelectItem>
                  <SelectItem value="kolkata">Kolkata</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Profession</Label>
              <Select value={formData.profession} onValueChange={(value) => setFormData(prev => ({ ...prev, profession: value }))}>
                <SelectTrigger className="form-glass">
                  <SelectValue placeholder="Select profession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare">Healthcare Worker</SelectItem>
                  <SelectItem value="education">Education/Teaching</SelectItem>
                  <SelectItem value="travel">Travel/Tourism</SelectItem>
                  <SelectItem value="corporate">Corporate/Office</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Travel Frequency</Label>
              <Select value={formData.travel} onValueChange={(value) => setFormData(prev => ({ ...prev, travel: value }))}>
                <SelectTrigger className="form-glass">
                  <SelectValue placeholder="Select travel frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal/Local only</SelectItem>
                  <SelectItem value="domestic">Domestic travel</SelectItem>
                  <SelectItem value="international-occasional">International (Occasional)</SelectItem>
                  <SelectItem value="international-frequent">International (Frequent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Health Conditions */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="section-icon w-12 h-12 rounded-xl text-xl">
              🏥
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Health Conditions & Risk Factors
            </h3>
          </div>

          <p className="text-muted-foreground mb-6">
            Select any conditions that apply to you. This helps determine your vaccination priorities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthConditions.map((condition) => (
              <div key={condition.id} className="checkbox-item p-5 rounded-xl">
                <Checkbox
                  id={condition.id}
                  checked={formData.conditions.includes(condition.id)}
                  onCheckedChange={(checked) => handleConditionChange(condition.id, checked as boolean)}
                />
                <Label
                  htmlFor={condition.id}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {condition.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Vaccination History */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="section-icon w-12 h-12 rounded-xl text-xl">
              💉
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Vaccination History
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Last Tetanus/Tdap Vaccine</Label>
              <Select value={formData.lastVaccine} onValueChange={(value) => setFormData(prev => ({ ...prev, lastVaccine: value }))}>
                <SelectTrigger className="form-glass">
                  <SelectValue placeholder="When did you last receive Tdap?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1year">Within 1 year</SelectItem>
                  <SelectItem value="2-5years">2-5 years ago</SelectItem>
                  <SelectItem value="5-10years">5-10 years ago</SelectItem>
                  <SelectItem value="10+years">More than 10 years</SelectItem>
                  <SelectItem value="unknown">Don't remember/Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Last MMR Vaccine</Label>
              <Select value={formData.vaccineHistory} onValueChange={(value) => setFormData(prev => ({ ...prev, vaccineHistory: value }))}>
                <SelectTrigger className="form-glass">
                  <SelectValue placeholder="Childhood vaccination status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Complete as per schedule</SelectItem>
                  <SelectItem value="incomplete">Incomplete/Missed some</SelectItem>
                  <SelectItem value="unknown">Unknown/No records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          size="xl"
          className="w-full md:w-auto mx-auto block text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-secondary hover:shadow-xl"
        >
          {isLoading && <div className="loading-spinner mr-2 animate-spin" />}
          {isLoading ? 'Analyzing Your Health Profile...' : '🚀 Generate Complete Protection Plan'}
        </Button>
      </div>
    </div>
  )
}

function WellnessResults({ formData, onBack }: { formData: FormData; onBack: () => void }) {
  return (
    <div className="space-y-8">
      <div className="glass-card p-8 rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-3">
            Your Personalized Vaccination Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Based on your health profile and current guidelines
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl text-center border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-500 mb-2">3</div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Immediate Priority
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl text-center border-l-4 border-yellow-500">
            <div className="text-3xl font-bold text-yellow-500 mb-2">2</div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Consult Required
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl text-center border-l-4 border-primary">
            <div className="text-3xl font-bold text-primary mb-2">4</div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Future Planning
            </div>
          </div>
        </div>

        {/* Sample Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="vaccine-card p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Tdap (Tetanus-Diphtheria-Pertussis)
              </h3>
              <span className="priority-high text-2xl">🔴</span>
            </div>
            <div className="text-lg font-bold text-orange-600 mb-4">Immediate Priority</div>
            <p className="text-sm text-muted-foreground mb-4">
              Due for booster based on your last vaccination history. Essential protection against tetanus, diphtheria, and whooping cough.
            </p>
            <div className="space-y-3">
              <div className="glass-card p-4 rounded-xl transition-all duration-200 hover:bg-muted/20 hover:scale-105">
                <div className="text-primary font-semibold text-sm mb-1">📊 Effectiveness</div>
                <div className="text-xs text-muted-foreground">
                  95% protection against tetanus for 10+ years
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl transition-all duration-200 hover:bg-muted/20 hover:scale-105">
                <div className="text-yellow-600 font-semibold text-sm mb-1">💰 Cost</div>
                <div className="text-xs text-muted-foreground">
                  ₹500-800 (Government facilities) | ₹1,200-1,800 (Private)
                </div>
              </div>
            </div>
          </div>

          <div className="vaccine-card p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Annual Influenza Vaccine
              </h3>
              <span className="priority-high text-2xl">🔴</span>
            </div>
            <div className="text-lg font-bold text-yellow-600 mb-4">Annual - Current Season</div>
            <p className="text-sm text-muted-foreground mb-4">
              2024-25 season protection. India-specific strains recommended before monsoon season.
            </p>
            <div className="space-y-3">
              <div className="glass-card p-4 rounded-xl">
                <div className="text-primary font-semibold text-sm mb-1">📊 Effectiveness</div>
                <div className="text-xs text-muted-foreground">
                  40-60% reduction in flu risk when well-matched
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="text-yellow-600 font-semibold text-sm mb-1">💰 Cost</div>
                <div className="text-xs text-muted-foreground">
                  ₹500-1,000 (Quadrivalent) | Free at some govt centers
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 glass-card rounded-2xl border-l-4 border-primary">
          <h3 className="text-lg font-bold text-foreground mb-3">
            📋 Next Steps & Important Notes
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Consult with your healthcare provider before starting any new vaccines</p>
            <p>• Maintain a vaccination record card or digital tracker</p>
            <p>• Schedule annual flu shots before monsoon season (June-July)</p>
            <p>• Inform your doctor about any allergies or adverse reactions</p>
            <p>• Consider travel vaccines 4-6 weeks before international trips</p>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={onBack} variant="outline" size="lg" className="px-6">
            ← Back to Assessment
          </Button>
        </div>
      </div>
    </div>
  )
}
