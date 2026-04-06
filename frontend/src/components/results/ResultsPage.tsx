import { useState, useMemo } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useData } from '../../data/DataContext';
import { useAuth } from '../../auth/AuthContext';
import { formatDate, formatResultValue, formatResultReference, isOutOfRange, isNearOutOfRange } from '../../utils/format';
import { getResultDisplayName } from '../../utils/analysis';
import type { ResultGroup, Result } from '../../types';

type ResultsView = 'sessions' | 'out-of-range' | 'near-range';

interface FlaggedItem {
  result: Result;
  date: string;
  place: string;
  kind: 'out' | 'near';
}

interface Props {
  sessions: ResultGroup[];
  loading: boolean;
  onShowDetail: (index: number) => void;
}

export function ResultsPage({ sessions, loading, onShowDetail }: Props) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { analysesCatalog } = useData();
  const [view, setView] = useState<ResultsView>('sessions');

  const flaggedItems = useMemo(() => {
    const out: FlaggedItem[] = [];
    const near: FlaggedItem[] = [];
    for (const session of sessions) {
      if (!session.items) continue;
      for (const r of session.items) {
        if (isOutOfRange(r)) {
          out.push({ result: r, date: session.date, place: session.place, kind: 'out' });
        } else if (isNearOutOfRange(r)) {
          near.push({ result: r, date: session.date, place: session.place, kind: 'near' });
        }
      }
    }
    return { out, near, all: [...out, ...near] };
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
          {sessions.map((g, i) => (
            <div key={g.file} className="card" onClick={() => onShowDetail(i)}>
              <div className="card-date">{formatDate(g.date)}</div>
              <div className="card-title">{g.place || 'Blood Test'}</div>
              <div className="card-meta">{g.itemCount} {t('biomarkers')}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && view === 'out-of-range' && renderFlaggedList(flaggedItems.out)}
      {!loading && view === 'near-range' && renderFlaggedList(flaggedItems.all)}
    </div>
  );
}
