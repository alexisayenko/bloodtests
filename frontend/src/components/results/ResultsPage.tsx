import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/format';
import type { ResultGroup } from '../../types';

interface Props {
  sessions: ResultGroup[];
  loading: boolean;
  onShowDetail: (index: number) => void;
}

export function ResultsPage({ sessions, loading, onShowDetail }: Props) {
  const { t } = useLang();
  const { user } = useAuth();

  return (
    <div>
      <h2 className="section-title">{t('results')}</h2>
      <div className="card-list">
        {loading && <div className="loading">Loading...</div>}
        {!loading && !user && (
          <div className="empty-state">{t('signIn')} to view results.</div>
        )}
        {!loading && user && sessions.length === 0 && (
          <div className="empty-state">{t('noResults')}</div>
        )}
        {!loading && sessions.map((g, i) => (
          <div key={g.file} className="card" onClick={() => onShowDetail(i)}>
            <div className="card-date">{formatDate(g.date)}</div>
            <div className="card-title">{g.place || 'Blood Test'}</div>
            <div className="card-meta">{g.itemCount} {t('biomarkers')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
