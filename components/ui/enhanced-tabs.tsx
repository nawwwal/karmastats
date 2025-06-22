"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const EnhancedTabs = TabsPrimitive.Root

const EnhancedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'default' | 'pills' | 'underline' | 'modern'
  }
>(({ className, variant = 'modern', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center text-muted-foreground",
      {
        'h-10 rounded-md bg-muted p-1': variant === 'default',
        'space-x-1': variant === 'pills',
        'border-b': variant === 'underline',
        'bg-gradient-to-r from-slate-100 to-slate-200 p-1 rounded-xl shadow-inner': variant === 'modern'
      },
      className
    )}
    {...props}
  />
))
EnhancedTabsList.displayName = TabsPrimitive.List.displayName

const EnhancedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: 'default' | 'pills' | 'underline' | 'modern'
  }
>(({ className, variant = 'modern', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      {
        'rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm': variant === 'default',
        'rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-primary/10': variant === 'pills',
        'border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary hover:text-foreground': variant === 'underline',
        'rounded-lg px-6 py-3 font-semibold transition-all duration-200 hover:bg-white/60 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:border-primary/20 data-[state=active]:border': variant === 'modern'
      },
      className
    )}
    {...props}
  />
))
EnhancedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const EnhancedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
EnhancedTabsContent.displayName = TabsPrimitive.Content.displayName

export { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent }
