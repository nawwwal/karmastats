import { lazy, Suspense } from 'react';
import { ClientOnly } from '../common';

const ChartFallback = () => (
  <div className="chart-placeholder" aria-hidden="true" />
);

const withClientOnly = (LazyComponent) => {
  const Wrapped = (props) => (
    <ClientOnly fallback={<ChartFallback />}>
      <Suspense fallback={<ChartFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </ClientOnly>
  );

  return Wrapped;
};

const LazyPowerCurveChart = lazy(() => import('./SensitivityChart').then((mod) => ({ default: mod.PowerCurveChart })));
const LazyEffectSizeBarChart = lazy(() => import('./SensitivityChart').then((mod) => ({ default: mod.EffectSizeBarChart })));
const LazySurvivalCurveChart = lazy(() => import('./SensitivityChart').then((mod) => ({ default: mod.SurvivalCurveChart })));
const LazyForestPlotChart = lazy(() => import('./SensitivityChart').then((mod) => ({ default: mod.ForestPlotChart })));
const LazyBayesianChart = lazy(() => import('./SensitivityChart').then((mod) => ({ default: mod.BayesianChart })));
const LazyAgreementChart = lazy(() => import('./SensitivityChart').then((mod) => ({ default: mod.AgreementChart })));
const LazyDesignEffectChart = lazy(() => import('./SensitivityChart').then((mod) => ({ default: mod.DesignEffectChart })));

export const PowerCurveChart = withClientOnly(LazyPowerCurveChart);
export const EffectSizeBarChart = withClientOnly(LazyEffectSizeBarChart);
export const SurvivalCurveChart = withClientOnly(LazySurvivalCurveChart);
export const ForestPlotChart = withClientOnly(LazyForestPlotChart);
export const BayesianChart = withClientOnly(LazyBayesianChart);
export const AgreementChart = withClientOnly(LazyAgreementChart);
export const DesignEffectChart = withClientOnly(LazyDesignEffectChart);
