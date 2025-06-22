"use client"

import { ReactNode } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { HelpCircle, Info } from "lucide-react"

export interface FieldPopoverProps {
  children: ReactNode
  title?: string
  content?: string
  examples?: string[]
  validRange?: {
    min?: number | string
    max?: number | string
  }
  className?: string
  iconVariant?: "help" | "info"
  side?: "top" | "bottom" | "left" | "right"
}

export function FieldPopover({
  children,
  title,
  content,
  examples,
  validRange,
  className,
  iconVariant = "help",
  side = "top"
}: FieldPopoverProps) {
  return (
    <div className="relative group">
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative">
            {children}
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {iconVariant === "help" ? (
                <HelpCircle className="h-4 w-4 text-primary hover:text-primary/80 cursor-help" />
              ) : (
                <Info className="h-4 w-4 text-primary hover:text-primary/80 cursor-help" />
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          side={side}
          className={cn(
            "w-80 p-4 bg-popover/95 backdrop-blur-sm border border-primary/20 shadow-lg",
            "text-popover-foreground",
            className
          )}
        >
          <div className="space-y-3">
            {title && (
              <div className="font-semibold text-sm text-primary">
                {title}
              </div>
            )}

            {content && (
              <div className="text-sm text-muted-foreground leading-relaxed">
                {content}
              </div>
            )}

            {validRange && (
              <div className="text-xs px-2 py-1 bg-secondary/10 rounded border border-secondary/20">
                <span className="font-medium text-secondary">Valid range:</span>{" "}
                {validRange.min !== undefined && `${validRange.min}`}
                {validRange.min !== undefined && validRange.max !== undefined && " - "}
                {validRange.max !== undefined && `${validRange.max}`}
              </div>
            )}

            {examples && examples.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-primary">Examples:</div>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {examples.map((example, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-primary/60 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Convenience wrapper for form fields
interface FormFieldWithPopoverProps extends FieldPopoverProps {
  children: ReactNode
}

export function FormFieldWithPopover(props: FormFieldWithPopoverProps) {
  return <FieldPopover {...props} />
}
