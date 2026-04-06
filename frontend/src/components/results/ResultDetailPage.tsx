import { useState, useEffect } from 'react';
import { useLang } from '../../i18n/LangContext';
import { formatDate } from '../../utils/format';
import { ResultRow } from './ResultRow';
import type { ResultGroup, Result } from '../../types';

interface Props {
  group: ResultGroup;
  loadItems: (sessionId: string) => Promise<Result[]>;
  onBack: () => void;
}

export function ResultDetailPage({ group, loadItems, onBack }: Props) {
  const { t } = useLang();
  const [items, setItems] = useState<Result[] | null>(group.items);

  useEffect(() => {
    if (!items && group.file) {
      loadItems(group.file).then(setItems);
    }
  }, [group.file, items, loadItems]);

  if (!items) return <div className="loading">Loading...</div>;

  return (
    <div>
      <button className="btn-back" onClick={onBack}>{t('back')}</button>
      <div className="detail-header">
        <h2>{group.place || 'Blood Test'}</h2>
        <div className="detail-date">{formatDate(group.date)}</div>
      </div>
      <div className="results-table">
        <div className="results-header">
          <span>{t('biomarker')}</span>
          <span>{t('value')}</span>
          <span>{t('reference')}</span>
        </div>
        {items.map((r, i) => (
          <ResultRow key={i} result={r} />
        ))}
      </div>
    </div>
  );
}
