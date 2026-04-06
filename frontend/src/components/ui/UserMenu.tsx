import { useAuth } from '../../auth/AuthContext';
import { useLang } from '../../i18n/LangContext';
import type { Lang } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const languages: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ru-RU', label: 'Русский' },
  { value: 'uk-UA', label: 'Українська' },
];

export function UserMenu({ open, onClose }: Props) {
  const { user, signOut } = useAuth();
  const { lang, setLang } = useLang();

  if (!open || !user) return null;

  const meta = user.user_metadata || {};
  const name = meta.full_name || meta.name || user.email || '';
  const email = user.email || '';
  const avatar = meta.avatar_url || meta.picture || '';

  const handleSignOut = () => {
    onClose();
    signOut();
  };

  return (
    <>
      <div className="user-menu-overlay" onClick={onClose} />
      <div className="user-menu-dropdown">
        <div className="user-menu-profile">
          {avatar && <img className="user-menu-avatar" src={avatar} alt="" />}
          <div>
            <div className="user-menu-name">{name}</div>
            <div className="user-menu-email">{email}</div>
          </div>
        </div>

        <div className="user-menu-divider" />

        <div className="user-menu-section">
          <div className="user-menu-label">Language</div>
          <div className="user-menu-lang-group">
            {languages.map(l => (
              <button
                key={l.value}
                className={`user-menu-lang-btn${lang === l.value ? ' active' : ''}`}
                onClick={() => setLang(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="user-menu-divider" />

        <button className="user-menu-signout" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </>
  );
}
