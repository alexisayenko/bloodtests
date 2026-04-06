import { useState, useMemo, useCallback } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useData } from '../../data/DataContext';
import { useAuth } from '../../auth/AuthContext';
import { formatDate, formatResultValue, formatResultReference, isOutOfRange, isNearOutOfRange } from '../../utils/format';
import { getResultDisplayName, getPanelName, getPanelAnalyses } from '../../utils/analysis';
import { ResultRow } from './ResultRow';
import type { ResultGroup, Result } from '../../types';

type ResultsView = 'sessions' | 'out-of-range' | 'near-range';

interface FlaggedItem {
  result: Result;
  date: string;
  place: string;
  kind: 'out' | 'near';
}

interface PanelGroup {
  panelName: string;
  color: string;
  results: Result[];
}

interface Props {
  sessions: ResultGroup[];
  loading: boolean;
  loadGroupItems: (sessionId: string) => Promise<Result[]>;
}

export function ResultsPage({ sessions, loading, loadGroupItems }: Props) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { analysesCatalog, panels } = useData();
  const [view, setView] = useState<ResultsView>('sessions');
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [loadedItems, setLoadedItems] = useState<Record<string, Result[]>>({});

  const toggleSession = useCallback(async (sessionId: string, items: Result[] | null) => {
    if (expandedSessions[sessionId]) {
      setExpandedSessions(prev => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      return;
    }

    // Load items if not yet loaded
    if (!items && !loadedItems[sessionId]) {
      const loaded = await loadGroupItems(sessionId);
      setLoadedItems(prev => ({ ...prev, [sessionId]: loaded }));
    }

    setExpandedSessions(prev => ({ ...prev, [sessionId]: true }));
  }, [expandedSessions, loadedItems, loadGroupItems]);

  const getSessionItems = (g: ResultGroup): Result[] | null => {
    return g.items || loadedItems[g.file] || null;
  };

  const groupByPanel = useCallback((items: Result[]): PanelGroup[] => {
    const loincToPanel: Record<string, number> = {};
    panels.forEach((p, pi) => {
      getPanelAnalyses(p).forEach(loinc => { loincToPanel[loinc] = pi; });
    });

    const panelGroups: Record<number, PanelGroup> = {};
    const ungrouped: Result[] = [];

    for (const r of items) {
      const pi = loincToPanel[r.loinc];
      if (pi !== undefined) {
        if (!panelGroups[pi]) {
          panelGroups[pi] = {
            panelName: getPanelName(panels[pi], lang),
            color: panels[pi].color || '#d1d5db',
            results: [],
          };
        }
        panelGroups[pi].results.push(r);
      } else {
        ungrouped.push(r);
      }
    }

    const sorted = Object.keys(panelGroups).map(Number).sort((a, b) => a - b).map(pi => panelGroups[pi]);
    if (ungrouped.length > 0) {
      sorted.push({ panelName: 'Other', color: '#d1d5db', results: ungrouped });
    }
    return sorted;
  }, [panels, lang]);

  const flaggedItems = useMemo(() => {
    const out: FlaggedItem[] = [];
    const all: FlaggedItem[] = [];
    for (const session of sessions) {
      if (!session.items) continue;
      for (const r of session.items) {
        if (isOutOfRange(r)) {
          const item = { result: r, date: session.date, place: session.place, kind: 'out' as const };
          out.push(item);
          all.push(item);
        } else if (isNearOutOfRange(r)) {
          all.push({ result: r, date: session.date, place: session.place, kind: 'near' });
        }
      }
    }
    return { out, all };
  }, [sessions]);

  const renderFlaggedList = (items: FlaggedItem[]) => {
    if (items.length === 0) {
      return <div className="empty-state">All biomarkers are within range 🎉</div>;
    }
    return (
      <div className="results-table">
        <div className="results-header">
          <span>{t('biomarker')}</span>
          <span>{t('value')}</span>
          <span>{t('reference')}</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className={`results-row ${item.kind === 'out' ? 'out-of-range' : 'near-out-of-range'}`}>
            <span className="result-name">
              {getResultDisplayName(item.result, analysesCatalog, lang)}
              <br />
              <span className="result-loinc">
                {formatDate(item.date)} · {item.place}
              </span>
            </span>
            <span className="result-value">{formatResultValue(item.result)}</span>
            <span className="result-ref">{formatResultReference(item.result)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="section-title">{t('results')}</h2>

      {!loading && user && sessions.length > 0 && (
        <div className="view-toggle" style={{ marginBottom: '12px' }}>
          <button
            className={`view-toggle-btn${view === 'sessions' ? ' active' : ''}`}
            onClick={() => setView('sessions')}
          >
            {t('results')}
          </button>
          <button
            className={`view-toggle-btn${view === 'out-of-range' ? ' active' : ''}`}
            onClick={() => setView('out-of-range')}
            style={{ color: view === 'out-of-range' ? 'white' : '#dc2626' }}
          >
            ⚠ {flaggedItems.out.length}
          </button>
          <button
            className={`view-toggle-btn${view === 'near-range' ? ' active' : ''}`}
            onClick={() => setView('near-range')}
            style={{ color: view === 'near-range' ? 'white' : '#d97706' }}
          >
            ⚠ {flaggedItems.all.length}
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}
      {!loading && !user && (
        <div className="empty-state">{t('signIn')} to view results.</div>
      )}
      {!loading && user && sessions.length === 0 && (
        <div className="empty-state">{t('noResults')}</div>
      )}

      {!loading && view === 'sessions' && (
        <div className="card-list">
          {sessions.map((g) => {
            const isExpanded = expandedSessions[g.file];
            const items = getSessionItems(g);
            const grouped = isExpanded && items ? groupByPanel(items) : null;

            return (
              <div key={g.file} className="session-card">
                <div
                  className="card"
                  onClick={() => toggleSession(g.file, g.items)}
                  style={{ borderRadius: isExpanded ? 'var(--radius) var(--radius) 0 0' : undefined }}
                >
                  <div className="card-date" style={{ justifyContent: 'space-between' }}>
                    <span>{formatDate(g.date)}</span>
                    <svg
                      width="14" height="14" viewBox="0 0 14 14" fill="none"
                      stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    >
                      <path d="M3 5l4 4 4-4" />
                    </svg>
                  </div>
                  <div className="card-title">{g.place || 'Blood Test'}</div>
                  <div className="card-meta">{g.itemCount} {t('biomarkers')}</div>
                </div>

                {isExpanded && grouped && (
                  <div className="results-table" style={{ marginTop: 0, borderRadius: '0 0 var(--radius) var(--radius)' }}>
                    {grouped.map((pg, gi) => (
                      <div key={gi}>
                        <div
                          className="result-panel-divider"
                          style={{ '--row-panel-color': pg.color } as React.CSSProperties}
                        >
                          {pg.panelName}
                        </div>
                        {pg.results.map((r, i) => (
                          <ResultRow key={`${gi}-${i}`} result={r} panelColor={pg.color} />
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && !items && (
                  <div className="loading" style={{ padding: '16px' }}>Loading...</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && view === 'out-of-range' && renderFlaggedList(flaggedItems.out)}
      {!loading && view === 'near-range' && renderFlaggedList(flaggedItems.all)}
    </div>
  );
}
