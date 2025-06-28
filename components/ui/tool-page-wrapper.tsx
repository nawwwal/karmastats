"use client"

import type React from "react"

import type { ReactNode } from "react"
import { ChevronLeft, Calculator, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDevice } from "@/hooks/use-mobile"
import { haptics } from "@/lib/haptics"
import { cn } from "@/lib/utils"

export interface ToolPageWrapperProps {
  title: string
  description: string
  backHref?: string
  backLabel?: string
  icon?: React.ComponentType<{ className?: string }>
  onReset?: () => void
  children: ReactNode
  lastModified?: string
  layout?: "single-column" | "side-by-side"
  resultsSection?: ReactNode
}

export function ToolPageWrapper({
  title,
  description,
  backHref,
  backLabel,
  icon: Icon = Calculator,
  onReset,
  children,
  lastModified,
  layout = "single-column",
  resultsSection,
}: ToolPageWrapperProps) {
  const { isMobile, touchDevice } = useDevice()

  const handleResetClick = async () => {
    if (touchDevice) {
      await haptics.light()
    }
    onReset?.()
  }

  const handleBackClick = async () => {
    if (touchDevice) {
      await haptics.selection()
    }
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20",
        // Mobile: adjust for bottom navigation
        isMobile && "pb-safe-area-inset-bottom",
      )}
    >
      {/* Header - Mobile optimized */}
      <div
        className={cn(
          "sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40",
          // Mobile: add safe area for notched devices
          isMobile && "pt-safe-area-inset-top",
        )}
      >
        <div
          className={cn(
            "w-full max-w-none mx-auto",
            // Mobile: optimized padding
            isMobile ? "px-4" : "px-4 sm:px-6 lg:px-8 xl:px-12",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between",
              // Mobile: reduced height for more content space
              isMobile ? "h-14" : "h-16 sm:h-18",
            )}
          >
            <div className="flex items-center gap-4">
              {/* Back button for mobile */}
              {isMobile && backHref && (
                <Link
                  href={backHref}
                  onClick={handleBackClick}
                  className={cn(
                    "p-2 rounded-xl bg-background/50 border border-border/50",
                    "touch-manipulation active:scale-95 transition-transform",
                    "hover:bg-accent/50",
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              )}

              {/* Icon and title */}
              {Icon && (
                <div
                  className={cn(
                    "p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary",
                    // Mobile: slightly smaller icon container
                    isMobile && "p-2",
                  )}
                >
                  <Icon className={cn("h-5 w-5", isMobile && "h-4 w-4")} />
                </div>
              )}
              <div>
                <h1
                  className={cn(
                    "font-bold text-foreground tracking-tight",
                    // Mobile: responsive text sizing
                    isMobile ? "text-lg" : "text-xl sm:text-2xl",
                  )}
                >
                  {title}
                </h1>
                {/* Description hidden on mobile in header, shown below */}
                {!isMobile && <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">{description}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onReset && (
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  onClick={handleResetClick}
                  className={cn(
                    "touch-manipulation active:scale-95 transition-transform",
                    isMobile ? "h-10 px-3" : "hidden sm:flex items-center gap-2",
                  )}
                >
                  <RefreshCw className="h-4 w-4" />
                  {!isMobile && "Reset"}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile: Show description below header */}
          {isMobile && (
            <div className="pb-3 pt-1">
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Mobile optimized */}
      <div
        className={cn(
          "w-full max-w-none mx-auto",
          // Mobile: optimized padding and spacing
          isMobile ? "px-4 py-4" : "px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8",
        )}
      >
        {layout === "single-column" ? (
          <div
            className={cn(
              "w-full mx-auto space-y-6",
              // Mobile: full width, desktop: constrained
              !isMobile && "max-w-6xl",
              isMobile && "space-y-4",
            )}
          >
            {children}
          </div>
        ) : (
          <div
            className={cn(
              "gap-8 xl:gap-12",
              // Mobile: single column, desktop: two columns
              isMobile ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2",
            )}
          >
            <div className={cn(isMobile ? "space-y-4" : "space-y-6")}>{children}</div>
            {resultsSection && <div className={cn(isMobile ? "space-y-4" : "space-y-6")}>{resultsSection}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
