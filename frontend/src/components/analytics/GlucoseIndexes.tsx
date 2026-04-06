import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import type { Result } from '../../types';

interface Props {
  resultsByLoinc: Record<string, { date: string; result: Result }[]>;
}

interface IndexRow {
  date: string;
  dateLabel: string;
  glucose: number | null;
  insulin: number | null;
  insulinResistance: number | null;
  homaIR: number | null;
  homaBeta: number | null;
  quicki: number | null;
}

const GLUCOSE_LOINC = '2339-0';
const INSULIN_LOINC = '20448-7';

export function GlucoseIndexes({ resultsByLoinc }: Props) {
  const data = useMemo(() => {
    const glucoseEntries = resultsByLoinc[GLUCOSE_LOINC] || [];
    const insulinEntries = resultsByLoinc[INSULIN_LOINC] || [];

    // Index insulin by date
    const insulinByDate: Record<string, number> = {};
    for (const e of insulinEntries) {
      if (e.result.value != null) insulinByDate[e.date] = e.result.value;
    }

    // Build rows where we have both glucose and insulin on the same date
    const rows: IndexRow[] = [];
    for (const e of glucoseEntries) {
      const glu = e.result.value;
      const ins = insulinByDate[e.date];
      if (glu == null || ins == null) continue;

      // Convert glucose mg/dL to mmol/L for HOMA formulas
      const gluMmol = glu / 18.0;

      rows.push({
        date: e.date,
        dateLabel: e.date.slice(0, 7),
        glucose: glu,
        insulin: ins,
        insulinResistance: round(glu / ins, 2),
        homaIR: round((gluMmol * ins) / 22.5, 2),
        homaBeta: round((20 * ins) / (gluMmol - 3.5), 1),
        quicki: round(1 / (Math.log10(glu) + Math.log10(ins)), 4),
      });
    }

    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [resultsByLoinc]);

  if (data.length === 0) return null;

  const latest = data[data.length - 1];

  return (
    <div className="indexes-section">
      <div className="indexes-title">Calculated Indexes</div>

      <div className="indexes-cards">
        <IndexCard
          name="Insulin Resistance"
          formula="Glucose / Insulin"
          description="Simplified estimate of insulin sensitivity"
          value={latest.insulinResistance}
          unit=""
          normalRange="4–10"
        />
        <IndexCard
          name="HOMA-IR"
          formula="(Glucose mmol/L × Insulin) / 22.5"
          description="Standard model assessing hepatic insulin resistance"
          value={latest.homaIR}
          unit=""
          normalRange="< 2.5"
        />
        <IndexCard
          name="HOMA-β"
          formula="(20 × Insulin) / (Glucose mmol/L − 3.5)"
          description="Homeostatic model assessment for β-cell function"
          value={latest.homaBeta}
          unit="%"
          normalRange="80–200"
        />
        <IndexCard
          name="QUICKI"
          formula="1 / (log(Glucose) + log(Insulin))"
          description="Quantitative insulin sensitivity check index"
          value={latest.quicki}
          unit=""
          normalRange="> 0.34"
        />
      </div>

      {data.length > 1 && (
        <>
          <div style={{ marginTop: '16px' }}>
            <div className="indexes-subtitle">HOMA-IR & HOMA-β</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={45} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={45} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine yAxisId="left" y={2.5} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1} label={{ value: '2.5', position: 'left', fontSize: 10, fill: '#dc2626' }} />
                <Line type="monotone" dataKey="homaIR" yAxisId="left" name="HOMA-IR" stroke="#2563eb" strokeWidth={2} dot={{ r: 3.5, fill: '#2563eb', stroke: 'white', strokeWidth: 2 }} connectNulls label={{ position: 'top', fontSize: 10, fill: '#2563eb' }} />
                <Line type="monotone" dataKey="homaBeta" yAxisId="right" name="HOMA-β" stroke="#9333ea" strokeWidth={2} dot={{ r: 3.5, fill: '#9333ea', stroke: 'white', strokeWidth: 2 }} connectNulls label={{ position: 'top', fontSize: 10, fill: '#9333ea' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '16px' }}>
            <div className="indexes-subtitle">Insulin Resistance & QUICKI</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={45} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={45} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine yAxisId="right" y={0.34} stroke="#16a34a" strokeDasharray="4 4" strokeWidth={1} label={{ value: '0.34', position: 'right', fontSize: 10, fill: '#16a34a' }} />
                <Line type="monotone" dataKey="insulinResistance" yAxisId="left" name="Insulin Resistance" stroke="#f97316" strokeWidth={2} dot={{ r: 3.5, fill: '#f97316', stroke: 'white', strokeWidth: 2 }} connectNulls label={{ position: 'top', fontSize: 10, fill: '#f97316' }} />
                <Line type="monotone" dataKey="quicki" yAxisId="right" name="QUICKI" stroke="#16a34a" strokeWidth={2} dot={{ r: 3.5, fill: '#16a34a', stroke: 'white', strokeWidth: 2 }} connectNulls label={{ position: 'top', fontSize: 10, fill: '#16a34a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function round(n: number | null, decimals: number): number | null {
  if (n == null || !isFinite(n)) return null;
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

function IndexCard({ name, formula, description, value, unit, normalRange }: {
  name: string;
  formula: string;
  description: string;
  value: number | null;
  unit: string;
  normalRange: string;
}) {
  return (
    <div className="index-card">
      <div className="index-card-name">{name}</div>
      <div className="index-card-value">
        {value != null ? `${value}${unit}` : '—'}
      </div>
      <div className="index-card-range">Normal: {normalRange}</div>
      <div className="index-card-formula">{formula}</div>
      <div className="index-card-desc">{description}</div>
    </div>
  );
}
