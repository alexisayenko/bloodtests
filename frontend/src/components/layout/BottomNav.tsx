import { useLang } from '../../i18n/LangContext';
import type { ViewName } from '../../types';

interface Props {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
}

export function BottomNav({ activeView, onNavigate }: Props) {
  const { t } = useLang();

  const isActive = (views: ViewName[]) => views.includes(activeView) ? 'nav-item active' : 'nav-item';

  return (
    <nav className="bottom-nav">
      <button className={isActive(['panels', 'panel-detail'])} onClick={() => onNavigate('panels')}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
        <span>{t('navPanels')}</span>
      </button>
      <button className={isActive(['results'])} onClick={() => onNavigate('results')}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{t('navResults')}</span>
      </button>
      <button className={isActive(['analytics'])} onClick={() => onNavigate('analytics')}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{t('navAnalytics')}</span>
      </button>
      <button className={isActive(['planning'])} onClick={() => onNavigate('planning')}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        <span>{t('navPlanning')}</span>
      </button>
      <button className={isActive(['upcoming'])} onClick={() => onNavigate('upcoming')}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <path d="M9 14l2 2 4-4" />
        </svg>
        <span>{t('navUpcoming')}</span>
      </button>
    </nav>
  );
}
