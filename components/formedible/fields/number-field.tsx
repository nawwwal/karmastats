'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { NumberFieldSpecificProps } from '@/lib/formedible/types';
import { FieldWrapper } from './base-field-wrapper';

export const NumberField: React.FC<NumberFieldSpecificProps> = ({
  fieldApi,
  label,
  description,
  placeholder,
  inputClassName,
  labelClassName,
  wrapperClassName,
  min,
  max,
  step,
}) => {
  const name = fieldApi.name;
  const value = fieldApi.state?.value as number | string | undefined;
  const isDisabled = fieldApi.form?.state?.isSubmitting ?? false;
  const hasErrors = fieldApi.state?.meta?.isTouched && fieldApi.state?.meta?.errors?.length > 0;

  const effectiveStep = typeof step === 'number' && !Number.isNaN(step) && step !== 0 ? step : 1;

  const decimalsFromStep = (s: number | undefined) => {
    if (!s || !Number.isFinite(s)) return 0;
    const parts = s.toString().split('.');
    return parts[1] ? parts[1].length : 0;
  };
  const stepDecimals = decimalsFromStep(effectiveStep);

  const clamp = (num: number) => {
    let clamped = num;
    if (typeof min === 'number') clamped = Math.max(min, clamped);
    if (typeof max === 'number') clamped = Math.min(max, clamped);
    return clamped;
  };

  const roundToStep = (num: number) => {
    if (stepDecimals <= 0) return num;
    const factor = Math.pow(10, stepDecimals);
    return Math.round(num * factor) / factor;
  };

  const toNumber = (val: unknown): number | undefined => {
    if (val === '' || val === null || val === undefined) return undefined;
    const n = typeof val === 'number' ? val : parseFloat(String(val));
    return Number.isFinite(n) ? n : undefined;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow free typing (including blank, partial decimals, leading '-')
    fieldApi.handleChange(e.target.value);
  };

  const onBlur = () => {
    // On blur, attempt to coerce to number, round to step, and clamp
    const current = toNumber(value);
    if (current !== undefined) {
      const rounded = roundToStep(current);
      const clamped = clamp(rounded);
      // Persist as number for stable downstream calculations
      fieldApi.handleChange(clamped as unknown as string | number);
    }
    fieldApi.handleBlur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Preserve native number input behavior; only prevent unintended form interactions
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Let browser increment/decrement; just stop bubbling so parent handlers don't hijack focus
      e.stopPropagation();
    }
  };

  // Prevent wheel from changing values unexpectedly when scrolling
  const onWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (document.activeElement === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  let displayValue: string | number = '';
  if (typeof value === 'number') {
    displayValue = value;
  } else if (typeof value === 'string') {
    displayValue = value;
  }

  const computedInputClassName = cn(
    inputClassName,
    hasErrors ? 'border-destructive' : ''
  );

  return (
    <FieldWrapper
      fieldApi={fieldApi}
      label={label}
      description={description}
      inputClassName={inputClassName}
      labelClassName={labelClassName}
      wrapperClassName={wrapperClassName}
    >
      <Input
        id={name}
        name={name}
        type="number"
        value={displayValue}
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        placeholder={placeholder}
        className={computedInputClassName}
        disabled={isDisabled}
        min={min}
        max={max}
        step={effectiveStep}
        inputMode="decimal"
        aria-label={typeof label === 'string' ? label : undefined}
        aria-invalid={hasErrors || undefined}
      />
    </FieldWrapper>
  );
};