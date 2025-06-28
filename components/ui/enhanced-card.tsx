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
          "relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-500 ease-out",
          glass && "border-white/20 backdrop-blur-sm bg-card/80",
          hover && "cursor-pointer",
          gradient && "bg-gradient-to-br from-card to-card/80",
          // Enhanced hover effects - classy and sophisticated
          hover && "hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]",
          // Subtle background shift on hover using proper theme colors
          hover && "hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/10 dark:hover:to-cyan-950/10",
          className
        )}
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          // Elegant border glow on hover using KARMASTAT theme colors
          boxShadow: isHovered && hover
            ? `0 20px 40px rgba(0, 0, 0, 0.1),
               0 0 0 1px hsl(var(--primary) / 0.15),
               inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            : undefined,
          borderColor: isHovered && hover
            ? 'hsl(var(--primary) / 0.25)'
            : undefined,
        }}
        {...props}
      >
        {/* Gradient overlay for hover effect - more subtle and elegant */}
        {gradient && isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 dark:from-blue-950/10 dark:to-cyan-950/10 rounded-lg transition-opacity duration-500" />
        )}

        {/* Replaced cheap glow with elegant accent border */}
        {glow && isHovered && (
          <>
            {/* Subtle top accent line using theme primary */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            {/* Refined inner highlight */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />
            {/* Elegant bottom shadow using theme colors */}
            <div className="absolute -bottom-2 left-4 right-4 h-2 bg-primary/10 blur-sm rounded-full" />
          </>
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
