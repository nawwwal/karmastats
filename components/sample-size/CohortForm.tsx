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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useState } from "react";
import { calculateCohortSampleSize } from "@/lib/math/sample-size/comparativeStudy";

const formSchema = z.object({
  confidenceLevel: z.number().min(0).max(100),
  power: z.number().min(0).max(100),
  ratio: z.number().min(0),
  p1: z.number().min(0).max(1),
  p2: z.number().min(0).max(1),
});

type FormData = z.infer<typeof formSchema>;

export function CohortForm() {
  const [result, setResult] = useState<{ n_exposed: number; n_unexposed: number } | null>(null);

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
    setResult(sampleSize);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohort Study</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="confidenceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confidence Level (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                  <FormLabel>Power (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ratio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ratio of Unexposed to Exposed</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                  <FormLabel>Proportion of Exposed with Disease (p1)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                  <FormLabel>Proportion of Unexposed with Disease (p2)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Calculate</Button>
          </form>
        </Form>
        {result && (
           <Card className="mt-4">
            <CardHeader>
                <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Sample Size for Exposed Group (n1): {result.n_exposed}</p>
                <p>Sample Size for Unexposed Group (n2): {result.n_unexposed}</p>
                <p>Total Sample Size: {result.n_exposed + result.n_unexposed}</p>
            </CardContent>
           </Card>
        )}
      </CardContent>
    </Card>
  );
}
