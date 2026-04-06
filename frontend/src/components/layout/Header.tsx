import { useLang } from '../../i18n/LangContext';
import { AuthArea } from '../../auth/AuthArea';
import type { Lang } from '../../types';

export function Header() {
  const { lang, setLang } = useLang();

  const isDevel = (() => {
    const params = new URLSearchParams(window.location.search);
    const forcedEnv = params.get('env');
    const path = (window.location.pathname || '/').replace(/\/+$/, '');
    const isDevelPath = path.endsWith('/dev');
    return forcedEnv === 'devel' || (isDevelPath && !forcedEnv);
  })();

  return (
    <header className="header">
      <h1>
        Blood Tests{' '}
        {isDevel && <span className="branch-badge visible">DEVEL</span>}
        {__BUILD_INFO__ && (
          <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.6, marginTop: '2px' }}>
            {__BUILD_INFO__}
          </div>
        )}
      </h1>
      <div className="header-controls">
        <select
          className="lang-select"
          value={lang}
          onChange={e => setLang(e.target.value as Lang)}
        >
          <option value="en">Eng</option>
          <option value="ru-RU">Рус</option>
          <option value="uk-UA">Укр</option>
        </select>
        <AuthArea />
      </div>
    </header>
  );
}
