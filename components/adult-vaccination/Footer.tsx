import React from 'react'

export function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-12 mt-16">
      <div className="container mx-auto px-6 text-center">
        <div className="text-lg text-slate-600 dark:text-slate-400 mb-3">
          Developed with ❤️ for Indian Healthcare Excellence
        </div>
        <div className="text-xl font-semibold text-gradient mb-6">
          🙏 सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः 🙏
        </div>

        <div className="max-w-4xl mx-auto text-sm text-slate-500 dark:text-slate-400 leading-relaxed space-y-4">
          <div>
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only and does not replace professional medical advice.
            Always consult with qualified healthcare providers for personalized vaccination recommendations. Vaccine availability,
            costs, and recommendations may vary. This platform follows WHO, CDC, API, and FOGSI guidelines current as of 2024.
          </div>

          <div>
            <strong>Data Sources:</strong> CDC/ACIP Guidelines 2024, WHO Recommendations, API Consensus 2024, FOGSI Guidelines,
            Indian Academy of Pediatrics, Association of Physicians of India, Geriatric Society of India.
          </div>
        </div>
      </div>
    </footer>
  )
}
