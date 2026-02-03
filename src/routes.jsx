import { Fragment } from 'react';
import SEO from './components/SEO';
import { routesMeta } from './routeMeta';
import {
  Home,
  Contact,
  Support,
  References,
  DescriptiveCalculator,
  TTestCalculator,
  ComparativeCalculator,
  DiagnosticCalculator,
  ClinicalTrialsCalculator,
  SurvivalCalculator,
  PowerCalculator,
  EffectSizeCalculator,
  MetaAnalysisCalculator,
  ClusterCalculator,
  BayesianCalculator,
  AgreementCalculator,
  ReportGenerator,
  SensitivityAnalysis,
  Checklists,
  NotFound,
  Test
} from './pages';

function RouteLayout({ element, meta }) {
  return (
    <Fragment>
      <SEO meta={meta} />
      {element}
    </Fragment>
  );
}

const elementMap = new Map([
  ['/', <Home />],
  ['/calculator/descriptive', <DescriptiveCalculator />],
  ['/calculator/ttest', <TTestCalculator />],
  ['/calculator/comparative', <ComparativeCalculator />],
  ['/calculator/diagnostic', <DiagnosticCalculator />],
  ['/calculator/clinical-trials', <ClinicalTrialsCalculator />],
  ['/calculator/survival', <SurvivalCalculator />],
  ['/calculator/power-analysis', <PowerCalculator />],
  ['/calculator/effect-size', <EffectSizeCalculator />],
  ['/calculator/meta-analysis', <MetaAnalysisCalculator />],
  ['/calculator/cluster-multilevel', <ClusterCalculator />],
  ['/calculator/bayesian', <BayesianCalculator />],
  ['/calculator/agreement', <AgreementCalculator />],
  ['/tools/report-generator', <ReportGenerator />],
  ['/tools/sensitivity-analysis', <SensitivityAnalysis />],
  ['/tools/checklists', <Checklists />],
  ['/references', <References />],
  ['/contact', <Contact />],
  ['/support', <Support />],
  ['/test', <Test />],
  ['*', <NotFound />]
]);

export const routes = routesMeta.map((meta) => ({
  path: meta.path,
  element: (
    <RouteLayout
      meta={meta}
      element={elementMap.get(meta.path) || <NotFound />}
    />
  ),
  meta
}));

export default routes;
