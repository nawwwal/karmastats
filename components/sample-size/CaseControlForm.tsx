'use client';

import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, NeuomorphicButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { calculateCaseControlSampleSize } from "@/lib/math/sample-size/comparativeStudy";
import {
  PowerField,
  AlphaField,
  PercentageField,
  AllocationRatioField
} from '@/components/ui/enhanced-form-field';
import { Calculator, AlertCircle, FileUp, Users } from 'lucide-react';

const formSchema = z.object({
  alpha: z.string().min(1, "Alpha level is required"),
  power: z.string().min(1, "Power is required"),
  ratio: z.number().min(0.1, "Ratio must be at least 0.1").max(10, "Ratio must be at most 10"),
  p0: z.number().min(0.001, "Control exposure rate must be at least 0.1%").max(0.999, "Control exposure rate must be less than 99.9%"),
  p1: z.number().min(0.001, "Case exposure rate must be at least 0.1%").max(0.999, "Case exposure rate must be less than 99.9%"),
});

type FormData = z.infer<typeof formSchema>;

interface CaseControlFormProps {
  onResultsChange: (results: any) => void;
}

export function CaseControlForm({ onResultsChange }: CaseControlFormProps) {
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alpha: '5',
      power: '80',
      ratio: 1,
      p0: 0.2, // 20% exposure in controls (realistic for case-control studies)
      p1: 0.4, // 40% exposure in cases (detectable odds ratio ~2.67)
    },
  });

  // Auto-calculate with default values on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const defaultData = form.getValues();
      onSubmit(defaultData);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  function onSubmit(values: FormData) {
    try {
      setError(null);
      const alpha = parseFloat(values.alpha) / 100;
      const power = parseFloat(values.power) / 100;
      const { ratio, p0, p1 } = values;

    const sampleSize = calculateCaseControlSampleSize(
        1 - alpha, // Convert to confidence level
        power,
      ratio,
      p0,
      p1,
    );

    // Structure results for display
    const results = {
      type: 'case-control',
      sampleSize,
        parameters: {
          ...values,
          confidenceLevel: (1 - alpha) * 100,
          power: power * 100,
        },
      interpretation: {
        nCases: sampleSize.n_cases,
        nControls: sampleSize.n_controls,
        totalSample: sampleSize.n_cases + sampleSize.n_controls,
        oddsRatio: (values.p1 / (1 - values.p1)) / (values.p0 / (1 - values.p0)),
        effectSize: Math.abs(values.p1 - values.p0)
      }
    };

    onResultsChange(results);
      form.clearErrors();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((error) => {
          if (error.path.length > 0) {
            form.setError(error.path[0] as any, {
              type: 'validation',
              message: error.message,
            });
          }
        });
        setError(`Please check the highlighted fields: ${err.errors.map(e => e.message).join(', ')}`);
      } else {
        setError(err.message);
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const { extractTextFromPDF, extractParameters } = await import('@/lib/pdf-utils');
        const textContent = await extractTextFromPDF(e.target?.result as ArrayBuffer);

        const patterns = {
          alpha: [/alpha of ([\d\.]+)/i, /significance level of ([\d\.]+)/i],
          power: [/power of ([\d\.]+)/i, /statistical power of ([\d\.]+)/i],
          p0: [/control exposure rate of ([\d\.]+)/i, /exposure rate in controls of ([\d\.]+)/i],
          p1: [/case exposure rate of ([\d\.]+)/i, /exposure rate in cases of ([\d\.]+)/i],
          ratio: [/ratio of ([\d\.:]+)/i, /control to case ratio of ([\d\.:]+)/i]
        };

        const extractedValues = extractParameters(textContent, patterns);

        if (extractedValues.alpha) form.setValue('alpha', extractedValues.alpha.toString());
        if (extractedValues.power) form.setValue('power', extractedValues.power.toString());
        if (extractedValues.p0) form.setValue('p0', extractedValues.p0);
        if (extractedValues.p1) form.setValue('p1', extractedValues.p1);
        if (extractedValues.ratio) form.setValue('ratio', extractedValues.ratio);

        // Trigger calculation with new values
        const updatedData = form.getValues();
        onSubmit(updatedData);
      } catch (err: any) {
        setError(`Failed to process PDF: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
      <CardContent className="space-y-8 pt-8">
        {error && (
          <Alert className="border-destructive/20 bg-destructive/10 text-left">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive font-bold text-left">Calculation Error</AlertTitle>
            <AlertDescription className="text-destructive text-left">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              <span>Import from PDF (Optional)</span>
            </CardTitle>
            <CardDescription>Upload study protocol to auto-extract case-control parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('pdf-upload-case-control')?.click()}
            >
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">📁</span>
                </div>
      <div>
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PDF files only, max 10MB</p>
                </div>
      </div>
                    <Input
                id="pdf-upload-case-control"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Statistical Parameters Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="text-xl">Statistical Parameters</CardTitle>
                <CardDescription>
                  Standard parameters for case-control study design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AlphaField
                    control={form.control}
                    name="alpha"
                    calculatorType="case-control"
                    size="md"
            />
                  <PowerField
              control={form.control}
              name="power"
                    calculatorType="case-control"
                    size="md"
            />
          </div>
              </CardContent>
            </Card>

            {/* Study Design Parameters */}
            <Card className="border-primary/20 bg-primary/10 dark:bg-primary/20 dark:border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Case-Control Study Parameters
                </CardTitle>
                <CardDescription>
                  Specific parameters for retrospective case-control study design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AllocationRatioField
            control={form.control}
            name="ratio"
                  label="Controls to Cases Ratio"
                  description="Number of controls recruited per case. Higher ratios increase power but also cost."
                  calculatorType="case-control"
                  size="md"
          />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PercentageField
              control={form.control}
              name="p0"
                    label="Exposure Rate in Controls"
                    description="Expected proportion of controls with exposure history (baseline exposure rate)"
                    calculatorType="case-control"
                    size="md"
                    placeholder="0.20"
                    min={0.001}
                    max={0.999}
                    step={0.001}
                    />
                  <PercentageField
              control={form.control}
              name="p1"
                    label="Exposure Rate in Cases"
                    description="Expected proportion of cases with exposure history (should be higher than controls)"
                    calculatorType="case-control"
                    size="md"
                    placeholder="0.40"
                    min={0.001}
                    max={0.999}
                    step={0.001}
            />
          </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <NeuomorphicButton
                type="submit"
                size="xxl"
              >
                <Calculator className="h-5 w-5 mr-3" />
            Calculate Sample Size
          </NeuomorphicButton>
            </div>
        </form>
      </Form>
      </CardContent>
    </Card>
  );
}
