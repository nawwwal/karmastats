"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 press-feedback",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl glow-primary font-semibold",
        glass: "glass-card text-foreground hover:text-foreground border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-xl backdrop-blur-md bg-background/60 hover:bg-background/80",
        glow: "bg-primary text-white shadow-lg glow-primary hover:glow-hover transition-all duration-400 font-medium",
        shimmer: "bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] text-white hover:animate-shimmer shadow-lg hover:shadow-xl font-semibold"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        hover: "hover:scale-102 hover:-translate-y-0.5",
        bounce: "hover:animate-bounce",
        pulse: "hover:animate-pulse",
        wiggle: "hover:animate-wiggle",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  loading?: boolean
  loadingText?: string
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    className,
    variant,
    size,
    animation,
    asChild = false,
    icon,
    iconPosition = "left",
    loading = false,
    loadingText = "Loading...",
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    const isDisabled = disabled || loading

    const renderContent = () => {
      if (loading) {
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            {loadingText}
          </>
        )
      }

      if (icon && iconPosition === "left") {
        return (
          <>
            <span className="flex-shrink-0">{icon}</span>
            {children}
          </>
        )
      }

      if (icon && iconPosition === "right") {
        return (
          <>
            {children}
            <span className="flex-shrink-0">{icon}</span>
          </>
        )
      }

      return children
    }

    return (
      <Comp
        className={cn(
          enhancedButtonVariants({ variant, size, animation, className }),
          loading && "cursor-not-allowed",
          // Enhanced focus styles for better accessibility
          "focus:ring-primary/50 focus:ring-offset-2",
          // Better contrast adjustments
          variant === "glass" && "text-foreground hover:text-foreground",
          variant === "outline" && "text-foreground hover:text-foreground",
          variant === "gradient" && "text-white hover:text-white",
          variant === "shimmer" && "text-white hover:text-white",
          variant === "glow" && "text-white hover:text-white"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {renderContent()}
      </Comp>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, enhancedButtonVariants }
