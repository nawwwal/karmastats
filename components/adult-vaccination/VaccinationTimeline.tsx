import React from 'react'

export function VaccinationTimeline() {
  const timelineItems = [
    {
      marker: 'NOW',
      age: 'Age 25 - Immediate Actions',
      vaccines: [
        { name: 'Tdap Booster', status: 'due', description: 'Last dose >10 years ago' },
        { name: 'Annual Flu Shot', status: 'due', description: '2024-25 season protection' },
        { name: 'HPV Series', status: 'recommended', description: 'If not completed by age 26' }
      ]
    },
    {
      marker: '3M',
      age: 'Next 3 Months - Priority Vaccines',
      vaccines: [
        { name: 'Hepatitis B Series', status: 'recommended', description: 'If not immune from childhood' },
        { name: 'MMR Catch-up', status: 'recommended', description: 'If no documented immunity' },
        { name: 'Varicella', status: 'recommended', description: 'If no history of chickenpox' }
      ]
    },
    {
      marker: '1Y',
      age: 'Next 12 Months - Complete Series',
      vaccines: [
        { name: 'Hepatitis A Series', status: 'recommended', description: 'Complete 2-dose series' },
        { name: 'Meningococcal ACWY', status: 'future', description: 'If high-risk or travel' },
        { name: 'Annual Flu (Next Year)', status: 'future', description: '2025-26 season' }
      ]
    },
    {
      marker: '50',
      age: 'Age 50 Milestones',
      vaccines: [
        { name: 'Shingles Vaccine', status: 'future', description: '2-dose Shingrix series' },
        { name: 'Pneumococcal PCV20', status: 'future', description: 'Enhanced pneumonia protection' },
        { name: 'Enhanced Screening', status: 'future', description: 'Cancer screenings + vaccines' }
      ]
    },
    {
      marker: '65',
      age: 'Senior Health Optimization',
      vaccines: [
        { name: 'High-Dose Influenza', status: 'future', description: '4x stronger senior formula' },
        { name: 'RSV Vaccine', status: 'future', description: 'New respiratory protection' },
        { name: 'PPSV23 Completion', status: 'future', description: 'If received PCV15 earlier' }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gradient mb-4">
            Your Personalized Vaccination Timeline
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Life-stage based vaccination planning for optimal health protection
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {timelineItems.map((item, index) => (
            <div key={index} className="flex mb-12 relative">
              {/* Timeline Line */}
              {index < timelineItems.length - 1 && (
                <div className="absolute left-12 top-24 w-0.5 h-full bg-slate-200 dark:bg-slate-700"></div>
              )}

              {/* Timeline Marker */}
              <div className="timeline-marker w-24 h-24 rounded-full flex-shrink-0 text-white font-bold text-lg">
                {item.marker}
              </div>

              {/* Timeline Content */}
              <div className="flex-1 ml-8">
                <div className="glass-card p-6 rounded-2xl transition-all duration-200 hover:bg-white/20 hover:scale-105">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {item.age}
                  </h3>

                  <div className="space-y-3">
                    {item.vaccines.map((vaccine, vIndex) => (
                      <div key={vIndex} className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {vaccine.name}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {vaccine.description}
                          </div>
                        </div>
                        <span className={`status-${vaccine.status} ml-4`}>
                          {vaccine.status === 'due' && 'Due Now'}
                          {vaccine.status === 'recommended' && 'Recommended'}
                          {vaccine.status === 'future' && 'Future Planning'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-primary mt-12 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            💡 Timeline Planning Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Scheduling Strategy:</h4>
              <ul className="space-y-1">
                <li>• Plan vaccines around travel dates</li>
                <li>• Combine with annual check-ups</li>
                <li>• Set calendar reminders for boosters</li>
                <li>• Allow 2-4 weeks between live vaccines</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Record Keeping:</h4>
              <ul className="space-y-1">
                <li>• Maintain digital vaccination record</li>
                <li>• Request copies from all providers</li>
                <li>• Note lot numbers for tracking</li>
                <li>• Share timeline with family doctor</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
