import { useLang } from '../../i18n/LangContext';
import { useData } from '../../data/DataContext';
import { getResultDisplayName } from '../../utils/analysis';
import { formatResultValue, formatResultReference, isOutOfRange } from '../../utils/format';
import type { Result } from '../../types';

export function ResultRow({ result }: { result: Result }) {
  const { lang } = useLang();
  const { analysesCatalog } = useData();
  const oor = isOutOfRange(result);

  return (
    <div className={`results-row${oor ? ' out-of-range' : ''}`}>
      <span className="result-name">
        {getResultDisplayName(result, analysesCatalog, lang)}
        <br />
        <span className="result-loinc">
          {result.loinc ? (
            <a
              href={`https://loinc.org/${encodeURIComponent(result.loinc)}`}
              target="_blank"
              rel="noopener"
              className="loinc-link"
            >
              LOINC {result.loinc}
            </a>
          ) : 'Unmapped'}
          {result.method && ` · ${result.method}`}
          {result.symbol && ` · ${result.symbol}`}
        </span>
      </span>
      <span className="result-value">{formatResultValue(result)}</span>
      <span className="result-ref">{formatResultReference(result)}</span>
    </div>
  );
}
