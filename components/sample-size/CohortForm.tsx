'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldPopover } from "@/components/ui/field-popover";
import { getFieldExplanation } from "@/lib/field-explanations";
import { calculateCohortSampleSize } from "@/lib/math/sample-size/comparativeStudy";

const formSchema = z.object({
  confidenceLevel: z.number().min(0).max(100),
  power: z.number().min(0).max(100),
  ratio: z.number().min(0),
  p1: z.number().min(0).max(1),
  p2: z.number().min(0).max(1),
});

type FormData = z.infer<typeof formSchema>;

interface CohortFormProps {
  onResultsChange: (results: any) => void;
}

export function CohortForm({ onResultsChange }: CohortFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confidenceLevel: 95,
      power: 80,
      ratio: 1,
      p1: 0.2,
      p2: 0.1,
    },
  });

  function onSubmit(values: FormData) {
    const { confidenceLevel, power, ratio, p1, p2 } = values;
    const sampleSize = calculateCohortSampleSize(
      confidenceLevel / 100,
      power / 100,
      ratio,
      p1,
      p2,
    );

    // Structure results for display
    const results = {
      type: 'cohort',
      sampleSize,
      parameters: values,
      interpretation: {
        nExposed: sampleSize.n_exposed,
        nUnexposed: sampleSize.n_unexposed,
        totalSample: sampleSize.n_exposed + sampleSize.n_unexposed,
        relativeRisk: values.p1 / values.p2,
        riskDifference: Math.abs(values.p1 - values.p2),
        attributableRisk: (values.p1 - values.p2) / values.p1 * 100
      }
    };

    onResultsChange(results);
    // Scroll to top to show results
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Cohort Study Parameters</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Calculate sample size for prospective cohort studies comparing disease incidence between exposed and unexposed groups.
        </p>
      </div>

      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="confidenceLevel"
              render={({ field }) => (
                <FormItem>
                  <FieldPopover
                    {...getFieldExplanation('sampleSize', 'confidenceLevel')}
                    side="top"
                  >
                    <FormLabel>Confidence Level (%)</FormLabel>
                  </FieldPopover>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="95"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="power"
              render={({ field }) => (
                <FormItem>
                  <FieldPopover
                    {...getFieldExplanation('sampleSize', 'power')}
                    side="top"
                  >
                    <FormLabel>Statistical Power (%)</FormLabel>
                  </FieldPopover>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="80"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="ratio"
            render={({ field }) => (
              <FormItem>
                <FieldPopover
                  title="Control to Exposed Ratio"
                  content="The number of unexposed individuals recruited for each exposed individual. Higher ratios can increase statistical power but also increase study costs and complexity."
                  examples={[
                    "1:1 - Equal numbers, standard approach",
                    "2:1 - Common for cohort studies",
                    "3:1 - Higher precision, increased cost"
                  ]}
                  validRange={{ min: 1, max: 5 }}
                  side="top"
                >
                  <FormLabel>Ratio of Unexposed to Exposed</FormLabel>
                </FieldPopover>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="p1"
              render={({ field }) => (
                <FormItem>
                  <FieldPopover
                    title="Disease Rate in Exposed (p₁)"
                    content="The expected proportion of exposed individuals who will develop the disease during the follow-up period. This represents the incidence rate in the exposed group."
                    examples={[
                      "0.15 (15%) - Moderate disease incidence",
                      "0.25 (25%) - High disease incidence",
                      "0.05 (5%) - Low disease incidence"
                    ]}
                    validRange={{ min: "0.01", max: "0.99" }}
                    side="top"
                  >
                    <FormLabel>Disease Rate in Exposed (p₁)</FormLabel>
                  </FieldPopover>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.20"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="p2"
              render={({ field }) => (
                <FormItem>
                  <FieldPopover
                    title="Disease Rate in Unexposed (p₂)"
                    content="The expected proportion of unexposed individuals who will develop the disease during the follow-up period. This represents the baseline incidence rate in the unexposed group."
                    examples={[
                      "0.10 (10%) - When p₁ = 20%, detecting doubled risk",
                      "0.05 (5%) - When p₁ = 15%, detecting tripled risk",
                      "0.15 (15%) - When p₁ = 25%, detecting 67% increase"
                    ]}
                    validRange={{ min: "0.01", max: "0.99" }}
                    side="top"
                  >
                    <FormLabel>Disease Rate in Unexposed (p₂)</FormLabel>
                  </FieldPopover>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.10"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full">
            Calculate Sample Size
          </Button>
        </form>
      </Form>
    </div>
  );
}
