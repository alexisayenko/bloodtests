import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../data/DataContext';
import { useLang } from '../../i18n/LangContext';
import { useTestingSchedule } from '../../data/useTestingSchedule';
import { getPanelName, getAnalysisName, getPanelAnalyses } from '../../utils/analysis';
import { PanelIcon } from '../panels/PanelIcon';
import type { Panel, FrequencyPreset } from '../../types';

const FREQ_OPTIONS: (FrequencyPreset | null)[] = [null, 1, 3, 6, 12, 24];

function freqLabel(t: (k: string) => string, months: number | null): string {
  if (months === null) return t('notTracked');
  switch (months) {
    case 1: return t('monthly');
    case 3: return t('quarterly');
    case 6: return t('twiceAYear');
    case 12: return t('annually');
    case 24: return t('every2Years');
    default: return `${months}m`;
  }
}

function FrequencySelect({ value, onChange, t }: {
  value: number | null;
  onChange: (v: number | null) => void;
  t: (k: string) => string;
}) {
  return (
    <select
      className="freq-select"
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
    >
      {FREQ_OPTIONS.map(opt => (
        <option key={opt ?? 'none'} value={opt ?? ''}>
          {freqLabel(t, opt)}
        </option>
      ))}
    </select>
  );
}

function PanelScheduleCard({ panel, expanded, onToggle }: {
  panel: Panel;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { lang, t } = useLang();
  const { analysesCatalog } = useData();
  const { getPanelFrequency, getBiomarkerFrequency, setSchedule } = useTestingSchedule();

  const panelFreq = getPanelFrequency(panel.id);
  const loincs = getPanelAnalyses(panel);
  const overrideCount = loincs.filter(l => getBiomarkerFrequency(panel.id, l) !== null).length;

  const style = { '--panel-color': panel.color || '#d1d5db' } as React.CSSProperties;

  return (
    <div className="schedule-card" style={style}>
      <div className="schedule-card-header" onClick={onToggle}>
        <div className="schedule-card-title">
          <PanelIcon panel={panel} />
          <span>{getPanelName(panel, lang)}</span>
          <span className="schedule-card-count">{loincs.length}</span>
        </div>
        <div className="schedule-card-controls" onClick={e => e.stopPropagation()}>
          <FrequencySelect
            value={panelFreq}
            onChange={v => setSchedule(panel.id, null, v)}
            t={t}
          />
        </div>
        <svg
          className={`schedule-chevron${expanded ? ' expanded' : ''}`}
          viewBox="0 0 24 24" width="20" height="20"
          fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {expanded && (
        <div className="schedule-card-body">
          {loincs.map(loinc => {
            const override = getBiomarkerFrequency(panel.id, loinc);
            const effective = override ?? panelFreq;
            return (
              <div key={loinc} className="schedule-biomarker-row">
                <span className="schedule-biomarker-name">
                  {getAnalysisName(loinc, analysesCatalog, lang)}
                </span>
                <div className="schedule-biomarker-freq">
                  {override !== null ? (
                    <>
                      <FrequencySelect
                        value={override}
                        onChange={v => setSchedule(panel.id, loinc, v)}
                        t={t}
                      />
                      <button
                        className="schedule-clear-btn"
                        onClick={() => setSchedule(panel.id, loinc, null)}
                        title={t('clearOverride')}
                      >
                        &times;
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="schedule-inherited">
                        {effective !== null ? freqLabel(t, effective) : t('notTracked')}
                      </span>
                      <button
                        className="schedule-override-btn"
                        onClick={() => setSchedule(panel.id, loinc, effective ?? 12)}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PlanningPage() {
  const { user } = useAuth();
  const { panels } = useData();
  const { t } = useLang();
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});

  if (!user) {
    return (
      <div>
        <h2 className="section-title">{t('planningTitle')}</h2>
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <p style={{ fontSize: '16px', color: 'var(--gray-400)' }}>{t('signInToSchedule')}</p>
        </div>
      </div>
    );
  }

  const togglePanel = (id: string) => {
    setExpandedPanels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <h2 className="section-title">{t('planningTitle')}</h2>
      <div className="schedule-list">
        {panels.map(panel => (
          <PanelScheduleCard
            key={panel.id}
            panel={panel}
            expanded={!!expandedPanels[panel.id]}
            onToggle={() => togglePanel(panel.id)}
          />
        ))}
      </div>
    </div>
  );
}
