"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateCox, CoxParams } from '@/lib/survivalAnalysis';
import { NeuomorphicButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  hazardRatio: z.number().positive(),
  rSquared: z.number().min(0).max(0.99),
  overallEventRate: z.number().min(0.01).max(1),
  significanceLevel: z.number(),
  power: z.number(),
  dropoutRate: z.number().min(0).max(99),
});

type FormData = z.infer<typeof formSchema>;

interface CoxRegressionFormProps {
  onResultsChange: (results: any) => void;
}

export function CoxRegressionForm({ onResultsChange }: CoxRegressionFormProps) {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hazardRatio: 1.5,
      rSquared: 0.2,
      overallEventRate: 0.6,
      significanceLevel: 0.05,
      power: 0.8,
      dropoutRate: 15,
    },
  });

  const onSubmit = (data: FormData) => {
    const calculatedResult = calculateCox(data as CoxParams);
    onResultsChange?.(calculatedResult);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller name="hazardRatio" control={control} render={({ field }) => ( <div><Label>Hazard Ratio</Label><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></div> )}/>
            <Controller name="rSquared" control={control} render={({ field }) => ( <div><Label>R² for Primary Covariate</Label><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></div> )}/>
            <Controller name="overallEventRate" control={control} render={({ field }) => ( <div><Label>Overall Event Rate</Label><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></div> )}/>
            <Controller name="significanceLevel" control={control} render={({ field }) => ( <div><Label>Significance Level (α)</Label><Select onValueChange={v => field.onChange(parseFloat(v))} defaultValue={field.value.toString()}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="0.05">0.05</SelectItem><SelectItem value="0.01">0.01</SelectItem><SelectItem value="0.1">0.10</SelectItem></SelectContent></Select></div> )}/>
            <Controller name="power" control={control} render={({ field }) => ( <div><Label>Power (1-β)</Label><Select onValueChange={v => field.onChange(parseFloat(v))} defaultValue={field.value.toString()}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="0.8">80%</SelectItem><SelectItem value="0.9">90%</SelectItem></SelectContent></Select></div> )}/>
            <Controller name="dropoutRate" control={control} render={({ field }) => ( <div><Label>Dropout Rate (%)</Label><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></div> )}/>
        </div>
        <NeuomorphicButton type="submit" className="w-full" size="xxl">Calculate</NeuomorphicButton>
    </form>
  );
}
