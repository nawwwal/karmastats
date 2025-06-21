"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingParticlesProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: 'light' | 'medium' | 'heavy'
  speed?: 'slow' | 'normal' | 'fast'
  colors?: 'primary' | 'secondary' | 'rainbow' | 'monochrome'
  size?: 'small' | 'medium' | 'large' | 'mixed'
  interactive?: boolean
}

const FloatingParticles = React.forwardRef<HTMLDivElement, FloatingParticlesProps>(
  ({
    className,
    density = 'medium',
    speed = 'normal',
    colors = 'primary',
    size = 'mixed',
    interactive = false,
    children,
    ...props
  }, ref) => {
    const [particles, setParticles] = React.useState<Array<{
      id: number
      x: number
      y: number
      size: number
      color: string
      delay: number
      direction: number
    }>>([])

    const getParticleCount = () => {
      switch (density) {
        case 'light': return 15
        case 'medium': return 25
        case 'heavy': return 40
        default: return 25
      }
    }

    const getParticleColors = () => {
      switch (colors) {
        case 'primary':
          return ['rgba(249, 115, 22, 0.1)', 'rgba(249, 115, 22, 0.05)', 'rgba(251, 146, 60, 0.08)']
        case 'secondary':
          return ['rgba(234, 179, 8, 0.1)', 'rgba(234, 179, 8, 0.05)', 'rgba(253, 224, 71, 0.08)']
        case 'rainbow':
          return [
            'rgba(255, 107, 107, 0.1)', 'rgba(78, 205, 196, 0.1)', 'rgba(69, 183, 209, 0.1)',
            'rgba(150, 206, 180, 0.1)', 'rgba(254, 202, 87, 0.1)', 'rgba(255, 159, 243, 0.1)'
          ]
        case 'monochrome':
          return ['rgba(107, 114, 128, 0.1)', 'rgba(107, 114, 128, 0.05)', 'rgba(156, 163, 175, 0.08)']
        default:
          return ['rgba(249, 115, 22, 0.1)', 'rgba(234, 179, 8, 0.1)']
      }
    }

    const getParticleSize = () => {
      switch (size) {
        case 'small': return [1, 2]
        case 'medium': return [2, 4]
        case 'large': return [4, 8]
        case 'mixed': return [1, 6]
        default: return [1, 6]
      }
    }

    const getAnimationDuration = () => {
      switch (speed) {
        case 'slow': return [25, 35]
        case 'normal': return [15, 25]
        case 'fast': return [8, 15]
        default: return [15, 25]
      }
    }

    React.useEffect(() => {
      const particleCount = getParticleCount()
      const particleColors = getParticleColors()
      const [minSize, maxSize] = getParticleSize()
      const [minDuration, maxDuration] = getAnimationDuration()

      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (maxSize - minSize) + minSize,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        delay: Math.random() * 10,
        direction: Math.random() * 360,
      }))

      setParticles(newParticles)
    }, [density, colors, size, speed])

    const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
      if (!interactive) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * 100
      const y = (e.clientY - rect.top) / rect.height * 100

      setParticles(prev => prev.map(particle => {
        const distance = Math.sqrt(
          Math.pow(particle.x - x, 2) + Math.pow(particle.y - y, 2)
        )

        if (distance < 15) {
          const angle = Math.atan2(particle.y - y, particle.x - x)
          const force = (15 - distance) / 15
          return {
            ...particle,
            x: Math.max(0, Math.min(100, particle.x + Math.cos(angle) * force * 5)),
            y: Math.max(0, Math.min(100, particle.y + Math.sin(angle) * force * 5)),
          }
        }
        return particle
      }))
    }, [interactive])

    return (
      <div
        ref={ref}
        className={cn("floating-particles", className)}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {/* CSS-based particles (always present) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary particle layer */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.1) 2px, transparent 2px),
                radial-gradient(circle at 80% 20%, rgba(234, 179, 8, 0.1) 1px, transparent 1px),
                radial-gradient(circle at 40% 40%, rgba(251, 146, 60, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px, 30px 30px, 70px 70px',
              animation: `floatParticles ${speed === 'slow' ? '30s' : speed === 'fast' ? '15s' : '20s'} linear infinite`
            }}
          />

          {/* Secondary particle layer */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle at 70% 70%, rgba(249, 115, 22, 0.05) 3px, transparent 3px),
                radial-gradient(circle at 30% 30%, rgba(234, 179, 8, 0.05) 2px, transparent 2px)
              `,
              backgroundSize: '80px 80px, 60px 60px',
              animation: `floatParticles ${speed === 'slow' ? '35s' : speed === 'fast' ? '20s' : '25s'} linear infinite reverse`
            }}
          />
        </div>

        {/* Interactive JS particles */}
        {interactive && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full transition-all duration-300 ease-out"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  animationDelay: `${particle.delay}s`,
                  transform: `translate(-50%, -50%)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)

FloatingParticles.displayName = "FloatingParticles"

export { FloatingParticles }
