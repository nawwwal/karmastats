"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  maxLength?: number
  showCounter?: boolean
  glass?: boolean
  glow?: boolean
  example?: string
  tip?: string
  icon?: React.ReactNode
  error?: string
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    className,
    type,
    label,
    maxLength,
    showCounter = false,
    glass = false,
    glow = false,
    example,
    tip,
    icon,
    error,
    value,
    onChange,
    ...props
  }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const currentLength = value?.toString().length || 0

    return (
      <div className="space-y-2">
        {label && (
          <Label className="text-sm font-medium text-foreground">
            {label}
          </Label>
        )}

        <div className={cn(
          "relative transition-all duration-300",
          "input-enhanced",
          focused && "scale-[1.02]"
        )}>
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {icon}
              </div>
            )}

            <Input
              type={type}
              className={cn(
                "transition-all duration-300 pr-4",
                glass && "glass-input border-white/30",
                glow && focused && "shadow-glow ring-2 ring-primary/20",
                icon && "pl-10",
                showCounter && maxLength && "pr-16",
                error && "border-destructive ring-destructive/20",
                className
              )}
              ref={ref}
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={maxLength}
              {...props}
            />

            {showCounter && maxLength && (
              <div className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 text-xs",
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-muted/50 rounded text-xs">
              Example: {example}
            </span>
          </div>
        )}

        {tip && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>{tip}</span>
          </div>
        )}

        {error && (
          <div className="text-xs text-destructive animate-slideInUp">
            {error}
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }
