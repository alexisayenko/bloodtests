import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ResponsiveContainer, Legend,
} from 'recharts';
import { useLang } from '../../i18n/LangContext';
import { useData } from '../../data/DataContext';
import { useAuth } from '../../auth/AuthContext';
import { getAnalysisName } from '../../utils/analysis';
import type { ResultGroup, Result } from '../../types';

// Thyroid panel LOINC codes
const THYROID_LOINCS = [
  { loinc: '11580-8', color: '#2563eb', yAxisId: 'left' },   // TSH (µIU/mL, ~0.4-5)
  { loinc: '3051-0', color: '#dc2626', yAxisId: 'right' },   // FT3 (pg/mL, ~1.7-3.7)
  { loinc: '3024-7', color: '#eab308', yAxisId: 'right' },   // FT4 (ng/dL, ~0.7-2.0)
];

interface DataPoint {
  date: string;
  [key: string]: number | string | null;
}

interface Props {
  sessions: ResultGroup[];
  loading: boolean;
}

export function AnalyticsPage({ sessions, loading }: Props) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { analysesCatalog } = useData();

  // Build combined dataset: one row per date, columns per biomarker
  const { chartData, refRanges, units } = useMemo(() => {
    // Collect all results by date and loinc
    const byDate: Record<string, Record<string, Result>> = {};
    for (const session of sessions) {
      if (!session.items) continue;
      for (const r of session.items) {
        if (!r.loinc || r.value == null) continue;
        if (!THYROID_LOINCS.find(t => t.loinc === r.loinc)) continue;
        if (!byDate[session.date]) byDate[session.date] = {};
        byDate[session.date][r.loinc] = r;
      }
    }

    // Build chart data sorted by date
    const dates = Object.keys(byDate).sort();
    const data: DataPoint[] = dates.map(date => {
      const row: DataPoint = { date: date.slice(0, 7) }; // YYYY-MM
      for (const t of THYROID_LOINCS) {
        const r = byDate[date]?.[t.loinc];
        row[t.loinc] = r?.value ?? null;
      }
      return row;
    });

    // Get reference ranges from any result
    const refs: Record<string, { min: number | null; max: number | null }> = {};
    const unitMap: Record<string, string> = {};
    for (const dateResults of Object.values(byDate)) {
      for (const t of THYROID_LOINCS) {
        const r = dateResults[t.loinc];
        if (r && !refs[t.loinc]) {
          refs[t.loinc] = { min: r.refMin, max: r.refMax };
          unitMap[t.loinc] = r.unit || '';
        }
      }
    }

    return { chartData: data, refRanges: refs, units: unitMap };
  }, [sessions]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) {
    return (
      <div>
        <h2 className="section-title">Analytics</h2>
        <div className="empty-state">{t('signIn')} to view analytics.</div>
      </div>
    );
  }

  // Compute Y domains
  const leftLoincs = THYROID_LOINCS.filter(t => t.yAxisId === 'left');
  const rightLoincs = THYROID_LOINCS.filter(t => t.yAxisId === 'right');

  const getRange = (loincs: typeof THYROID_LOINCS) => {
    let min = Infinity, max = -Infinity;
    for (const row of chartData) {
      for (const t of loincs) {
        const v = row[t.loinc] as number | null;
        if (v != null) { min = Math.min(min, v); max = Math.max(max, v); }
        const ref = refRanges[t.loinc];
        if (ref?.min != null) min = Math.min(min, ref.min);
        if (ref?.max != null) max = Math.max(max, ref.max);
      }
    }
    const pad = (max - min) * 0.15 || 0.5;
    return [Math.max(0, min - pad), max + pad];
  };

  const [leftMin, leftMax] = getRange(leftLoincs);
  const [rightMin, rightMax] = getRange(rightLoincs);

  // Build left axis label
  const leftUnits = [...new Set(leftLoincs.map(t => units[t.loinc]).filter(Boolean))].join(', ');
  const rightUnits = [...new Set(rightLoincs.map(t => units[t.loinc]).filter(Boolean))].join(', ');

  return (
    <div>
      <h2 className="section-title">Analytics</h2>

      <div className="panel-chart-group" style={{ '--panel-color': '#FFF2CC' } as React.CSSProperties}>
        <div className="panel-chart-header">
          <span>Thyroid Function</span>
        </div>
        <div className="panel-chart-body">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 12, right: 12, bottom: 4, left: -4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              {/* Reference areas for each biomarker */}
              {leftLoincs.map(t => {
                const ref = refRanges[t.loinc];
                if (!ref?.min || !ref?.max) return null;
                return (
                  <ReferenceArea
                    key={`ref-${t.loinc}`}
                    yAxisId="left"
                    y1={ref.min}
                    y2={ref.max}
                    fill={t.color}
                    fillOpacity={0.06}
                    strokeOpacity={0}
                  />
                );
              })}

              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="left"
                domain={[leftMin, leftMax]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                width={50}
                label={{ value: leftUnits, angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#9ca3af' }, offset: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[rightMin, rightMax]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                width={50}
                label={{ value: rightUnits, angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#9ca3af' }, offset: 10 }}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
              />

              {THYROID_LOINCS.map(t => (
                <Line
                  key={t.loinc}
                  type="monotone"
                  dataKey={t.loinc}
                  yAxisId={t.yAxisId}
                  name={getAnalysisName(t.loinc, analysesCatalog, lang)}
                  stroke={t.color}
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: t.color, stroke: 'white', strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                  label={{ position: 'top', fontSize: 10, fill: t.color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
