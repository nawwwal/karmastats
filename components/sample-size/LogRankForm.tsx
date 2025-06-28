"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateLogRank, LogRankParams } from '@/lib/survivalAnalysis';
import { NeuomorphicButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  medianSurvival1: z.number().positive(),
  medianSurvival2: z.number().positive(),
  accrualPeriod: z.number().positive(),
  followupPeriod: z.number().nonnegative(),
  allocationRatio: z.number().positive(),
  significanceLevel: z.number(),
  power: z.number(),
  dropoutRate: z.number().min(0).max(99),
});

type FormData = z.infer<typeof formSchema>;

interface LogRankFormProps {
  onResultsChange: (results: any) => void;
}

export function LogRankForm({ onResultsChange }: LogRankFormProps) {
  const { control, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medianSurvival1: 12,
      medianSurvival2: 18,
      accrualPeriod: 24,
      followupPeriod: 12,
      allocationRatio: 1,
      significanceLevel: 0.05,
      power: 0.8,
      dropoutRate: 10,
    },
  });

  const onSubmit = (data: FormData) => {
    const calculatedResult = calculateLogRank(data as LogRankParams);
    onResultsChange(calculatedResult);
    // Scroll to top to show results
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form fields */}
            <Controller name="medianSurvival1" control={control} render={({ field }) => ( <div><Label>Group 1 Median Survival (months)</Label><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/></div> )}/>
            <Controller name="medianSurvival2" control={control} render={({ field }) => ( <div><Label>Group 2 Median Survival (months)</Label><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/></div> )}/>
            <Controller name="accrualPeriod" control={control} render={({ field }) => ( <div><Label>Accrual Period (months)</Label><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/></div> )}/>
            <Controller name="followupPeriod" control={control} render={({ field }) => ( <div><Label>Follow-up Period (months)</Label><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/></div> )}/>
            <Controller name="allocationRatio" control={control} render={({ field }) => ( <div><Label>Allocation Ratio</Label><Select onValueChange={v => field.onChange(parseFloat(v))} defaultValue={field.value.toString()}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="1">1:1</SelectItem><SelectItem value="1.5">1.5:1</SelectItem><SelectItem value="2">2:1</SelectItem></SelectContent></Select></div> )}/>
            <Controller name="significanceLevel" control={control} render={({ field }) => ( <div><Label>Significance Level (α)</Label><Select onValueChange={v => field.onChange(parseFloat(v))} defaultValue={field.value.toString()}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="0.05">0.05</SelectItem><SelectItem value="0.01">0.01</SelectItem><SelectItem value="0.1">0.10</SelectItem></SelectContent></Select></div> )}/>
            <Controller name="power" control={control} render={({ field }) => ( <div><Label>Power (1-β)</Label><Select onValueChange={v => field.onChange(parseFloat(v))} defaultValue={field.value.toString()}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="0.8">80%</SelectItem><SelectItem value="0.9">90%</SelectItem></SelectContent></Select></div> )}/>
            <Controller name="dropoutRate" control={control} render={({ field }) => ( <div><Label>Dropout Rate (%)</Label><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/></div> )}/>
        </div>
        <NeuomorphicButton type="submit" className="w-full" size="xxl">Calculate</NeuomorphicButton>
    </form>
  );
}
