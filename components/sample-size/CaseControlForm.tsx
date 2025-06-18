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
import { calculateCaseControlSampleSize } from "@/lib/math/sample-size/comparativeStudy";

const formSchema = z.object({
  confidenceLevel: z.number().min(0).max(100),
  power: z.number().min(0).max(100),
  ratio: z.number().min(0),
  p0: z.number().min(0).max(1),
  p1: z.number().min(0).max(1),
});

type FormData = z.infer<typeof formSchema>;

interface CaseControlFormProps {
  onResultsChange: (results: any) => void;
}

export function CaseControlForm({ onResultsChange }: CaseControlFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confidenceLevel: 95,
      power: 80,
      ratio: 1,
      p0: 0.1,
      p1: 0.2,
    },
  });

  function onSubmit(values: FormData) {
    const { confidenceLevel, power, ratio, p0, p1 } = values;
    const sampleSize = calculateCaseControlSampleSize(
      confidenceLevel / 100,
      power / 100,
      ratio,
      p0,
      p1,
    );

    // Structure results for display
    const results = {
      type: 'case-control',
      sampleSize,
      parameters: values,
      interpretation: {
        nCases: sampleSize.n_cases,
        nControls: sampleSize.n_controls,
        totalSample: sampleSize.n_cases + sampleSize.n_controls,
        oddsRatio: ((values.p1 / (1 - values.p1)) / (values.p0 / (1 - values.p0))).toFixed(2),
        effectSize: Math.abs(values.p1 - values.p0).toFixed(3)
      }
    };

    onResultsChange(results);
    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Case-Control Study Parameters</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Calculate sample size for retrospective case-control studies comparing exposure rates between cases and controls.
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
                <FormLabel>Ratio of Controls to Cases</FormLabel>
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
              name="p0"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exposure in Controls (p₀)</FormLabel>
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
            <FormField
              control={form.control}
              name="p1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exposure in Cases (p₁)</FormLabel>
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
          </div>

          <Button type="submit" className="w-full">
            Calculate Sample Size
          </Button>
        </form>
      </Form>
    </div>
  );
}
