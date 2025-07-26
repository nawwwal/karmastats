import React from 'react'

export function RiskBasedProtection() {
  const riskCategories = [
    {
      title: 'Diabetes Mellitus',
      icon: '🩸',
      description: 'Enhanced vaccination schedule for diabetic patients with increased infection risk.',
      vaccines: [
        'Annual Influenza (High-dose if >65)',
        'Pneumococcal PCV20 + PPSV23',
        'Hepatitis B (if not immune)',
        'COVID-19 (updated boosters)',
        'Tdap every 10 years'
      ],
      additional: [
        'Monitor blood sugar around vaccination',
        'Increased risk of severe infections',
        'Annual foot exam and flu shot together',
        'Consider RSV vaccine if >60 years'
      ]
    },
    {
      title: 'Healthcare Workers',
      icon: '👩‍⚕️',
      description: 'Comprehensive occupational health protection for medical professionals.',
      vaccines: [
        'Annual Influenza (mandatory)',
        'Hepatitis B series + titer check',
        'MMR (if not immune)',
        'Varicella (if no history)',
        'Tdap every 10 years',
        'COVID-19 (all recommended boosters)'
      ],
      additional: [
        'Annual TB screening',
        'Fit testing for N95 masks',
        'Post-exposure prophylaxis protocols',
        'Meningococcal for lab workers'
      ]
    },
    {
      title: 'Immunocompromised Patients',
      icon: '🛡️',
      description: 'Special vaccination considerations for patients with weakened immune systems.',
      vaccines: [
        'Inactivated vaccines only (NO live vaccines)',
        'High-dose influenza annually',
        'Pneumococcal PCV20 + PPSV23',
        'Hepatitis A & B series',
        'HPV (if age appropriate)',
        'Meningococcal ACWY + B'
      ],
      additional: [
        'Avoid live vaccines (MMR, Varicella, Zoster live)',
        'May need additional doses',
        'Check with immunology specialist',
        'Family members should be vaccinated'
      ]
    },
    {
      title: 'Chronic Heart/Lung Disease',
      icon: '🫁',
      description: 'Respiratory protection for patients with cardiovascular or pulmonary conditions.',
      vaccines: [
        'Annual High-dose Influenza',
        'Pneumococcal PCV20',
        'RSV vaccine (if ≥60 years)',
        'COVID-19 updated boosters',
        'Tdap every 10 years'
      ],
      additional: [
        'Extra protection during air pollution',
        'Pulmonary rehabilitation coordination',
        'Cardiac clearance if needed',
        'Monitor for respiratory symptoms post-vaccination'
      ]
    },
    {
      title: 'Pregnancy & Family Planning',
      icon: '🤱',
      description: 'Safe vaccination during pregnancy and preconception planning.',
      vaccines: [
        'Tdap in each pregnancy (27-36 weeks)',
        'Annual Influenza',
        'COVID-19 (all recommended doses)',
        'RSV (32-36 weeks) - NEW 2024'
      ],
      additional: [
        'No live vaccines during pregnancy',
        'MMR & Varicella before conception',
        'Partner should be up to date',
        'Discuss with obstetrician'
      ]
    },
    {
      title: 'Elderly & Long-term Care',
      icon: '👴',
      description: 'Age-specific enhanced protection for adults 65+ and care facility residents.',
      vaccines: [
        'High-dose Annual Influenza',
        'Pneumococcal PCV20 + PPSV23',
        'Shingles (Zoster) 2-dose series',
        'RSV vaccine (≥60 years)',
        'COVID-19 updated boosters',
        'Tdap every 10 years'
      ],
      additional: [
        'Medication interaction review',
        'Fall risk assessment',
        'Nutritional status optimization',
        'Family education on symptoms'
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gradient mb-4">
          Risk-Based Vaccination Strategies
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Personalized protection based on medical conditions, occupation, and lifestyle factors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {riskCategories.map((category, index) => (
          <div key={index} className="vaccine-card p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="section-icon w-16 h-16 rounded-2xl text-2xl">
                {category.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {category.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {category.description}
            </p>

            <div className="space-y-6">
              <div className="glass-card p-5 rounded-xl border-l-4 border-green-500">
                <div className="text-green-600 font-semibold text-sm mb-3 flex items-center gap-2">
                  💉 Recommended Vaccines
                </div>
                <ul className="space-y-2">
                  {category.vaccines.map((vaccine, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-green-500 mt-1">✨</span>
                      {vaccine}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-5 rounded-xl border-l-4 border-primary">
                <div className="text-primary font-semibold text-sm mb-3 flex items-center gap-2">
                  📋 Additional Considerations
                </div>
                <ul className="space-y-2">
                  {category.additional.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 rounded-3xl border-l-4 border-orange-500 mt-12">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          Important Safety Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Before Vaccination:</h4>
            <ul className="space-y-1">
              <li>• Inform about all medical conditions</li>
              <li>• List all current medications</li>
              <li>• Mention any previous vaccine reactions</li>
              <li>• Discuss pregnancy plans</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">After Vaccination:</h4>
            <ul className="space-y-1">
              <li>• Stay for 15-20 minutes observation</li>
              <li>• Apply ice for soreness</li>
              <li>• Take acetaminophen for fever</li>
              <li>• Contact doctor for severe reactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
