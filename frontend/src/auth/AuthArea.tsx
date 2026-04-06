import { useAuth } from './AuthContext';
import { useLang } from '../i18n/LangContext';

export function AuthArea() {
  const { user, signIn, signOut } = useAuth();
  const { t } = useLang();

  if (user) {
    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email || '';
    const avatar = meta.avatar_url || meta.picture || '';

    return (
      <div className="auth-area">
        {avatar && <img className="auth-avatar" src={avatar} alt="" />}
        <span className="auth-name">{name}</span>
        <button className="btn-auth" onClick={signOut}>Out</button>
      </div>
    );
  }

  return (
    <div className="auth-area">
      <span className="guest-badge">{t('guest')}</span>
      <button className="btn-auth" onClick={signIn}>{t('signIn')}</button>
    </div>
  );
}
