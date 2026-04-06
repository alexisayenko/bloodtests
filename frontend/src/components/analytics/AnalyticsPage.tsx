import { useState, useMemo } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useData } from '../../data/DataContext';
import { useAuth } from '../../auth/AuthContext';
import { getPanelName } from '../../utils/analysis';
import { PanelIcon } from '../panels/PanelIcon';
import { PanelChartPage } from './PanelChartPage';
import type { ResultGroup, Result } from '../../types';

// Panels that have meaningful chart configurations
const CHART_PANELS = [
  {
    panelId: 'thyroid',
    lines: [
      { loinc: '11580-8', color: '#2563eb', yAxisId: 'left' },   // TSH
      { loinc: '3051-0', color: '#dc2626', yAxisId: 'right' },   // FT3
      { loinc: '3024-7', color: '#eab308', yAxisId: 'right' },   // FT4
    ],
  },
  {
    panelId: 'hpg-axis',
    lines: [
      { loinc: '14913-8', color: '#2563eb', yAxisId: 'left' },   // Testosterone
      { loinc: '2991-8', color: '#dc2626', yAxisId: 'left' },    // Free Testosterone
      { loinc: '2942-1', color: '#eab308', yAxisId: 'right' },   // SHBG
      { loinc: '15067-2', color: '#16a34a', yAxisId: 'right' },  // FSH
      { loinc: '10501-5', color: '#9333ea', yAxisId: 'right' },  // LH
      { loinc: '2243-4', color: '#f97316', yAxisId: 'right' },   // Estradiol
    ],
  },
  {
    panelId: 'glucose-metabolism',
    lines: [
      { loinc: '2339-0', color: '#2563eb', yAxisId: 'left' },    // Glucose
      { loinc: '20448-7', color: '#dc2626', yAxisId: 'right' },  // Insulin
      { loinc: '4548-4', color: '#eab308', yAxisId: 'right' },   // HbA1c
    ],
  },
  {
    panelId: 'lipid-metabolism',
    lines: [
      { loinc: '2093-3', color: '#2563eb', yAxisId: 'left' },    // Total Cholesterol
      { loinc: '2085-9', color: '#16a34a', yAxisId: 'left' },    // HDL
      { loinc: '13457-7', color: '#dc2626', yAxisId: 'left' },   // LDL
      { loinc: '2571-8', color: '#eab308', yAxisId: 'right' },   // Triglycerides
    ],
  },
  {
    panelId: 'liver-function',
    lines: [
      { loinc: '1742-6', color: '#2563eb', yAxisId: 'left' },    // ALT
      { loinc: '1920-8', color: '#dc2626', yAxisId: 'left' },    // AST
      { loinc: '2324-2', color: '#eab308', yAxisId: 'left' },    // GGT
      { loinc: '6768-6', color: '#16a34a', yAxisId: 'left' },    // ALP
      { loinc: '1975-2', color: '#f97316', yAxisId: 'right' },   // Total Bilirubin
    ],
  },
];

interface Props {
  sessions: ResultGroup[];
  loading: boolean;
}

export function AnalyticsPage({ sessions, loading }: Props) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { panels, analysesCatalog } = useData();
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);

  // Index results by loinc
  const resultsByLoinc = useMemo(() => {
    const map: Record<string, { date: string; result: Result }[]> = {};
    for (const session of sessions) {
      if (!session.items) continue;
      for (const r of session.items) {
        if (!r.loinc || r.value == null) continue;
        if (!map[r.loinc]) map[r.loinc] = [];
        map[r.loinc].push({ date: session.date, result: r });
      }
    }
    return map;
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

  // Find selected chart config and panel
  const selectedConfig = CHART_PANELS.find(c => c.panelId === selectedPanelId);
  const selectedPanel = panels.find(p => p.id === selectedPanelId);

  if (selectedConfig && selectedPanel) {
    return (
      <PanelChartPage
        panel={selectedPanel}
        lines={selectedConfig.lines}
        resultsByLoinc={resultsByLoinc}
        analysesCatalog={analysesCatalog}
        onBack={() => setSelectedPanelId(null)}
      />
    );
  }

  // Landing page: show available panels as cards
  const availablePanels = CHART_PANELS.map(config => {
    const panel = panels.find(p => p.id === config.panelId);
    if (!panel) return null;
    const hasData = config.lines.some(l => resultsByLoinc[l.loinc]?.length > 0);
    return { panel, config, hasData };
  }).filter(Boolean) as { panel: typeof panels[0]; config: typeof CHART_PANELS[0]; hasData: boolean }[];

  return (
    <div>
      <h2 className="section-title">Analytics</h2>
      <div className="card-list">
        {availablePanels.map(({ panel, hasData }) => (
          <div
            key={panel.id}
            className={`card${!hasData ? ' card-disabled' : ''}`}
            onClick={() => hasData && setSelectedPanelId(panel.id)}
            style={{ opacity: hasData ? 1 : 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PanelIcon panel={panel} />
              </div>
              <div>
                <div className="card-title" style={{ marginBottom: 0 }}>{getPanelName(panel, lang)}</div>
                <div className="card-meta">
                  {hasData ? 'View charts →' : 'No data yet'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
