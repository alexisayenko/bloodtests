import { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { getPanelName, getPanelAnalyses } from '../../utils/analysis';
import { BiomarkerChart } from './BiomarkerChart';
import type { Panel, Result } from '../../types';

interface Props {
  panel: Panel;
  resultsByLoinc: Record<string, { date: string; result: Result }[]>;
}

export function PanelCharts({ panel, resultsByLoinc }: Props) {
  const { lang } = useLang();
  const [collapsed, setCollapsed] = useState(false);
  const name = getPanelName(panel, lang);
  const loincs = getPanelAnalyses(panel);

  // Only show loincs that have data
  const loincWithData = loincs.filter(l => resultsByLoinc[l]?.length > 0);
  if (loincWithData.length === 0) return null;

  const style = { '--panel-color': panel.color || '#d1d5db' } as React.CSSProperties;

  return (
    <div className="panel-chart-group" style={style}>
      <div className="panel-chart-header" onClick={() => setCollapsed(!collapsed)}>
        <span>{name}</span>
        <span className="panel-chart-count">{loincWithData.length} charts</span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
      </div>
      {!collapsed && (
        <div className="panel-chart-body">
          {loincWithData.map(loinc => (
            <BiomarkerChart
              key={loinc}
              loinc={loinc}
              results={resultsByLoinc[loinc]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
