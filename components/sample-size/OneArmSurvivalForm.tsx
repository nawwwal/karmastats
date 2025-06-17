'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateOneArm, OneArmParams } from '@/lib/survivalAnalysis';

const OneArmSurvivalSchema = z.object({
  historicalMedianSurvival: z.number().min(0.1),
  targetMedianSurvival: z.number().min(0.1),
  analysisTimePoint: z.number().min(0.1),
  significanceLevel: z.number().default(0.05),
  power: z.number().default(0.8),
  dropoutRate: z.number().min(0).max(100).default(0),
});

type OneArmSurvivalInput = z.infer<typeof OneArmSurvivalSchema>;

export function OneArmSurvivalForm() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OneArmSurvivalInput>({
    resolver: zodResolver(OneArmSurvivalSchema),
    defaultValues: {
      historicalMedianSurvival: 12,
      targetMedianSurvival: 18,
      analysisTimePoint: 24,
      significanceLevel: 0.05,
      power: 0.8,
      dropoutRate: 0,
    },
  });

  const onSubmit = (data: OneArmSurvivalInput) => {
    try {
      setError(null);
      const result = calculateOneArm(data);
      setResults(result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="historicalMedianSurvival"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Median Survival (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="targetMedianSurvival"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Median Survival (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="analysisTimePoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Analysis Time Point (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="significanceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Significance Level</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0.01">0.01</SelectItem>
                      <SelectItem value="0.05">0.05</SelectItem>
                      <SelectItem value="0.10">0.10</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="power"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statistical Power</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0.80">80%</SelectItem>
                      <SelectItem value="0.85">85%</SelectItem>
                      <SelectItem value="0.90">90%</SelectItem>
                      <SelectItem value="0.95">95%</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="dropoutRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dropout Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>One-Arm Survival Study Results</CardTitle>
            <CardDescription>
              Sample size calculation for single-arm survival study
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Sample Size</TableCell>
                  <TableCell className="text-right">{results.totalSampleSize}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Events Required</TableCell>
                  <TableCell className="text-right">{results.totalEvents}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Expected Events (Group 1)</TableCell>
                  <TableCell className="text-right">{results.expectedEvents.group1}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Expected Events (Group 2)</TableCell>
                  <TableCell className="text-right">{results.expectedEvents.group2}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Study Duration</TableCell>
                  <TableCell className="text-right">{results.studyDuration} months</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Statistical Power</TableCell>
                  <TableCell className="text-right">{(results.power * 100).toFixed(1)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
