import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS, type LanguageCode } from '../i18n/translations.ts';

export type UserRole = 'CUSTOMER' | 'PARTNER' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  role: UserRole;
  mobile_verified: boolean;
  language: string;
  default_city: string;
  partner_id?: string | null;
  partner_verification_status?: string | null;
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  language: LanguageCode;
  city: string;
  t: (key: string) => string;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  setCity: (city: string) => Promise<void>;
  refreshUser: () => Promise<SessionUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LANG_STORAGE_KEY = 'serva_lang';
const CITY_STORAGE_KEY = 'serva_city';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'te' ? 'te' : 'en';
  });
  const [city, setCityState] = useState<string>(() => {
    return localStorage.getItem(CITY_STORAGE_KEY) || 'Hyderabad, TG';
  });

  const refreshUser = useCallback(async (): Promise<SessionUser | null> => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        return null;
      }
      const data = (await res.json()) as { user: SessionUser | null };
      setUser(data.user);
      if (data.user?.language === 'te' || data.user?.language === 'en') {
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        if (!stored) {
          setLanguageState(data.user.language);
          localStorage.setItem(LANG_STORAGE_KEY, data.user.language);
        }
      }
      if (data.user?.default_city) {
        setCityState(data.user.default_city);
        localStorage.setItem(CITY_STORAGE_KEY, data.user.default_city);
      }
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const setLanguage = useCallback(
    async (lang: LanguageCode) => {
      setLanguageState(lang);
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      if (user) {
        await fetch('/api/auth/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ language: lang }),
        }).catch(() => {});
      }
    },
    [user]
  );

  const setCity = useCallback(
    async (nextCity: string) => {
      setCityState(nextCity);
      localStorage.setItem(CITY_STORAGE_KEY, nextCity);
      if (user) {
        await fetch('/api/auth/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ default_city: nextCity }),
        }).catch(() => {});
      }
    },
    [user]
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const t = useCallback(
    (key: string) => {
      return TRANSLATIONS[language][key] ?? TRANSLATIONS.en[key] ?? key;
    },
    [language]
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, language, city, t, setLanguage, setCity, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
