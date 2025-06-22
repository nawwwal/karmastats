"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
  colors?: string[];
  speed?: number;
  blur?: "light" | "medium" | "heavy";
  className?: string;
}

export function AnimatedGradient({
  colors = [
    "rgba(20, 108, 148, 0.1)",
    "rgba(25, 167, 206, 0.08)",
    "rgba(248, 253, 207, 0.06)"
  ],
  speed = 3,
  blur = "medium",
  className,
}: AnimatedGradientProps) {
  const blurClasses = {
    light: "blur-sm",
    medium: "blur-md",
    heavy: "blur-lg"
  };

  const gradientRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = gradientRef.current;
    if (!element) return;

    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = (elapsed / speed) % 1;
      const position = Math.sin(progress * Math.PI * 2) * 50 + 50;

      element.style.backgroundPosition = `${position}% 50%`;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [speed]);

  return (
    <div
      ref={gradientRef}
      className={cn(
        "absolute inset-0 opacity-20 pointer-events-none",
        blurClasses[blur],
        className
      )}
      style={{
        background: `linear-gradient(45deg, ${colors.join(", ")})`,
        backgroundSize: "200% 200%",
      }}
    />
  );
}
