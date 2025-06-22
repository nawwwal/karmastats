import * as React from "react";
import NumberFlow, { type Value } from "@number-flow/react";
import { cn } from "@/lib/utils";

interface NumberFlowDisplayProps {
  value: Value;
  format?: {
    notation?: "standard" | "compact";
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  };
  trend?: 1 | 0 | -1;
  className?: string;
  prefix?: string;
  suffix?: string;
  animated?: boolean;
}

export function NumberFlowDisplay({
  value,
  format = { notation: "standard" },
  trend = 0,
  className,
  prefix = "",
  suffix = "",
  animated = true,
  ...props
}: NumberFlowDisplayProps) {
  if (!animated) {
    const formattedValue = typeof value === 'number'
      ? new Intl.NumberFormat(undefined, {
          notation: format.notation === "compact" ? "compact" : "standard",
          minimumFractionDigits: format.minimumFractionDigits,
          maximumFractionDigits: format.maximumFractionDigits,
        }).format(value)
      : value;
    return (
      <span className={cn("font-mono", className)} {...props}>
        {prefix}{formattedValue}{suffix}
      </span>
    );
  }

  return (
    <span className={cn("font-mono", className)} {...props}>
      {prefix}
      <NumberFlow
        value={value}
        trend={trend}
        format={format}
      />
      {suffix}
    </span>
  );
}
