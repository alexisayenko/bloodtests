import { useLang } from '../../i18n/LangContext';

export function PlanningPage() {
  const { t } = useLang();

  return (
    <div>
      <h2 className="section-title">{t('planningTitle')}</h2>
      <div className="empty-state" style={{ padding: '60px 20px' }}>
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        <p style={{ fontSize: '16px', color: 'var(--gray-400)', marginBottom: '8px' }}>Under Construction</p>
        <p style={{ fontSize: '14px', color: 'var(--gray-300)' }}>Define testing frequencies, tags, and rules for each biomarker.</p>
      </div>
    </div>
  );
}
