import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { DiseaseModelResult } from "@/lib/infectious";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  const options: ChartOptions<"line"> = {
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
          label: function (context) {
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
          callback: function (value) {
            return new Intl.NumberFormat().format(value as number);
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
