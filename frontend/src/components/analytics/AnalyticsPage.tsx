import { useMemo } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useData } from '../../data/DataContext';
import { useAuth } from '../../auth/AuthContext';
import { getPanelAnalyses } from '../../utils/analysis';
import { PanelCharts } from './PanelCharts';
import type { ResultGroup, Result } from '../../types';

interface Props {
  sessions: ResultGroup[];
  loading: boolean;
}

export function AnalyticsPage({ sessions, loading }: Props) {
  const { t } = useLang();
  const { user } = useAuth();
  const { panels } = useData();

  // Index all results by LOINC code with their dates
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

  if (sessions.length === 0) {
    return (
      <div>
        <h2 className="section-title">Analytics</h2>
        <div className="empty-state">{t('noResults')}</div>
      </div>
    );
  }

  // Only show panels that have data
  const panelsWithData = panels.filter(p => {
    const loincs = getPanelAnalyses(p);
    return loincs.some(l => resultsByLoinc[l]?.length > 0);
  });

  return (
    <div>
      <h2 className="section-title">Analytics</h2>
      <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '12px' }}>
        {panelsWithData.length} panels · {Object.keys(resultsByLoinc).length} biomarkers tracked
      </div>
      <div className="card-list">
        {panelsWithData.map(panel => (
          <PanelCharts
            key={panel.id}
            panel={panel}
            resultsByLoinc={resultsByLoinc}
          />
        ))}
      </div>
    </div>
  );
}
