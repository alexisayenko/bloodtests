import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/format';
import type { PlannedTest } from '../../types';

interface Props {
  planned: PlannedTest[];
  loading: boolean;
}

export function PlannedPage({ planned, loading }: Props) {
  const { t } = useLang();
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h2 className="section-title">{t('planned')}</h2>
      <div className="card-list">
        {loading && <div className="loading">Loading...</div>}
        {!loading && !user && (
          <div className="empty-state">{t('signIn')} to view planned tests.</div>
        )}
        {!loading && user && planned.length === 0 && (
          <div className="empty-state">{t('noPlanned')}</div>
        )}
        {!loading && planned.map(p => {
          const overdue = p.plannedDate && p.plannedDate < today;
          return (
            <div key={p.id} className={`card planned${overdue ? ' card-overdue' : ''}`}>
              <div className="card-date">
                {p.plannedDate ? formatDate(p.plannedDate) : '—'}
                {overdue && <span className="badge badge-overdue">{t('overdue')}</span>}
              </div>
              <div className="card-title">{p.testType || '—'}</div>
              {p.notes && <div className="card-notes">{p.notes}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
