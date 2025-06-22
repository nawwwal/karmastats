"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  glow?: boolean
  hover?: boolean
  gradient?: boolean
  float?: 'gentle' | 'slow' | 'fast' | false
  delay?: number
  children: React.ReactNode
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({
    className,
    glass = false,
    glow = false,
    hover = true,
    gradient = false,
    float = false,
    delay = 0,
    children,
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)

    return (
      <div
        className={cn(
          "relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
          glass && "border-white/20 backdrop-blur-sm bg-card/80",
          hover && "hover:shadow-lg cursor-pointer transition-shadow",
          gradient && "bg-gradient-to-br from-card to-card/80",
          className
        )}
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Gradient overlay for hover effect */}
        {gradient && isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg transition-opacity duration-300" />
        )}

        {/* Glow effect background */}
        {glow && isHovered && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-xl rounded-lg" />
        )}

        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)

EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      "text-gradient",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
}
