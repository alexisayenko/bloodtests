import { useState, useCallback } from 'react';
import { LangProvider } from './i18n/LangContext';
import { AuthProvider } from './auth/AuthContext';
import { DataProvider } from './data/DataContext';
import { useResults } from './data/useResults';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { PanelsPage } from './components/panels/PanelsPage';
import { PanelDetailPage } from './components/panels/PanelDetailPage';
import { ResultsPage } from './components/results/ResultsPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { PlanningPage } from './components/planning/PlanningPage';
import { UpcomingPage } from './components/upcoming/UpcomingPage';
import type { ViewName } from './types';

function AppContent() {
  const [view, setView] = useState<ViewName>('panels');
  const [detailPanelIndex, setDetailPanelIndex] = useState(0);
  const { sessions, plannedTests, loading, loadGroupItems } = useResults();

  const navigate = useCallback((v: ViewName) => setView(v), []);

  const showPanelDetail = useCallback((index: number) => {
    setDetailPanelIndex(index);
    setView('panel-detail');
  }, []);

  let content;
  switch (view) {
    case 'panels':
      content = <PanelsPage onShowDetail={showPanelDetail} />;
      break;
    case 'panel-detail':
      content = <PanelDetailPage panelIndex={detailPanelIndex} onBack={() => setView('panels')} />;
      break;
    case 'results':
      content = <ResultsPage sessions={sessions} loading={loading} loadGroupItems={loadGroupItems} />;
      break;
    case 'analytics':
      content = <AnalyticsPage sessions={sessions} loading={loading} />;
      break;
    case 'planning':
      content = <PlanningPage />;
      break;
    case 'upcoming':
      content = <UpcomingPage planned={plannedTests} loading={loading} />;
      break;
  }

  return (
    <div className={`app${view === 'analytics' ? ' wide-mode' : ''}`}>
      <Header />
      <main className="main">{content}</main>
      <BottomNav activeView={view} onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LangProvider>
  );
}
