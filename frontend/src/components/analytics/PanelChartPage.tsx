import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ResponsiveContainer, Legend,
} from 'recharts';
import { useLang } from '../../i18n/LangContext';
import { getPanelName, getAnalysisName } from '../../utils/analysis';
import type { Panel, Result, Analysis } from '../../types';

interface LineConfig {
  loinc: string;
  color: string;
  yAxisId: string;
}

interface DataPoint {
  date: string;
  [key: string]: number | string | null;
}

interface Props {
  panel: Panel;
  lines: LineConfig[];
  resultsByLoinc: Record<string, { date: string; result: Result }[]>;
  analysesCatalog: Record<string, Analysis>;
  onBack: () => void;
}

export function PanelChartPage({ panel, lines, resultsByLoinc, analysesCatalog, onBack }: Props) {
  const { t, lang } = useLang();

  // Build combined dataset
  const { chartData, refRanges, units } = useMemo(() => {
    const byDate: Record<string, Record<string, Result>> = {};

    for (const line of lines) {
      const entries = resultsByLoinc[line.loinc] || [];
      for (const entry of entries) {
        if (!byDate[entry.date]) byDate[entry.date] = {};
        byDate[entry.date][line.loinc] = entry.result;
      }
    }

    const dates = Object.keys(byDate).sort();
    const data: DataPoint[] = dates.map(date => {
      const row: DataPoint = { date: date.slice(0, 7) };
      for (const line of lines) {
        const r = byDate[date]?.[line.loinc];
        row[line.loinc] = r?.value ?? null;
      }
      return row;
    });

    const refs: Record<string, { min: number | null; max: number | null }> = {};
    const unitMap: Record<string, string> = {};
    for (const dateResults of Object.values(byDate)) {
      for (const line of lines) {
        const r = dateResults[line.loinc];
        if (r && !refs[line.loinc]) {
          refs[line.loinc] = { min: r.refMin, max: r.refMax };
          unitMap[line.loinc] = r.unit || '';
        }
      }
    }

    return { chartData: data, refRanges: refs, units: unitMap };
  }, [lines, resultsByLoinc]);

  // Compute Y domains
  const getRange = (axisLines: LineConfig[]) => {
    let min = Infinity, max = -Infinity;
    for (const row of chartData) {
      for (const line of axisLines) {
        const v = row[line.loinc] as number | null;
        if (v != null) { min = Math.min(min, v); max = Math.max(max, v); }
        const ref = refRanges[line.loinc];
        if (ref?.min != null) min = Math.min(min, ref.min);
        if (ref?.max != null) max = Math.max(max, ref.max);
      }
    }
    if (!isFinite(min)) return [0, 10];
    const pad = (max - min) * 0.15 || 0.5;
    return [Math.max(0, min - pad), max + pad];
  };

  const leftLines = lines.filter(l => l.yAxisId === 'left');
  const rightLines = lines.filter(l => l.yAxisId === 'right');
  const [leftMin, leftMax] = getRange(leftLines);
  const [rightMin, rightMax] = getRange(rightLines.length > 0 ? rightLines : leftLines);

  const leftUnits = [...new Set(leftLines.map(l => units[l.loinc]).filter(Boolean))].join(', ');
  const rightUnits = [...new Set(rightLines.map(l => units[l.loinc]).filter(Boolean))].join(', ');
  const hasRightAxis = rightLines.length > 0;

  // Filter to only lines that have data
  const activeLines = lines.filter(l => resultsByLoinc[l.loinc]?.length > 0);

  if (chartData.length === 0) {
    return (
      <div>
        <button className="btn-back" onClick={onBack}>{t('back')}</button>
        <h2 className="section-title">{getPanelName(panel, lang)}</h2>
        <div className="empty-state">{t('noResults')}</div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn-back" onClick={onBack}>{t('back')}</button>
      <h2 className="section-title">{getPanelName(panel, lang)}</h2>

      <div className="panel-chart-group" style={{ '--panel-color': panel.color || '#d1d5db' } as React.CSSProperties}>
        <div className="panel-chart-body">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 12, right: 12, bottom: 4, left: -4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              {/* Reference areas */}
              {activeLines.map(line => {
                const ref = refRanges[line.loinc];
                if (!ref?.min || !ref?.max) return null;
                return (
                  <ReferenceArea
                    key={`ref-${line.loinc}`}
                    yAxisId={line.yAxisId}
                    y1={ref.min}
                    y2={ref.max}
                    fill={line.color}
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
                label={leftUnits ? { value: leftUnits, angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#9ca3af' }, offset: 10 } : undefined}
              />
              {hasRightAxis && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[rightMin, rightMax]}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  label={rightUnits ? { value: rightUnits, angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#9ca3af' }, offset: 10 } : undefined}
                />
              )}
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />

              {activeLines.map(line => (
                <Line
                  key={line.loinc}
                  type="monotone"
                  dataKey={line.loinc}
                  yAxisId={line.yAxisId}
                  name={getAnalysisName(line.loinc, analysesCatalog, lang)}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: line.color, stroke: 'white', strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                  label={{ position: 'top', fontSize: 10, fill: line.color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
