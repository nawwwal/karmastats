// Publication-style forest plot as dependency-free SVG.
// Each study: a square sized by its model weight at the point estimate with a
// 95% CI whisker; the pooled estimate is the standard diamond whose tips span
// its 95% CI; dashed vertical line marks the null (0). Colors come from the
// page theme via CSS variables, so light/dark both work.

const W = 780;
const LABEL_X = 8, PLOT_X0 = 168, PLOT_X1 = 528, STAT_X = 542, WEIGHT_X = 772;
const ROW_H = 30, HEADER_H = 26, POOLED_H = 36, AXIS_H = 40, TOP_PAD = 6;

function niceTicks(lo, hi, target = 5) {
  const span = hi - lo;
  if (!(span > 0) || !Number.isFinite(span)) return [lo];
  const step0 = span / (target - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const ticks = [];
  // epsilon relative to the step (an absolute 1e-12 made microscopic domains
  // spin this loop unboundedly) and a hard cap as the loop's safety net
  const eps = step * 1e-6;
  for (let t = Math.ceil(lo / step) * step; t <= hi + eps && ticks.length < 12; t += step) {
    ticks.push(Number(t.toPrecision(12)));
  }
  return ticks;
}

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : '—');

function truncate(name, max = 20) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

export function ForestPlot({ data }) {
  if (!data || !data.studies || !data.studies.length || !data.pooled) return null;
  const { studies, pooled } = data;
  const k = studies.length;

  // domain from the data (all study + pooled CIs); the null line at 0 is
  // included only when it is near the data — anchoring at 0 unconditionally
  // crushed plots whose effects sit far from zero (e.g. mean differences ~25)
  let lo = Infinity, hi = -Infinity;
  for (const s of studies) { if (s.lower < lo) lo = s.lower; if (s.upper > hi) hi = s.upper; }
  if (pooled.lower < lo) lo = pooled.lower;
  if (pooled.upper > hi) hi = pooled.upper;
  const span0 = (hi - lo) || Math.abs(hi) || 1;
  if (lo > 0 && lo <= span0 * 0.5) lo = 0;
  if (hi < 0 && -hi <= span0 * 0.5) hi = 0;
  const pad = (hi - lo || 1) * 0.06;
  lo -= pad; hi += pad;
  const sx = (v) => PLOT_X0 + ((v - lo) / (hi - lo)) * (PLOT_X1 - PLOT_X0);

  const height = TOP_PAD + HEADER_H + k * ROW_H + POOLED_H + AXIS_H;
  const rowY = (i) => TOP_PAD + HEADER_H + i * ROW_H + ROW_H / 2;
  const pooledY = TOP_PAD + HEADER_H + k * ROW_H + POOLED_H / 2;
  const axisY = TOP_PAD + HEADER_H + k * ROW_H + POOLED_H + 12;
  const ticks = niceTicks(lo, hi);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="forest-svg" role="img"
      aria-label={`Forest plot of ${k} studies with pooled estimate ${f2(pooled.effect)}`}
      style={{ width: '100%', maxWidth: `${W}px`, height: 'auto', display: 'block', color: 'var(--text-secondary, #475569)' }}>

      {/* header */}
      <text x={LABEL_X} y={TOP_PAD + 16} fontSize="11.5" fontWeight="700" fill="currentColor">Study</text>
      <text x={STAT_X} y={TOP_PAD + 16} fontSize="11.5" fontWeight="700" fill="currentColor">Effect [95% CI]</text>
      <text x={WEIGHT_X} y={TOP_PAD + 16} fontSize="11.5" fontWeight="700" fill="currentColor" textAnchor="end">Weight</text>
      <line x1={LABEL_X} y1={TOP_PAD + HEADER_H - 3} x2={W - 8} y2={TOP_PAD + HEADER_H - 3} stroke="currentColor" strokeOpacity="0.35" />

      {/* null line at 0 (only if inside the domain) */}
      {lo < 0 && hi > 0 && (
        <line x1={sx(0)} y1={TOP_PAD + HEADER_H} x2={sx(0)} y2={axisY - 8}
          stroke="currentColor" strokeOpacity="0.45" strokeDasharray="4 4" />
      )}

      {/* study rows */}
      {studies.map((s, i) => {
        const y = rowY(i);
        const side = Math.min(20, Math.max(7, 7 + (s.weightPct / 100) * 13 * Math.sqrt(k)));
        return (
          <g key={`${s.name}-${i}`}>
            <text x={LABEL_X} y={y + 4} fontSize="11.5" fill="currentColor">
              {truncate(s.name)}<title>{s.name}</title>
            </text>
            <line x1={sx(s.lower)} y1={y} x2={sx(s.upper)} y2={y} stroke="currentColor" strokeWidth="1.4" />
            <line x1={sx(s.lower)} y1={y - 4} x2={sx(s.lower)} y2={y + 4} stroke="currentColor" strokeWidth="1.4" />
            <line x1={sx(s.upper)} y1={y - 4} x2={sx(s.upper)} y2={y + 4} stroke="currentColor" strokeWidth="1.4" />
            <rect x={sx(s.effect) - side / 2} y={y - side / 2} width={side} height={side}
              fill="var(--primary, #4F46E5)" fillOpacity="0.9">
              <title>{`${s.name}: ${f2(s.effect)} [${f2(s.lower)}, ${f2(s.upper)}], weight ${s.weightPct.toFixed(1)}%`}</title>
            </rect>
            <text x={STAT_X} y={y + 4} fontSize="11" fill="currentColor">
              {`${f2(s.effect)} [${f2(s.lower)}, ${f2(s.upper)}]`}
            </text>
            <text x={WEIGHT_X} y={y + 4} fontSize="11" fill="currentColor" textAnchor="end">
              {`${s.weightPct.toFixed(1)}%`}
            </text>
          </g>
        );
      })}

      {/* pooled diamond */}
      <line x1={LABEL_X} y1={pooledY - POOLED_H / 2 + 2} x2={W - 8} y2={pooledY - POOLED_H / 2 + 2}
        stroke="currentColor" strokeOpacity="0.35" />
      <text x={LABEL_X} y={pooledY + 4} fontSize="11.5" fontWeight="700" fill="currentColor">{pooled.label}</text>
      <polygon
        points={`${sx(pooled.lower)},${pooledY} ${sx(pooled.effect)},${pooledY - 8} ${sx(pooled.upper)},${pooledY} ${sx(pooled.effect)},${pooledY + 8}`}
        fill="var(--primary, #4F46E5)">
        <title>{`${pooled.label}: ${f2(pooled.effect)} [${f2(pooled.lower)}, ${f2(pooled.upper)}]`}</title>
      </polygon>
      <text x={STAT_X} y={pooledY + 4} fontSize="11" fontWeight="700" fill="currentColor">
        {`${f2(pooled.effect)} [${f2(pooled.lower)}, ${f2(pooled.upper)}]`}
      </text>

      {/* x axis */}
      <line x1={PLOT_X0} y1={axisY - 8} x2={PLOT_X1} y2={axisY - 8} stroke="currentColor" strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} y1={axisY - 8} x2={sx(t)} y2={axisY - 3} stroke="currentColor" strokeWidth="1" />
          <text x={sx(t)} y={axisY + 9} fontSize="10.5" fill="currentColor" textAnchor="middle">
            {Math.abs(t) < 1e-10 ? '0' : String(t)}
          </text>
        </g>
      ))}
      <text x={(PLOT_X0 + PLOT_X1) / 2} y={axisY + 24} fontSize="11" fill="currentColor" textAnchor="middle">
        Effect size
      </text>
    </svg>
  );
}

export default ForestPlot;
