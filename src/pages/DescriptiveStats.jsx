import { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, LineController, Title, Tooltip, Legend,
} from 'chart.js';
import { CalculatorHeader, SimpleFooter, ThemeToggle } from '../components/common';
import {
  describeNumeric, describeCategorical, assessNormality, inferType, isContinuousType,
  recommendTest, qnorm, quantile, generateRCode, generatePythonCode,
  normTest, tukeyOutliers, transformAdvisor, reportSentences,
} from '../utils/descriptiveStats';
import './DescriptiveStats.css';

// LineController is required for the mixed type:'line' datasets (Q–Q reference
// line, normal-fit overlay) — <Bar>/<Scatter> only auto-register their own.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, LineController, Title, Tooltip, Legend);

const NAV_LINKS = [
  { to: '/', label: 'Back to Main' },
  { to: '/calculator/descriptive', label: 'Sample Size' },
  { to: '/references', label: 'References' },
];

const TYPE_LABEL = {
  continuous: 'Continuous', count: 'Count', binary: 'Binary',
  categorical: 'Categorical', 'categorical-numeric': 'Categorical (coded)',
  date: 'Date', id: 'ID', empty: 'Empty',
};

// Static chart options — animations off, resize debounced and canvas
// resolution capped so large uploads don't spin the fan; defined at module
// level for a stable identity. maintainAspectRatio:false REQUIRES the canvas
// to sit inside a position:relative wrapper with a fixed height (.chart-wrap),
// otherwise Chart.js enters a grow-forever resize loop.
const chartOpts = (title, xt, yt) => ({
  responsive: true, maintainAspectRatio: false,
  animation: false, normalized: true, devicePixelRatio: 1.5, resizeDelay: 200,
  plugins: {
    legend: { display: true, labels: { boxWidth: 14, font: { size: 11 } } },
    title: { display: !!title, text: title, font: { size: 14 } },
  },
  scales: {
    x: { title: { display: true, text: xt }, type: title === 'Q–Q Plot' ? 'linear' : 'category' },
    y: { title: { display: true, text: yt }, beginAtZero: title !== 'Q–Q Plot' },
  },
});

function fmt(x, d = 3) {
  if (x === undefined || x === null || Number.isNaN(x)) return '—';
  if (!Number.isFinite(x)) return '—';
  return Number(x).toLocaleString(undefined, { maximumFractionDigits: d });
}

// Freedman–Diaconis bins, Sturges fallback
function histogram(desc) {
  const { values, sorted, n, iqr } = desc;
  let bins = Math.ceil(Math.log2(n) + 1);
  if (iqr > 0) {
    const bw = 2 * iqr / Math.cbrt(n);
    if (bw > 0) bins = Math.max(5, Math.min(40, Math.ceil((sorted[n - 1] - sorted[0]) / bw)));
  }
  const min = sorted[0], max = sorted[n - 1];
  const width = (max - min) / bins || 1;
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    let b = Math.floor((v - min) / width);
    if (b >= bins) b = bins - 1;
    if (b < 0) b = 0;
    counts[b]++;
  }
  const centers = counts.map((_, i) => min + (i + 0.5) * width);
  // enough decimals for the bin width, so narrow-range data don't all label "0.0"
  const dec = width >= 10 ? 0 : width >= 1 ? 1 : Math.min(6, Math.ceil(-Math.log10(width)) + 1);
  const labels = centers.map((c) => c.toFixed(dec));
  return { labels, counts, centers, width };
}

// Q–Q plot points: (theoretical normal quantile, sample value), plus a robust ref line.
// For large n the MIDDLE of the distribution is downsampled to quantile points, but
// the QQ_TAIL_K most extreme observations in EACH tail are always plotted exactly —
// the tails are precisely where a Q–Q plot diagnoses non-normality, so they must
// never be smoothed away.
const QQ_MAX_POINTS = 100;
const QQ_TAIL_K = 10;
function qqData(desc) {
  const { sorted, n, mean, sd } = desc;
  let pts;
  const downsampled = n > QQ_MAX_POINTS;
  if (downsampled) {
    pts = [];
    // exact lower-tail order statistics at their true plotting positions
    for (let i = 0; i < QQ_TAIL_K; i++) pts.push({ x: qnorm((i + 0.5) / n), y: sorted[i] });
    // evenly spaced quantiles across the middle only
    const mid = QQ_MAX_POINTS - 2 * QQ_TAIL_K;
    const pLo = (QQ_TAIL_K + 0.5) / n, pHi = 1 - pLo;
    for (let i = 0; i < mid; i++) {
      const p = pLo + ((i + 0.5) / mid) * (pHi - pLo);
      pts.push({ x: qnorm(p), y: quantile(sorted, p) });
    }
    // exact upper-tail order statistics
    for (let i = n - QQ_TAIL_K; i < n; i++) pts.push({ x: qnorm((i + 0.5) / n), y: sorted[i] });
  } else {
    pts = sorted.map((v, i) => ({ x: qnorm((i + 0.5) / n), y: v }));
  }
  // reference line through the first and third theoretical/observed quartiles
  const q1t = qnorm(0.25), q3t = qnorm(0.75);
  const q1o = quantile(sorted, 0.25), q3o = quantile(sorted, 0.75);
  const slope = (q3o - q1o) / (q3t - q1t);
  const intercept = q1o - slope * q1t;
  const xmin = pts[0].x, xmax = pts[pts.length - 1].x;
  const line = [{ x: xmin, y: intercept + slope * xmin }, { x: xmax, y: intercept + slope * xmax }];
  return { pts, line, mean, sd, downsampled };
}

// Lightweight horizontal box plot as plain SVG — no chart library, no canvas.
// Outlier dots are capped at 60 per class so a pathological column can't
// bloat the DOM.
function BoxPlot({ o }) {
  const W = 640, H = 88, padX = 18, mid = 40, boxH = 30, capH = 18;
  const span = (o.max - o.min) || 1;
  const sx = (v) => {
    const t = (v - o.min) / span;
    return padX + (Number.isFinite(t) ? Math.min(Math.max(t, 0), 1) : 0.5) * (W - 2 * padX);
  };
  const cap = (arr, k = 60) => (arr.length <= k ? arr : arr.filter((_, i) => i % Math.ceil(arr.length / k) === 0));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="boxplot-svg" role="img" aria-label="Box plot with Tukey outliers">
      <line x1={sx(o.whiskerLow)} y1={mid} x2={sx(o.q1)} y2={mid} stroke="currentColor" strokeWidth="1.5" />
      <line x1={sx(o.q3)} y1={mid} x2={sx(o.whiskerHigh)} y2={mid} stroke="currentColor" strokeWidth="1.5" />
      <line x1={sx(o.whiskerLow)} y1={mid - capH / 2} x2={sx(o.whiskerLow)} y2={mid + capH / 2} stroke="currentColor" strokeWidth="1.5" />
      <line x1={sx(o.whiskerHigh)} y1={mid - capH / 2} x2={sx(o.whiskerHigh)} y2={mid + capH / 2} stroke="currentColor" strokeWidth="1.5" />
      <rect x={sx(o.q1)} y={mid - boxH / 2} width={Math.max(sx(o.q3) - sx(o.q1), 1)} height={boxH}
        fill="rgba(20,184,166,0.25)" stroke="#0F766E" strokeWidth="1.5" rx="3" />
      <line x1={sx(o.median)} y1={mid - boxH / 2} x2={sx(o.median)} y2={mid + boxH / 2} stroke="#0F766E" strokeWidth="3" />
      {cap(o.mild).map((v, i) => (
        <circle key={`m${i}`} cx={sx(v)} cy={mid} r="3.5" fill="none" stroke="#F59E0B" strokeWidth="1.8"><title>{`Mild outlier: ${v}`}</title></circle>
      ))}
      {cap(o.extreme).map((v, i) => (
        <circle key={`e${i}`} cx={sx(v)} cy={mid} r="3.5" fill="#DC2626"><title>{`Extreme outlier: ${v}`}</title></circle>
      ))}
      <text x={padX} y={H - 10} fontSize="11" fill="currentColor">{fmt(o.min)}</text>
      <text x={sx(o.median)} y={H - 10} fontSize="11" fill="currentColor" textAnchor="middle">{`median ${fmt(o.median)}`}</text>
      <text x={W - padX} y={H - 10} fontSize="11" fill="currentColor" textAnchor="end">{fmt(o.max)}</text>
    </svg>
  );
}

// Show at most a handful of outlier values as text
function listVals(arr, k = 6) {
  if (!arr.length) return '—';
  const shown = arr.slice(0, k).map((v) => fmt(v)).join(', ');
  return arr.length > k ? `${shown} … +${arr.length - k} more` : shown;
}

// Clipboard with fallback — navigator.clipboard is undefined off secure contexts
function copyText(t) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t); return; }
  } catch { /* fall through */ }
  const ta = document.createElement('textarea');
  ta.value = t;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

// Plain machine-readable number for CSV cells — fmt() uses toLocaleString,
// whose grouping commas would corrupt the CSV columns (e.g. en-IN "1,23,456")
function csvNum(v, d = 4) {
  return Number.isFinite(v) ? String(Number(v.toFixed(d))) : '';
}

// Per-file analysis cache, keyed by the columns array identity: loading a new
// file creates a new array, so stale caches are garbage-collected on their own.
const analysisCaches = new WeakMap();

export function DescriptiveStats() {
  const [columns, setColumns] = useState(null);   // [{name, values, type}]
  const [rows, setRows] = useState(0);
  const [fileName, setFileName] = useState('');
  const [selected, setSelected] = useState(null); // column name
  const [error, setError] = useState('');
  const [design, setDesign] = useState('one-sample');
  const [axis, setAxis] = useState({ hist: { x: 'Value', y: 'Frequency' }, qq: { x: 'Theoretical quantiles', y: 'Sample quantiles' } });
  const histRef = useRef(null);
  const qqRef = useRef(null);

  const handleFile = async (file) => {
    setError(''); setSelected(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const arr = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!arr.length) { setError('The sheet appears to be empty.'); return; }
      const header = arr[0].map((h, i) => (h === '' ? `Column ${i + 1}` : String(h)));
      const body = arr.slice(1).filter((r) => r.some((c) => c !== '' && c !== null && c !== undefined));
      const cols = header.map((name, i) => {
        const values = body.map((r) => r[i]);
        return { name, values, type: inferType(values, name) };
      });
      setColumns(cols); setRows(body.length); setFileName(file.name);
      const firstNumeric = cols.find((c) => isContinuousType(c.type));
      setSelected(firstNumeric ? firstNumeric.name : cols[0]?.name || null);
    } catch (e) {
      setError('Could not read the file: ' + e.message);
    }
  };

  const col = useMemo(() => columns?.find((c) => c.name === selected) || null, [columns, selected]);
  const isNum = col && isContinuousType(col.type);

  // Full per-column battery, computed once per column and cached across chip
  // switches (cache cleared on each new file in handleFile). Everything heavy
  // — sort, Shapiro–Wilk, outliers, transform advisor — lives here, so typing
  // in axis inputs or changing the design dropdown never recomputes any of it.
  const analysis = useMemo(() => {
    if (!col || !columns) return null;
    let cache = analysisCaches.get(columns);
    if (!cache) { cache = new Map(); analysisCaches.set(columns, cache); }
    const hit = cache.get(col.name);
    if (hit) return hit;
    const numeric = isContinuousType(col.type);
    const desc = numeric ? describeNumeric(col.values) : null;
    const norm = numeric && desc && desc.n >= 3 ? assessNormality(col.values, desc) : null;
    const cat = !numeric ? describeCategorical(col.values) : null;
    const outliers = numeric && desc && desc.n >= 5 ? tukeyOutliers(col.values, desc.sorted) : null;
    const outlierSensitivity =
      outliers && outliers.mild.length + outliers.extreme.length > 0 && outliers.inliers.length >= 3
        ? normTest(outliers.inliers) : null;
    const transforms = numeric && desc && desc.n >= 8 && desc.sd > 0 ? transformAdvisor(col.values) : null;
    const bundle = { desc, norm, cat, outliers, outlierSensitivity, transforms };
    cache.set(col.name, bundle);
    return bundle;
  }, [col, columns]);
  const { desc = null, norm = null, cat = null, outliers = null, outlierSensitivity = null, transforms = null } = analysis || {};

  const hist = useMemo(() => (desc && desc.n >= 2 ? histogram(desc) : null), [desc]);
  const qq = useMemo(() => (desc && desc.n >= 3 ? qqData(desc) : null), [desc]);
  const rec = useMemo(() => (norm ? recommendTest({ design, groupsNormal: norm.isNormal }) : null), [norm, design]);
  const report = useMemo(
    () => (isNum && desc && norm ? reportSentences(selected, desc, norm) : null),
    [isNum, desc, norm, selected],
  );

  const groupsNormalKnown = norm && norm.isNormal !== null;

  const downloadCSV = () => {
    if (!columns) return;
    const q = (s) => (/[",\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : s);
    let out = 'Variable,Type,N,Missing,Mean,SD,SE,Median,Q1,Q3,IQR,Min,Max,Skewness,Kurtosis,ShapiroW,Shapiro_p,Normal?\n';
    for (const c of columns) {
      if (isContinuousType(c.type)) {
        const d = describeNumeric(c.values);
        const nz = d.n >= 3 ? assessNormality(c.values, d) : null;
        out += [q(c.name), c.type, d.n, d.missing, csvNum(d.mean), csvNum(d.sd), csvNum(d.se), csvNum(d.median),
          csvNum(d.q1), csvNum(d.q3), csvNum(d.iqr), csvNum(d.min), csvNum(d.max), csvNum(d.skewness), csvNum(d.kurtosis),
          nz?.shapiroWilk ? csvNum(nz.shapiroWilk.W) : '', nz?.shapiroWilk ? csvNum(nz.shapiroWilk.p) : '',
          nz && nz.isNormal !== null ? (nz.isNormal ? 'Yes' : 'No') : ''].join(',') + '\n';
      } else {
        const d = describeCategorical(c.values);
        out += [q(c.name), c.type, d.n, d.missing, '', '', '', '', '', '', '', '', '', '', '', '', '', ''].join(',') + '\n';
      }
    }
    const blob = new Blob([out], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (fileName.replace(/\.[^.]+$/, '') || 'data') + '_descriptives.csv';
    a.click();
  };

  const downloadChart = (ref, suffix) => {
    const chart = ref.current;
    if (!chart) return;
    const a = document.createElement('a');
    a.href = chart.toBase64Image();
    a.download = `${selected}_${suffix}.png`;
    a.click();
  };

  const histData = useMemo(() => {
    if (!hist) return null;
    const datasets = [{ label: selected, data: hist.counts, backgroundColor: 'rgba(20,184,166,0.6)', borderColor: '#0F766E', borderWidth: 1 }];
    if (desc && desc.sd > 0) {
      // expected bin count under N(mean, sd): n · binWidth · φ(binCenter)
      const k = desc.n * hist.width / (desc.sd * Math.sqrt(2 * Math.PI));
      const fitted = hist.centers.map((c) => k * Math.exp(-0.5 * ((c - desc.mean) / desc.sd) ** 2));
      datasets.push({ label: 'Normal fit', data: fitted, type: 'line', borderColor: '#F59E0B', borderWidth: 2, pointRadius: 0, cubicInterpolationMode: 'monotone', fill: false });
    }
    return { labels: hist.labels, datasets };
  }, [hist, desc, selected]);

  const qqChartData = useMemo(() => (qq ? {
    datasets: [
      { label: qq.downsampled ? `Data (${QQ_MAX_POINTS} quantiles)` : 'Data', data: qq.pts, backgroundColor: '#0F766E', pointRadius: 2 },
      { label: 'Reference line', data: qq.line, type: 'line', borderColor: '#F59E0B', borderWidth: 2, pointRadius: 0, fill: false },
    ],
  } : null), [qq]);

  const histOpts = useMemo(() => chartOpts('Histogram', axis.hist.x, axis.hist.y), [axis.hist.x, axis.hist.y]);
  const qqOpts = useMemo(() => chartOpts('Q–Q Plot', axis.qq.x, axis.qq.y), [axis.qq.x, axis.qq.y]);

  return (
    <div className="calculator-page theme-teal descstat-page">
      <CalculatorHeader
        title="Descriptive Statistics & Normality"
        subtitle="Upload an Excel/CSV sheet — assess normality first, then get calibrated descriptives, charts and the right test"
        navLinks={NAV_LINKS}
        themeClass="theme-teal"
      />

      <main className="container" style={{ padding: '2rem' }}>
        {/* Upload */}
        <section className="card">
          <div className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
            <input id="file" type="file" accept=".xlsx,.xls,.csv"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
            <label htmlFor="file" className="upload-label">
              <span className="upload-icon">📄</span>
              <strong>Click to upload</strong> or drag an Excel / CSV file here
              <small>.xlsx, .xls, .csv — the first row is treated as column names</small>
            </label>
          </div>
          {error && <p className="ds-error">{error}</p>}
          {columns && (
            <p className="ds-meta">
              <strong>{fileName}</strong> — {rows.toLocaleString()} rows × {columns.length} columns detected.
              <button className="btn btn-sm" onClick={downloadCSV} style={{ marginLeft: '1rem' }}>⬇ Export all descriptives (CSV)</button>
            </p>
          )}
        </section>

        {columns && (
          <section className="card">
            <h3 className="ds-h3">Variables</h3>
            <div className="var-grid">
              {columns.map((c) => (
                <button key={c.name} className={`var-chip ${selected === c.name ? 'active' : ''}`} onClick={() => setSelected(c.name)}>
                  <span className="var-name">{c.name}</span>
                  <span className={`var-type t-${c.type}`}>{TYPE_LABEL[c.type] || c.type}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* NORMALITY FIRST */}
        {isNum && desc && desc.n >= 3 && norm && (
          <section className="card ds-normality">
            <h3 className="ds-h3">① Normality assessment — <em>{selected}</em></h3>
            <div className="norm-grid">
              <div className={`norm-verdict ${norm.isNormal === null ? 'na' : norm.isNormal ? 'ok' : 'no'}`}>
                <div className="verdict-big">
                  {norm.isNormal === null ? 'Not testable' : norm.isNormal ? 'Approximately normal' : 'Not normal'}
                </div>
                <div className="verdict-sub">
                  {norm.primary
                    ? `${norm.primary.name}: p = ${fmt(norm.primary.p, 4)}`
                    : 'No valid test result — the column may be constant or have too few distinct values'}
                </div>
              </div>
              <table className="norm-table">
                <tbody>
                  {norm.shapiroWilk && Number.isFinite(norm.shapiroWilk.W) && (
                    <tr><td>Shapiro–Wilk</td><td>W = {fmt(norm.shapiroWilk.W, 4)}</td><td>p = {fmt(norm.shapiroWilk.p, 4)}</td></tr>
                  )}
                  {norm.dagostino && Number.isFinite(norm.dagostino.K2) && (
                    <tr><td>D'Agostino–Pearson</td><td>K² = {fmt(norm.dagostino.K2, 3)}</td><td>p = {fmt(norm.dagostino.p, 4)}</td></tr>
                  )}
                  <tr><td>Skewness</td><td colSpan={2}>{fmt(norm.skewness, 3)} {Math.abs(norm.skewness) > 1 ? '(marked)' : ''}</td></tr>
                  <tr><td>Excess kurtosis</td><td colSpan={2}>{fmt(norm.kurtosis, 3)}</td></tr>
                </tbody>
              </table>
            </div>
            {norm.note && <p className="ds-note">ℹ {norm.note}</p>}
          </section>
        )}

        {/* Charts */}
        {isNum && hist && qq && (
          <section className="card">
            <div className="ds-chart-head">
              <h3 className="ds-h3">② Distribution & Q–Q plot</h3>
              <div className="axis-editor">
                <label>Histogram X <input value={axis.hist.x} onChange={(e) => setAxis({ ...axis, hist: { ...axis.hist, x: e.target.value } })} /></label>
                <label>Histogram Y <input value={axis.hist.y} onChange={(e) => setAxis({ ...axis, hist: { ...axis.hist, y: e.target.value } })} /></label>
              </div>
            </div>
            <div className="chart-row">
              <div className="chart-box">
                <div className="chart-wrap"><Bar ref={histRef} data={histData} options={histOpts} /></div>
                <button className="btn btn-sm" onClick={() => downloadChart(histRef, 'histogram')}>⬇ PNG</button>
              </div>
              <div className="chart-box">
                <div className="chart-wrap"><Scatter ref={qqRef} data={qqChartData} options={qqOpts} /></div>
                {qq.downsampled && <small className="ds-meta">Q–Q shows the {QQ_TAIL_K} most extreme values in each tail exactly + {QQ_MAX_POINTS - 2 * QQ_TAIL_K} middle quantiles (tests use all {desc.n.toLocaleString()} values)</small>}
                <button className="btn btn-sm" onClick={() => downloadChart(qqRef, 'qqplot')}>⬇ PNG</button>
              </div>
            </div>
          </section>
        )}

        {/* Outlier check */}
        {isNum && outliers && (
          <section className="card">
            <h3 className="ds-h3">③ Outlier check — <em>{selected}</em></h3>
            <BoxPlot o={outliers} />
            <div className="outlier-grid">
              <div className="stat-cell">
                <span className="stat-k">Mild outliers (&gt; 1.5×IQR)</span>
                <span className="stat-v">{outliers.mild.length}</span>
                <span className="outlier-vals">{listVals(outliers.mild)}</span>
              </div>
              <div className="stat-cell">
                <span className="stat-k">Extreme outliers (&gt; 3×IQR)</span>
                <span className="stat-v">{outliers.extreme.length}</span>
                <span className="outlier-vals">{listVals(outliers.extreme)}</span>
              </div>
              <div className="stat-cell">
                <span className="stat-k">Tukey fences (inner)</span>
                <span className="stat-v">{fmt(outliers.innerLow)} – {fmt(outliers.innerHigh)}</span>
                <span className="outlier-vals">values outside are flagged</span>
              </div>
            </div>
            {outliers.mild.length + outliers.extreme.length === 0 ? (
              <p className="ds-note">No Tukey outliers detected — all values lie within Q1−1.5×IQR and Q3+1.5×IQR.</p>
            ) : outlierSensitivity ? (
              <p className="ds-note">
                <strong>Sensitivity:</strong> excluding the {outliers.mild.length + outliers.extreme.length} flagged
                value(s), {outlierSensitivity.name} gives {outlierSensitivity.label} = {fmt(outlierSensitivity.stat, 3)},
                p = {fmt(outlierSensitivity.p, 4)} → {outlierSensitivity.p >= 0.05 ? 'approximately normal without them' : 'still non-normal without them'}.
                ⚠ Exclude outliers only for a documented reason (data-entry error, protocol violation) — never merely to achieve normality.
              </p>
            ) : (
              <p className="ds-note">⚠ Outliers detected. Exclude them only for a documented reason (data-entry error, protocol violation) — never merely to achieve normality.</p>
            )}
          </section>
        )}

        {/* Transformation advisor */}
        {isNum && transforms && (
          <section className="card">
            <h3 className="ds-h3">④ Transformation advisor — <em>{selected}</em></h3>
            <table className="tf-table">
              <thead>
                <tr><th>Transformation</th><th>Test</th><th>Statistic</th><th>p-value</th><th>Skewness</th><th>Verdict</th></tr>
              </thead>
              <tbody>
                {transforms.rows.map((r) => (
                  <tr key={r.key} className={transforms.recommendation.best?.key === r.key ? 'best' : ''}>
                    <td>{r.label}{transforms.recommendation.best?.key === r.key ? ' ★' : ''}</td>
                    <td>{r.test.name}</td>
                    <td>{r.test.label} = {fmt(r.test.stat, 3)}</td>
                    <td>{r.test.p < 0.001 ? '< 0.001' : fmt(r.test.p, 4)}</td>
                    <td>{fmt(r.skewness, 2)}</td>
                    <td><span className={`tf-badge ${r.normal ? 'ok' : 'no'}`}>{r.normal ? '✓ Normal' : '✗ Non-normal'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="rec-out">
              {transforms.recommendation.type === 'none-needed' && (
                <span>The original data are already approximately normal — <strong>no transformation is needed</strong>; analyse untransformed.</span>
              )}
              {transforms.recommendation.type === 'transform' && (
                <span><strong>{transforms.recommendation.best.label}</strong> best normalises the distribution
                  ({transforms.recommendation.best.test.label} = {fmt(transforms.recommendation.best.test.stat, 3)},
                  p = {fmt(transforms.recommendation.best.test.p, 4)}). Run parametric tests on the transformed scale
                  {transforms.recommendation.best.key === 'log' ? ' and report geometric means when back-transforming' : ''}
                  {transforms.recommendation.best.key === 'recip'
                    ? '. ⚠ 1/x REVERSES ordering — the direction of any group difference or correlation flips on this scale, and the back-transformed mean is the harmonic mean'
                    : ''}.</span>
              )}
              {transforms.recommendation.type === 'nonparametric' && (
                <span>No simple transformation achieves approximate normality — <strong>prefer the non-parametric test</strong> recommended below and summarise with median (IQR).</span>
              )}
            </div>
            <p className="ds-note">Transformed analyses must be interpreted on the transformed scale; pre-specify any transformation in the protocol where possible.</p>
          </section>
        )}

        {/* Descriptives */}
        {isNum && desc && desc.n > 0 && (
          <section className="card">
            <h3 className="ds-h3">⑤ Descriptive statistics — <em>{selected}</em></h3>
            <div className="stat-grid">
              {[['N', desc.n], ['Missing', desc.missing], ['Mean', fmt(desc.mean)], ['SD', fmt(desc.sd)],
                ['SE', fmt(desc.se)], ['95% CI', `${fmt(desc.ci95[0])} – ${fmt(desc.ci95[1])}`],
                ['Median', fmt(desc.median)], ['IQR', `${fmt(desc.q1)} – ${fmt(desc.q3)}`],
                ['Min', fmt(desc.min)], ['Max', fmt(desc.max)], ['Skewness', fmt(desc.skewness)], ['Kurtosis', fmt(desc.kurtosis)]].map(([k, v]) => (
                <div className="stat-cell" key={k}><span className="stat-k">{k}</span><span className="stat-v">{v}</span></div>
              ))}
            </div>
          </section>
        )}

        {/* Categorical */}
        {cat && (
          <section className="card">
            <h3 className="ds-h3">Frequencies — <em>{selected}</em></h3>
            <table className="freq-table">
              <thead><tr><th>Level</th><th>Count</th><th>%</th></tr></thead>
              <tbody>
                {cat.levels.map((l) => <tr key={l.level}><td>{l.level}</td><td>{l.count}</td><td>{fmt(l.percent, 1)}%</td></tr>)}
              </tbody>
            </table>
            <p className="ds-meta">n = {cat.n}, missing = {cat.missing}, {cat.nLevels} levels, mode = {cat.mode}</p>
          </section>
        )}

        {/* Test recommendation */}
        {isNum && groupsNormalKnown && (
          <section className="card">
            <h3 className="ds-h3">⑥ Recommended test (from the normality result)</h3>
            <div className="rec-controls">
              <label>Comparison
                <select value={design} onChange={(e) => setDesign(e.target.value)}>
                  <option value="one-sample">One sample vs a value</option>
                  <option value="two-independent">Two independent groups</option>
                  <option value="paired">Paired / before–after</option>
                  <option value="multi-group">Three+ groups</option>
                  <option value="correlation">Correlation with another variable</option>
                </select>
              </label>
            </div>
            {rec && (
              <div className="rec-out">
                <strong>{rec.test}</strong>
                <span> — {rec.why}.</span>
                {rec.route && <a className="rec-link" href={rec.route}> Open the matching sample-size calculator →</a>}
              </div>
            )}
          </section>
        )}

        {/* Reproducible code */}
        {isNum && selected && (
          <section className="card">
            <h3 className="ds-h3">⑦ Report-ready text & reproducible code</h3>
            {report && (
              <div className="report-row">
                <div className="report-box">
                  <div className="code-head">Methods text <button className="btn btn-sm" onClick={() => copyText(report.methods)}>Copy</button></div>
                  <p>{report.methods}</p>
                </div>
                <div className="report-box">
                  <div className="code-head">Results text <button className="btn btn-sm" onClick={() => copyText(report.results)}>Copy</button></div>
                  <p>{report.results}</p>
                </div>
              </div>
            )}
            <div className="code-row">
              <div className="code-box">
                <div className="code-head">R <button className="btn btn-sm" onClick={() => copyText(generateRCode(selected))}>Copy</button></div>
                <pre>{generateRCode(selected)}</pre>
              </div>
              <div className="code-box">
                <div className="code-head">Python <button className="btn btn-sm" onClick={() => copyText(generatePythonCode(selected))}>Copy</button></div>
                <pre>{generatePythonCode(selected)}</pre>
              </div>
            </div>
          </section>
        )}
      </main>

      <SimpleFooter />
      <ThemeToggle variant="floating" />
    </div>
  );
}

export default DescriptiveStats;
