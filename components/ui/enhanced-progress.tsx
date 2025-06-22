"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { karmaTheme } from '@/lib/theme';

export interface EnhancedProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  variant?: 'default' | 'gradient' | 'glow' | 'pulse' | 'shimmer'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  animated?: boolean
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

const EnhancedProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  EnhancedProgressProps
>(({
  className,
  value = 0,
  variant = 'default',
  size = 'md',
  showValue = false,
  animated = true,
  color = 'primary',
  ...props
}, ref) => {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayValue(value)
    }
  }, [value, animated])

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'from-primary to-primary/80'
      case 'secondary':
        return 'from-secondary to-secondary/80'
      case 'success':
        return 'from-green-500 to-emerald-500'
      case 'warning':
        return 'from-yellow-500 to-orange-500'
      case 'error':
        return 'from-red-500 to-rose-500'
      default:
        return 'from-primary to-primary/80'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2'
      case 'md':
        return 'h-3'
      case 'lg':
        return 'h-4'
      default:
        return 'h-3'
    }
  }

  const getVariantClasses = () => {
    const colorGradient = getColorClasses()

    switch (variant) {
      case 'gradient':
        return `bg-gradient-to-r ${colorGradient}`
      case 'glow':
        return `bg-gradient-to-r ${colorGradient} progress-glow`
      case 'pulse':
        return `bg-gradient-to-r ${colorGradient} animate-pulse`
      case 'shimmer':
        return `bg-gradient-to-r ${colorGradient} animate-shimmer`
      default:
        return `bg-primary`
    }
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 70) {
      return karmaTheme.colors.primary.DEFAULT // #FF8C42
    } else if (percentage >= 40) {
      return karmaTheme.colors.secondary.DEFAULT // #2C5282
    } else {
      return karmaTheme.colors.warning.DEFAULT // #D69E2E
    }
  }

  const getGlowColor = (percentage: number): string => {
    if (percentage >= 70) {
      return karmaTheme.colors.primary.DEFAULT // #FF8C42
    } else if (percentage >= 40) {
      return karmaTheme.colors.secondary.DEFAULT // #2C5282
    } else {
      return karmaTheme.colors.warning.DEFAULT // #D69E2E
    }
  }

  return (
    <div className="space-y-2">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-muted/30 backdrop-blur-sm",
          getSizeClasses(),
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-1000 ease-out relative overflow-hidden",
            getVariantClasses()
          )}
          style={{
            transform: `translateX(-${100 - (displayValue || 0)}%)`,
            transition: animated ? 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
        >
          {/* Shimmer effect overlay */}
          {variant === 'shimmer' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full animate-shimmer" />
          )}

          {/* Pulse effect overlay */}
          {variant === 'pulse' && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </ProgressPrimitive.Indicator>

        {/* Glow effect background */}
        {variant === 'glow' && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
        )}
      </ProgressPrimitive.Root>

      {/* Value display */}
      {showValue && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium">
            {formatNumber(displayValue || 0)}%
          </span>
        </div>
      )}
    </div>
  )
})

EnhancedProgress.displayName = "EnhancedProgress"

// Circular progress variant
export interface CircularProgressProps {
  value?: number
  size?: number
  strokeWidth?: number
  variant?: 'default' | 'gradient' | 'glow'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  showValue?: boolean
  children?: React.ReactNode
}

const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps & React.HTMLAttributes<HTMLDivElement>
>(({
  value = 0,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  color = 'primary',
  showValue = false,
  children,
  className,
  ...props
}, ref) => {
  const [displayValue, setDisplayValue] = React.useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * Math.PI * 2
  const offset = circumference - (displayValue / 100) * circumference

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  const getStrokeColor = () => {
    switch (color) {
      case 'primary':
        return karmaTheme.colors.primary.DEFAULT // #FF8C42
      case 'secondary':
        return karmaTheme.colors.secondary.DEFAULT // #2C5282
      case 'success':
        return karmaTheme.colors.success.DEFAULT // #38A169
      case 'warning':
        return karmaTheme.colors.warning.DEFAULT // #D69E2E
      case 'error':
        return karmaTheme.colors.error.DEFAULT // #E53E3E
      default:
        return karmaTheme.colors.primary.DEFAULT // #FF8C42
    }
  }

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-1000 ease-out",
            variant === 'glow' && "drop-shadow-lg filter-none",
            variant === 'gradient' && "opacity-90"
          )}
          style={{
            filter: variant === 'glow' ? `drop-shadow(0 0 8px ${getStrokeColor()}40)` : 'none'
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <span className="text-lg font-semibold text-foreground">
            {formatNumber(displayValue)}%
          </span>
        ))}
      </div>
    </div>
  )
})

CircularProgress.displayName = "CircularProgress"

const formatNumber = (value: number) => {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
};

export { EnhancedProgress, CircularProgress }
