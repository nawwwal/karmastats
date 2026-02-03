import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function PowerCurveChart({ data, analysisType, theme = 'light' }) {
  if (!data || data.length === 0) return null;

  const isDark = theme === 'dark';
  const textColor = isDark ? '#E2E8F0' : '#1E293B';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const primaryColor = '#14B8A6';
  const secondaryColor = '#F59E0B';

  // Determine chart data based on analysis type
  const getChartData = () => {
    const labels = data.map(d => d.param);

    if (analysisType === 'sample-size' || analysisType === 'effect-size') {
      return {
        labels,
        datasets: [
          {
            label: 'Statistical Power (%)',
            data: data.map(d => parseFloat(d.power)),
            borderColor: primaryColor,
            backgroundColor: `${primaryColor}33`,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: primaryColor,
            pointBorderColor: isDark ? '#1E293B' : '#FFFFFF',
            pointBorderWidth: 2
          },
          {
            label: '80% Power Threshold',
            data: data.map(() => 80),
            borderColor: secondaryColor,
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }
        ]
      };
    } else if (analysisType === 'power') {
      return {
        labels,
        datasets: [
          {
            label: 'Required Sample Size',
            data: data.map(d => d.sampleSize),
            borderColor: primaryColor,
            backgroundColor: `${primaryColor}33`,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: primaryColor,
            pointBorderColor: isDark ? '#1E293B' : '#FFFFFF',
            pointBorderWidth: 2
          }
        ]
      };
    } else if (analysisType === 'dropout') {
      return {
        labels: data.map(d => `${d.param}%`),
        datasets: [
          {
            label: 'Adjusted Sample Size',
            data: data.map(d => d.adjustedN),
            borderColor: primaryColor,
            backgroundColor: `${primaryColor}33`,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: primaryColor,
            pointBorderColor: isDark ? '#1E293B' : '#FFFFFF',
            pointBorderWidth: 2
          }
        ]
      };
    }
  };

  const getYAxisLabel = () => {
    switch (analysisType) {
      case 'sample-size':
      case 'effect-size':
        return 'Statistical Power (%)';
      case 'power':
        return 'Required Sample Size';
      case 'dropout':
        return 'Adjusted Sample Size';
      default:
        return '';
    }
  };

  const getXAxisLabel = () => {
    switch (analysisType) {
      case 'sample-size':
        return 'Sample Size';
      case 'effect-size':
        return "Effect Size (Cohen's d)";
      case 'power':
        return 'Target Power (%)';
      case 'dropout':
        return 'Dropout Rate (%)';
      default:
        return '';
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { size: 12, weight: '500' },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: `Sensitivity Analysis: ${getXAxisLabel()} vs ${getYAxisLabel()}`,
        color: textColor,
        font: { size: 16, weight: '600' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: primaryColor,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (analysisType === 'sample-size' || analysisType === 'effect-size') {
              return `${label}: ${value.toFixed(1)}%`;
            }
            return `${label}: ${Math.round(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: getXAxisLabel(),
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y: {
        title: {
          display: true,
          text: getYAxisLabel(),
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { color: gridColor },
        beginAtZero: analysisType === 'sample-size' || analysisType === 'effect-size' ? false : true,
        min: analysisType === 'sample-size' || analysisType === 'effect-size' ? 0 : undefined,
        max: analysisType === 'sample-size' || analysisType === 'effect-size' ? 100 : undefined
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="chart-container" style={{ height: '350px', width: '100%' }}>
      <Line data={getChartData()} options={options} />
    </div>
  );
}

export function EffectSizeBarChart({ data, theme = 'light' }) {
  if (!data || data.length === 0) return null;

  const isDark = theme === 'dark';
  const textColor = isDark ? '#E2E8F0' : '#1E293B';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Color-code by effect size magnitude
  const getBarColor = (effectSize) => {
    const d = parseFloat(effectSize);
    if (d <= 0.2) return '#10B981'; // Small - Green
    if (d <= 0.5) return '#F59E0B'; // Medium - Amber
    if (d <= 0.8) return '#F97316'; // Large - Orange
    return '#EF4444'; // Very Large - Red
  };

  const chartData = {
    labels: data.map(d => d.param),
    datasets: [{
      label: 'Statistical Power (%)',
      data: data.map(d => parseFloat(d.power)),
      backgroundColor: data.map(d => getBarColor(d.param)),
      borderColor: data.map(d => getBarColor(d.param)),
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Power by Effect Size (Color-coded by magnitude)',
        color: textColor,
        font: { size: 16, weight: '600' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: '#14B8A6',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Effect Size (Cohen's d)",
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { display: false }
      },
      y: {
        title: {
          display: true,
          text: 'Statistical Power (%)',
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { color: gridColor },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Survival Curve Chart (Kaplan-Meier style)
export function SurvivalCurveChart({ survivalControl, survivalTreatment, theme = 'light' }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E2E8F0' : '#1E293B';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const controlSurvival = parseFloat(survivalControl) / 100 || 0.5;
  const treatmentSurvival = parseFloat(survivalTreatment) / 100 || 0.65;

  // Generate Kaplan-Meier style step data
  const timePoints = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  // Exponential decay model for survival curves
  const lambdaControl = -Math.log(controlSurvival) / 12;
  const lambdaTreatment = -Math.log(treatmentSurvival) / 12;

  const controlData = timePoints.map(t => Math.exp(-lambdaControl * t) * 100);
  const treatmentData = timePoints.map(t => Math.exp(-lambdaTreatment * t) * 100);

  const chartData = {
    labels: timePoints.map(t => `${t} mo`),
    datasets: [
      {
        label: 'Treatment Group',
        data: treatmentData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0,
        stepped: 'before',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#10B981',
        pointBorderColor: isDark ? '#1E293B' : '#FFFFFF',
        pointBorderWidth: 2,
        borderWidth: 3
      },
      {
        label: 'Control Group',
        data: controlData,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0,
        stepped: 'before',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: isDark ? '#1E293B' : '#FFFFFF',
        pointBorderWidth: 2,
        borderWidth: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { size: 12, weight: '500' },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Kaplan-Meier Survival Curves',
        color: textColor,
        font: { size: 16, weight: '600' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: '#14B8A6',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}% survival`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (months)',
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y: {
        title: {
          display: true,
          text: 'Survival Probability (%)',
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { color: gridColor },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: '350px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

// Forest Plot for Meta-Analysis
export function ForestPlotChart({ studies, overallEffect, theme = 'light' }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E2E8F0' : '#1E293B';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Default sample studies if not provided
  const defaultStudies = [
    { name: 'Study 1', effect: 0.35, lower: 0.15, upper: 0.55, weight: 25 },
    { name: 'Study 2', effect: 0.48, lower: 0.28, upper: 0.68, weight: 30 },
    { name: 'Study 3', effect: 0.22, lower: 0.02, upper: 0.42, weight: 20 },
    { name: 'Study 4', effect: 0.55, lower: 0.30, upper: 0.80, weight: 25 }
  ];

  const studyData = studies || defaultStudies;
  const overall = overallEffect || 0.40;

  const chartData = {
    labels: [...studyData.map(s => s.name), 'Overall'],
    datasets: [
      {
        label: 'Effect Size',
        data: [...studyData.map(s => s.effect), overall],
        backgroundColor: [...studyData.map(() => '#3B82F6'), '#14B8A6'],
        borderColor: [...studyData.map(() => '#3B82F6'), '#14B8A6'],
        borderWidth: 2,
        barThickness: 8
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Forest Plot - Effect Sizes',
        color: textColor,
        font: { size: 16, weight: '600' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: '#14B8A6',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const idx = context.dataIndex;
            if (idx < studyData.length) {
              const study = studyData[idx];
              return `Effect: ${study.effect.toFixed(2)} [${study.lower.toFixed(2)}, ${study.upper.toFixed(2)}]`;
            }
            return `Overall Effect: ${overall.toFixed(2)}`;
          }
        }
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            xMin: 0,
            xMax: 0,
            borderColor: '#EF4444',
            borderWidth: 2,
            borderDash: [5, 5]
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Effect Size',
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y: {
        ticks: {
          color: textColor,
          font: { weight: '500' }
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Bayesian Prior/Posterior Chart
export function BayesianChart({ priorMean, posteriorMean, priorSD, posteriorSD, theme = 'light' }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E2E8F0' : '#1E293B';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const pMean = parseFloat(priorMean) || 0;
  const poMean = parseFloat(posteriorMean) || 0.5;
  const pSD = parseFloat(priorSD) || 1;
  const poSD = parseFloat(posteriorSD) || 0.5;

  // Generate normal distribution curves
  const generateNormalData = (mean, sd, points = 100) => {
    const data = [];
    const range = sd * 4;
    const step = (range * 2) / points;
    for (let x = mean - range; x <= mean + range; x += step) {
      const y = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2));
      data.push({ x: x.toFixed(2), y: y });
    }
    return data;
  };

  const priorData = generateNormalData(pMean, pSD);
  const posteriorData = generateNormalData(poMean, poSD);

  // Combine x values for labels
  const allX = [...new Set([...priorData.map(d => d.x), ...posteriorData.map(d => d.x)])].sort((a, b) => a - b);

  const chartData = {
    labels: allX,
    datasets: [
      {
        label: 'Prior Distribution',
        data: allX.map(x => {
          const point = priorData.find(d => d.x === x);
          return point ? point.y : null;
        }),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'Posterior Distribution',
        data: allX.map(x => {
          const point = posteriorData.find(d => d.x === x);
          return point ? point.y : null;
        }),
        borderColor: '#14B8A6',
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { size: 12, weight: '500' },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Prior vs Posterior Distribution',
        color: textColor,
        font: { size: 16, weight: '600' },
        padding: { bottom: 20 }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Effect Size',
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: {
          color: textColor,
          maxTicksLimit: 10
        },
        grid: { color: gridColor }
      },
      y: {
        title: {
          display: true,
          text: 'Probability Density',
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { color: gridColor },
        beginAtZero: true
      }
    },
    spanGaps: true
  };

  return (
    <div className="chart-container" style={{ height: '350px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

// ICC Agreement Chart
export function AgreementChart({ icc, lowerBound, upperBound, theme = 'light' }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E2E8F0' : '#1E293B';

  const iccValue = parseFloat(icc) || 0.75;
  const lower = parseFloat(lowerBound) || 0.60;
  const upper = parseFloat(upperBound) || 0.85;

  // Agreement level thresholds
  const levels = [
    { label: 'Poor', min: 0, max: 0.5, color: '#EF4444' },
    { label: 'Moderate', min: 0.5, max: 0.75, color: '#F59E0B' },
    { label: 'Good', min: 0.75, max: 0.9, color: '#3B82F6' },
    { label: 'Excellent', min: 0.9, max: 1.0, color: '#10B981' }
  ];

  const chartData = {
    labels: levels.map(l => l.label),
    datasets: [{
      label: 'Agreement Level',
      data: levels.map(l => (l.max - l.min) * 100),
      backgroundColor: levels.map(l => l.color),
      borderWidth: 0
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `ICC = ${iccValue.toFixed(3)} [${lower.toFixed(3)}, ${upper.toFixed(3)}]`,
        color: textColor,
        font: { size: 16, weight: '600' },
        padding: { bottom: 20 }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const level = levels[context.dataIndex];
            return `Range: ${level.min.toFixed(2)} - ${level.max.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { display: false }
      },
      y: {
        display: false
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: '200px', width: '100%' }}>
      <Bar data={chartData} options={options} />
      <div style={{ textAlign: 'center', marginTop: '1rem', color: textColor }}>
        <strong>Your ICC ({iccValue.toFixed(3)}) indicates: </strong>
        <span style={{
          color: levels.find(l => iccValue >= l.min && iccValue < l.max)?.color || '#10B981',
          fontWeight: 'bold'
        }}>
          {levels.find(l => iccValue >= l.min && iccValue < l.max)?.label || 'Excellent'} Agreement
        </span>
      </div>
    </div>
  );
}

// Design Effect Chart for Cluster RCTs
export function DesignEffectChart({ clusterSize, theme = 'light' }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E2E8F0' : '#1E293B';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const m = parseInt(clusterSize) || 30;
  const iccValues = [0.01, 0.02, 0.03, 0.05, 0.08, 0.10, 0.15, 0.20];

  const deffData = iccValues.map(icc => 1 + (m - 1) * icc);

  const chartData = {
    labels: iccValues.map(v => v.toFixed(2)),
    datasets: [
      {
        label: 'Design Effect (DEFF)',
        data: deffData,
        borderColor: '#E11D48',
        backgroundColor: 'rgba(225, 29, 72, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#E11D48',
        pointBorderColor: isDark ? '#1E293B' : '#FFFFFF',
        pointBorderWidth: 2,
        borderWidth: 3
      },
      {
        label: 'No Clustering (DEFF = 1)',
        data: iccValues.map(() => 1),
        borderColor: '#10B981',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { size: 12, weight: '500' },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: `Design Effect by ICC (Cluster Size = ${m})`,
        color: textColor,
        font: { size: 16, weight: '600' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: '#E11D48',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            return `DEFF = ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Intraclass Correlation (ICC)',
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y: {
        title: {
          display: true,
          text: 'Design Effect',
          color: textColor,
          font: { size: 12, weight: '500' }
        },
        ticks: { color: textColor },
        grid: { color: gridColor },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: '350px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default PowerCurveChart;
