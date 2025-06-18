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
      p1: 0.1,
      p2: 0.2,
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
        relativeRisk: (values.p1 / values.p2).toFixed(2),
        riskDifference: Math.abs(values.p1 - values.p2).toFixed(3),
        effectSize: Math.abs(values.p1 - values.p2).toFixed(3)
      }
    };

    onResultsChange(results);
    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  <FormLabel>Confidence Level (%)</FormLabel>
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
                  <FormLabel>Statistical Power (%)</FormLabel>
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
                <FormLabel>Ratio of Unexposed to Exposed</FormLabel>
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
                  <FormLabel>Disease Rate in Exposed (p₁)</FormLabel>
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
                  <FormLabel>Disease Rate in Unexposed (p₂)</FormLabel>
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
