export function AnalyticsPage() {
  return (
    <div>
      <h2 className="section-title">Analytics</h2>
      <div className="empty-state" style={{ padding: '60px 20px' }}>
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p style={{ fontSize: '16px', color: 'var(--gray-400)', marginBottom: '8px' }}>Under Construction</p>
        <p style={{ fontSize: '14px', color: 'var(--gray-300)' }}>Charts, calculated indexes, and trend analysis coming soon.</p>
      </div>
    </div>
  );
}
