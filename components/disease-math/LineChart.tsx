"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DiseaseModelResult } from "@/lib/infectious";

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
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.4,
      },
      {
        label: "Infected",
        data: results.infected,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.4,
      },
      {
        label: "Recovered",
        data: results.recovered,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        tension: 0.4,
      },
      {
        label: "Deceased",
        data: results.deceased,
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        tension: 0.4,
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
