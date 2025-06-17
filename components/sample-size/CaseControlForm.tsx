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
import { calculateCaseControlSampleSize } from "@/lib/math/sample-size/comparativeStudy";

const formSchema = z.object({
  confidenceLevel: z.number().min(0).max(100),
  power: z.number().min(0).max(100),
  ratio: z.number().min(0),
  p0: z.number().min(0).max(1),
  p1: z.number().min(0).max(1),
});

type FormData = z.infer<typeof formSchema>;

export function CaseControlForm() {
  const [result, setResult] = useState<{ n_cases: number; n_controls: number } | null>(null);

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
    setResult(sampleSize);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case-Control Study</CardTitle>
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
                  <FormLabel>Ratio of Controls to Cases</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="p0"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proportion of Controls with Exposure (p0)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                  <FormLabel>Proportion of Cases with Exposure (p1)</FormLabel>
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
                <p>Sample Size for Cases (n1): {result.n_cases}</p>
                <p>Sample Size for Controls (n0): {result.n_controls}</p>
                <p>Total Sample Size: {result.n_cases + result.n_controls}</p>
            </CardContent>
           </Card>
        )}
      </CardContent>
    </Card>
  );
}
