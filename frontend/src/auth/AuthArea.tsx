import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useLang } from '../i18n/LangContext';
import { UserMenu } from '../components/ui/UserMenu';

export function AuthArea() {
  const { user, signIn } = useAuth();
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  if (user) {
    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email || '';
    const firstName = name.split(' ')[0];
    const avatar = meta.avatar_url || meta.picture || '';

    return (
      <>
        <div className="auth-area" onClick={() => setMenuOpen(true)} style={{ cursor: 'pointer' }}>
          {avatar && <img className="auth-avatar" src={avatar} alt="" />}
          <span className="auth-name">{firstName}</span>
        </div>
        <UserMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </>
    );
  }

  return (
    <div className="auth-area">
      <span className="guest-badge">{t('guest')}</span>
      <button className="btn-auth" onClick={signIn}>{t('signIn')}</button>
    </div>
  );
}
