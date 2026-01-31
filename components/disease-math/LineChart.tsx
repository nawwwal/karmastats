"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DiseaseModelResult } from "@/backend/disease-math.seir";

// Dynamically import Chart.js to prevent SSR issues
const Line = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    ),
  }
);

// Dynamic import for Chart.js registration
if (typeof window !== "undefined") {
  import("chart.js").then((ChartJS) => {
    ChartJS.Chart.register(
      ChartJS.CategoryScale,
      ChartJS.LinearScale,
      ChartJS.PointElement,
      ChartJS.LineElement,
      ChartJS.Title,
      ChartJS.Tooltip,
      ChartJS.Legend
    );
  });
}

interface LineChartProps {
  results: DiseaseModelResult;
}

export function LineChart({ results }: LineChartProps) {

  const data = {
    labels: Array.from({ length: results.susceptible.length }, (_, i) => `Day ${i}`),
    datasets: [
      {
        label: "Susceptible",
        data: results.susceptible,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.5)",
        tension: 0.4,
        fill: false
      },
      {
        label: "Infected",
        data: results.infected,
        borderColor: "hsl(var(--destructive))",
        backgroundColor: "hsl(var(--destructive) / 0.5)",
        tension: 0.4,
        fill: false
      },
      {
        label: "Recovered",
        data: results.recovered,
        borderColor: "hsl(var(--success))",
        backgroundColor: "hsl(var(--success) / 0.5)",
        tension: 0.4,
        fill: false
      },
      {
        label: "Deceased",
        data: results.deceased,
        borderColor: "hsl(var(--muted-foreground))",
        backgroundColor: "hsl(var(--muted-foreground) / 0.5)",
        tension: 0.4,
        fill: false
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat().format(Math.round(context.parsed.y));
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return new Intl.NumberFormat().format(value as number);
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
