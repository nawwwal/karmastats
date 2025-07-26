import React from 'react'

export function HeroSection() {
  return (
    <section className="hero-gradient min-h-[70vh] flex items-center justify-center relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'><path d='M 10 0 L 0 0 0 10' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='0.5'/></pattern></defs><rect width='100' height='100' fill='url(%23grid)'/></svg>")`,
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          KARMASTAT
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          ADULT VACCINATION EXCELLENCE
        </h2>
        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 font-medium">
          Complete Health Protection • Evidence-Based Medicine • Indian Healthcare Standards
        </p>

        {/* Hero Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="glass-card px-6 py-4 rounded-2xl">
            <span className="block text-2xl font-bold text-slate-900 dark:text-white">25+</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Adult Vaccines</span>
          </div>
          <div className="glass-card px-6 py-4 rounded-2xl">
            <span className="block text-2xl font-bold text-slate-900 dark:text-white">99%</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Protection Rate</span>
          </div>
          <div className="glass-card px-6 py-4 rounded-2xl">
            <span className="block text-2xl font-bold text-slate-900 dark:text-white">CDC</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">2024 Guidelines</span>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn-primary px-7 py-3 rounded-full text-base font-semibold flex items-center gap-2">
            🎯 Start Health Assessment
          </button>
          <button className="btn-glass px-7 py-3 rounded-full text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            💉 Explore All Vaccines
          </button>
          <button className="btn-glass px-7 py-3 rounded-full text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            📅 My Vaccination Timeline
          </button>
        </div>
      </div>
    </section>
  )
}
