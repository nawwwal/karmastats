"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const EnhancedTabs = TabsPrimitive.Root

const EnhancedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'default' | 'pills' | 'underline' | 'glass'
    animated?: boolean
  }
>(({ className, variant = 'default', animated = true, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center text-muted-foreground relative",
      {
        'default': "rounded-md bg-muted p-1",
        'pills': "gap-2 p-1",
        'underline': "border-b border-border gap-4",
        'glass': "glass-card p-1 rounded-lg backdrop-blur-md",
      }[variant],
      animated && "transition-all duration-300",
      className
    )}
    {...props}
  />
))
EnhancedTabsList.displayName = TabsPrimitive.List.displayName

const EnhancedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: 'default' | 'pills' | 'underline' | 'glass'
    gradient?: boolean
    glow?: boolean
  }
>(({ className, variant = 'default', gradient = true, glow = false, ...props }, ref) => {
  const [isActive, setIsActive] = React.useState(false)

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative group",
        {
          'default': "rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          'pills': "rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-primary/20",
          'underline': "px-4 py-2 data-[state=active]:text-foreground tab-gradient",
          'glass': "rounded-md px-3 py-1.5 data-[state=active]:bg-white/20 data-[state=active]:text-foreground backdrop-blur-sm",
        }[variant],
        glow && "hover:glow-hover",
        gradient && variant === 'pills' && "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary",
        "hover:text-foreground hover:scale-105",
        className
      )}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      {...props}
    >
      {/* Gradient background for active state */}
      {gradient && variant !== 'underline' && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-md opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
      )}

      {/* Glow effect */}
      {glow && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl rounded-md opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
      )}

      {/* Content */}
      <span className="relative z-10 transition-all duration-200 group-hover:scale-105">
        {props.children}
      </span>

      {/* Animated indicator for pills */}
      {variant === 'pills' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-0 group-data-[state=active]:opacity-100 transition-all duration-300 scale-95 group-data-[state=active]:scale-100" />
      )}

      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden rounded-md">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </TabsPrimitive.Trigger>
  )
})
EnhancedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const EnhancedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    animated?: boolean
    delay?: number
  }
>(({ className, animated = true, delay = 0, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      animated && "animate-fadeInUp",
      delay > 0 && `animate-fadeIn-delay-${delay * 100}`,
      className
    )}
    {...props}
  />
))
EnhancedTabsContent.displayName = TabsPrimitive.Content.displayName

export { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent }
