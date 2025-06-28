"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Percent, Hash, Calculator, Users, Target, Clock } from "lucide-react"

export interface EnhancedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  description?: string
  maxLength?: number
  showCounter?: boolean
  glass?: boolean
  glow?: boolean
  example?: string
  tip?: string
  icon?: React.ReactNode
  error?: string
  hasError?: boolean
  variant?: 'default' | 'percentage' | 'number' | 'sample-size' | 'probability' | 'time' | 'currency'
  unit?: string
  contextualPlaceholder?: string
  size?: 'sm' | 'md' | 'lg'
}

const getVariantConfig = (variant: string) => {
  switch (variant) {
    case 'percentage':
      return {
        icon: <Percent className="h-4 w-4" />,
        suffix: '%',
        type: 'number',
        min: 0,
        max: 100,
        step: 0.1
      }
    case 'number':
      return {
        icon: <Hash className="h-4 w-4" />,
        type: 'number',
        step: 0.01
      }
    case 'sample-size':
      return {
        icon: <Users className="h-4 w-4" />,
        type: 'number',
        min: 1,
        step: 1
      }
    case 'probability':
      return {
        icon: <Target className="h-4 w-4" />,
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01
      }
    case 'time':
      return {
        icon: <Clock className="h-4 w-4" />,
        type: 'number',
        min: 0,
        step: 0.1
      }
    case 'currency':
      return {
        prefix: '$',
        type: 'number',
        min: 0,
        step: 0.01
      }
    default:
      return {
        type: 'text'
      }
  }
}

const getSizeClasses = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        label: 'text-sm font-medium',
        input: 'h-10 text-sm px-3',
        description: 'text-xs'
      }
    case 'lg':
      return {
        label: 'text-lg font-semibold',
        input: 'h-14 text-lg px-4',
        description: 'text-sm'
      }
    default: // md
      return {
        label: 'text-base font-semibold',
        input: 'h-12 text-base px-4',
        description: 'text-sm'
      }
  }
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    className,
    type,
    label,
    description,
    maxLength,
    showCounter = false,
    glass = false,
    glow = false,
    example,
    tip,
    icon,
    error,
    hasError = false,
    value,
    onChange,
    variant = 'default',
    unit,
    contextualPlaceholder,
    size = 'md',
    ...props
  }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const currentLength = value?.toString().length || 0

    const variantConfig = getVariantConfig(variant)
    const sizeClasses = getSizeClasses(size)

    const finalIcon = icon || variantConfig.icon
    const finalType = type || variantConfig.type || 'text'
    const finalPlaceholder = contextualPlaceholder || props.placeholder

    return (
      <div className="space-y-3">
        {label && (
          <div className="space-y-1">
            <Label className={cn(
              sizeClasses.label,
              "text-foreground leading-none",
              (error || hasError) && "text-destructive"
            )}>
              {label}
              {unit && <span className="text-muted-foreground ml-1">({unit})</span>}
            </Label>
            {description && (
              <p className={cn(sizeClasses.description, "text-muted-foreground leading-relaxed")}>
                {description}
              </p>
            )}
          </div>
        )}

        <div className={cn(
          "relative transition-all duration-300",
          "input-enhanced",
          focused && "scale-[1.01]",
          error && "animate-pulse"
        )}>
          <div className="relative">
            {variantConfig.prefix && (
              <div className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium",
                sizeClasses.input.includes('text-lg') ? 'text-lg' : 'text-base'
              )}>
                {variantConfig.prefix}
              </div>
            )}

            {finalIcon && (
              <div className={cn(
                "absolute top-1/2 transform -translate-y-1/2 text-muted-foreground",
                variantConfig.prefix ? "left-8" : "left-3"
              )}>
                {finalIcon}
              </div>
            )}

            <Input
              type={finalType}
              className={cn(
                "transition-all duration-300 border-2 bg-background/50 hover:bg-background/80 focus:bg-background",
                "focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
                "placeholder:text-muted-foreground/60 placeholder:font-normal",
                sizeClasses.input,
                glass && "backdrop-blur-sm bg-background/30",
                glow && focused && "shadow-lg shadow-primary/20",
                (finalIcon || variantConfig.prefix) && (variantConfig.prefix ? "pl-12" : "pl-10"),
                (variantConfig.suffix || showCounter && maxLength) && "pr-12",
                (error || hasError) && "border-destructive/50 focus:border-destructive focus:ring-destructive/20",
                className
              )}
              ref={ref}
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={finalPlaceholder}
              maxLength={maxLength}
              min={variantConfig.min}
              max={variantConfig.max}
              step={variantConfig.step}
              {...props}
            />

            {variantConfig.suffix && (
              <div className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium",
                sizeClasses.input.includes('text-lg') ? 'text-lg' : 'text-base'
              )}>
                {variantConfig.suffix}
              </div>
            )}

            {showCounter && maxLength && (
              <div className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium",
                currentLength > maxLength * 0.8 ? "text-warning" : "text-muted-foreground",
                currentLength >= maxLength && "text-destructive"
              )}>
                {currentLength}/{maxLength}
              </div>
            )}
          </div>

          {focused && glow && (
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl rounded-lg" />
          )}
        </div>

        {example && (
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1.5 bg-muted/50 rounded-md font-medium border",
              sizeClasses.description
            )}>
              💡 Example: {example}
            </span>
          </div>
        )}

        {tip && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className={cn(sizeClasses.description, "leading-relaxed")}>{tip}</span>
          </div>
        )}

        {error && (
          <div className={cn(
            "text-destructive font-medium animate-slideInUp flex items-center gap-2",
            sizeClasses.description
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }
