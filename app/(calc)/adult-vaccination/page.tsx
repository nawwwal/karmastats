"use client"

import React, { useState } from 'react'
import { AdultVaccinationPage } from '@/components/adult-vaccination/AdultVaccinationPage'

export default function AdultVaccinationRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <AdultVaccinationPage />
    </div>
  )
}
