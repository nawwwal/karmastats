"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // Check for saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark'
    setTheme(savedTheme)

    if (savedTheme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [])

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    if (newTheme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }

  return (
    <div className="theme-toggle">
      <Button
        size="sm"
        variant={theme === 'dark' ? 'default' : 'ghost'}
        onClick={() => toggleTheme('dark')}
        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
      >
        🌙 Dark
      </Button>
      <Button
        size="sm"
        variant={theme === 'light' ? 'default' : 'ghost'}
        onClick={() => toggleTheme('light')}
        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
      >
        ☀️ Light
      </Button>
    </div>
  )
}
