"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { EnhancedInput } from "@/components/ui/enhanced-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Control, FieldPath, FieldValues } from "react-hook-form"

interface StatisticalFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  fieldType: 'percentage' | 'sample-size' | 'power' | 'alpha' | 'effect-size' | 'ratio' | 'rate' | 'continuous' | 'select'
  calculatorType?: 'clinical-trial' | 'diagnostic' | 'comparative' | 'survival' | 't-test' | 'regression' | 'cross-sectional'
  selectOptions?: { value: string; label: string; description?: string }[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

// Contextual placeholders and examples for different field types and calculators
const getFieldConfig = (fieldType: string, calculatorType?: string) => {
  const configs = {
    'percentage': {
      'clinical-trial': {
        placeholder: "e.g., 25.0 (typical event rate)",
        example: "25.0 for 25% event rate",
        description: "Expected percentage of participants experiencing the outcome"
      },
      'diagnostic': {
        placeholder: "e.g., 85.0 (high sensitivity)",
        example: "85.0 for good diagnostic accuracy",
        description: "Percentage accuracy expected from the diagnostic test"
      },
      'comparative': {
        placeholder: "e.g., 15.0 (disease prevalence)",
        example: "15.0 for moderate prevalence",
        description: "Percentage of population with the condition"
      },
      'default': {
        placeholder: "e.g., 50.0",
        example: "50.0 for 50%",
        description: "Enter percentage value"
      }
    },
    'sample-size': {
      'clinical-trial': {
        placeholder: "e.g., 400 (per group)",
        example: "400 participants per treatment arm",
        description: "Number of participants needed in each study group"
      },
      'diagnostic': {
        placeholder: "e.g., 150 (total cases)",
        example: "150 patients for validation study",
        description: "Total number of patients needed for test validation"
      },
      'default': {
        placeholder: "e.g., 100",
        example: "100 participants",
        description: "Number of study participants"
      }
    },
    'power': {
      'default': {
        placeholder: "80 (recommended minimum)",
        example: "80 for 80% power (standard)",
        description: "Probability of detecting a true effect (80-90% recommended)"
      }
    },
    'alpha': {
      'default': {
        placeholder: "5 (standard significance)",
        example: "5 for p < 0.05 (standard)",
        description: "Type I error rate - probability of false positive (typically 5%)"
      }
    },
    'effect-size': {
      'clinical-trial': {
        placeholder: "e.g., 10.0 (meaningful difference)",
        example: "10.0 for clinically meaningful improvement",
        description: "Minimum clinically important difference between groups"
      },
      'diagnostic': {
        placeholder: "e.g., 0.15 (moderate improvement)",
        example: "0.15 for 15% improvement in accuracy",
        description: "Expected improvement over existing methods"
      },
      'default': {
        placeholder: "e.g., 0.5 (medium effect)",
        example: "0.5 for medium effect size",
        description: "Size of the effect you want to detect"
      }
    },
    'ratio': {
      'default': {
        placeholder: "1 (equal allocation)",
        example: "1 for 1:1 randomization",
        description: "Ratio of participants between groups (1 = equal groups)"
      }
    },
    'rate': {
      'survival': {
        placeholder: "e.g., 0.05 (5% per year)",
        example: "0.05 for 5% annual event rate",
        description: "Rate of events per unit time (annual rate typical)"
      },
      'default': {
        placeholder: "e.g., 0.10",
        example: "0.10 for 10% rate",
        description: "Rate of occurrence"
      }
    },
    'continuous': {
      'default': {
        placeholder: "Enter numeric value",
        example: "Depends on measurement scale",
        description: "Continuous measurement value"
      }
    }
  }

  return configs[fieldType as keyof typeof configs]?.[calculatorType || 'default'] ||
         configs[fieldType as keyof typeof configs]?.['default'] ||
         { placeholder: "Enter value", example: "Contextual example", description: "Field description" }
}

// Realistic default values for different field types and calculators
const getRealisticDefault = (fieldType: string, calculatorType?: string) => {
  const defaults = {
    'percentage': {
      'clinical-trial': 65, // Typical clinical success rate
      'diagnostic': 85, // Good diagnostic accuracy
      'comparative': 15, // Common disease prevalence
      'default': 50
    },
    'sample-size': {
      'clinical-trial': 400, // Typical clinical trial size per arm
      'diagnostic': 150, // Diagnostic validation study
      'comparative': 200, // Epidemiological study
      'default': 100
    },
    'power': { 'default': 80 }, // Standard 80% power
    'alpha': { 'default': 5 }, // Standard 5% alpha
    'effect-size': {
      'clinical-trial': 10, // 10% difference
      'diagnostic': 0.15, // 15% improvement
      't-test': 0.5, // Cohen's d medium effect
      'default': 0.5
    },
    'ratio': { 'default': 1 }, // Equal allocation
    'rate': {
      'survival': 0.05, // 5% annual rate
      'default': 0.10
    },
    'continuous': { 'default': 10 }
  }

  return defaults[fieldType as keyof typeof defaults]?.[calculatorType || 'default'] ||
         defaults[fieldType as keyof typeof defaults]?.['default'] || undefined
}

export function StatisticalFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  fieldType,
  calculatorType,
  selectOptions,
  className,
  size = 'md',
  disabled = false,
}: StatisticalFieldProps<T>) {
  const config = getFieldConfig(fieldType, calculatorType)
  const variant = fieldType === 'percentage' ? 'percentage' :
                 fieldType === 'sample-size' ? 'sample-size' :
                 fieldType === 'power' || fieldType === 'alpha' ? 'number' :
                 fieldType === 'ratio' ? 'number' :
                 fieldType === 'rate' ? 'probability' :
                 'number'

  if (fieldType === 'select' && selectOptions) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem className={cn("space-y-3", className)}>
            <FormLabel className={cn(
              size === 'lg' ? 'text-lg font-semibold' :
              size === 'sm' ? 'text-sm font-medium' :
              'text-base font-semibold',
              "text-foreground leading-none",
              fieldState.error && "text-destructive"
            )}>
              {label}
            </FormLabel>
            {(description || config.description) && (
              <p className={cn(
                size === 'lg' ? 'text-sm' :
                size === 'sm' ? 'text-xs' :
                'text-sm',
                "text-muted-foreground leading-relaxed text-left"
              )}>
                {description || config.description}
              </p>
            )}
                         <Select
              onValueChange={field.onChange}
              value={field.value || ""}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className={cn(
                  "border-2 bg-background/50 hover:bg-background/80 focus:bg-background",
                  "hover:border-primary/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
                  "text-foreground placeholder:text-muted-foreground/60",
                  size === 'lg' ? 'h-14 text-lg px-4' :
                  size === 'sm' ? 'h-10 text-sm px-3' :
                  'h-12 text-base px-4',
                  "min-h-12", // Ensure minimum height to prevent text cutting
                  fieldState.error && "border-destructive/50 focus:border-destructive hover:border-destructive/70 focus:ring-destructive/10"
                )}>
                  <SelectValue placeholder={config.placeholder} className="text-left" />
                </SelectTrigger>
              </FormControl>
              <SelectContent
                className="min-w-[var(--radix-select-trigger-width)] bg-background border-2 border-border"
                sideOffset={4}
              >
                {selectOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary cursor-pointer py-3"
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("space-y-3", className)}>
          <FormControl>
            <EnhancedInput
              {...field}
              label={label}
              description={description || config.description}
              variant={variant}
              contextualPlaceholder={config.placeholder}
              example={config.example}
              size={size}
              disabled={disabled}
              hasError={!!fieldState.error}
              onChange={(e) => {
                const value = e.target.value
                if (variant === 'percentage' || variant === 'number' || variant === 'sample-size' || variant === 'probability') {
                  // Handle empty string or invalid numbers properly
                  if (value === '' || value === null || value === undefined) {
                    field.onChange('')
                  } else {
                    const numValue = Number(value)
                    if (!isNaN(numValue)) {
                      field.onChange(numValue)
                    } else {
                      field.onChange(value) // Keep as string if invalid number
                    }
                  }
                } else {
                  field.onChange(value)
                }
              }}
              value={field.value?.toString() || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Pre-configured field components for common statistical inputs
export const PowerField = <T extends FieldValues>(props: Omit<StatisticalFieldProps<T>, 'fieldType' | 'label'>) => (
  <StatisticalFormField
    {...props}
    fieldType="power"
    label="Statistical Power (%)"
  />
)

export const AlphaField = <T extends FieldValues>(props: Omit<StatisticalFieldProps<T>, 'fieldType' | 'label'>) => (
  <StatisticalFormField
    {...props}
    fieldType="alpha"
    label="Significance Level (α) (%)"
  />
)

export const SampleSizeField = <T extends FieldValues>(props: Omit<StatisticalFieldProps<T>, 'fieldType'>) => (
  <StatisticalFormField
    {...props}
    fieldType="sample-size"
  />
)

export const PercentageField = <T extends FieldValues>(props: Omit<StatisticalFieldProps<T>, 'fieldType'>) => (
  <StatisticalFormField
    {...props}
    fieldType="percentage"
  />
)

export const EffectSizeField = <T extends FieldValues>(props: Omit<StatisticalFieldProps<T>, 'fieldType'>) => (
  <StatisticalFormField
    {...props}
    fieldType="effect-size"
  />
)

export const AllocationRatioField = <T extends FieldValues>(props: Omit<StatisticalFieldProps<T>, 'fieldType' | 'label'>) => (
  <StatisticalFormField
    {...props}
    fieldType="ratio"
    label="Allocation Ratio"
  />
)
