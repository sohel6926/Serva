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

export type DemoRole = 'customer' | 'partner' | 'admin';

export const DEMO_USERS: Record<DemoRole, SessionUser> = {
  customer: {
    id: 'usr_customer_ananya',
    name: 'Ananya Reddy',
    email: 'ananya@serva.demo',
    mobile: '9876543210',
    role: 'CUSTOMER',
    mobile_verified: true,
    language: 'en',
    default_city: 'Hyderabad, TG',
  },
  partner: {
    id: 'usr_partner_ramesh',
    name: 'Ramesh Kumar',
    email: 'ramesh.partner@serva.demo',
    mobile: '9876543211',
    role: 'PARTNER',
    mobile_verified: true,
    language: 'en',
    default_city: 'Hyderabad, TG',
    partner_id: 'partner-verified-1',
    partner_verification_status: 'VERIFIED',
  },
  admin: {
    id: 'usr_admin_ops',
    name: 'SERVA Operations Admin',
    email: 'admin@serva.demo',
    mobile: '9876543212',
    role: 'ADMIN',
    mobile_verified: true,
    language: 'en',
    default_city: 'Hyderabad, TG',
  },
};

const DEMO_USER_STORAGE_KEY = 'serva_demo_user';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  language: LanguageCode;
  city: string;
  t: (key: string) => string;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  setCity: (city: string) => Promise<void>;
  refreshUser: () => Promise<SessionUser | null>;
  loginAsDemo: (role: DemoRole) => Promise<SessionUser>;
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
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = (await res.json()) as { user: SessionUser | null };
          if (data.user) {
            setUser(data.user);
            localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(data.user));
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
          }
        }
      } catch {
        // Backend not accessible (e.g. static deploy on Vercel)
      }

      // Check localStorage fallback for demo user session
      const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo) as SessionUser;
          if (parsed?.id && parsed?.role) {
            setUser(parsed);
            return parsed;
          }
        } catch {
          localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        }
      }

      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsDemo = useCallback(async (role: DemoRole): Promise<SessionUser> => {
    setLoading(true);
    const target = DEMO_USERS[role];
    const email = target.email!;
    const password = role === 'admin' ? 'Admin@123' : 'Serva@123';

    // 1. Try to authenticate with backend if server is running
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: email, password }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d?.user) {
          setUser(d.user);
          localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(d.user));
          setLoading(false);
          return d.user;
        }
      }
    } catch {
      // Offline / static environment
    }

    // 2. Always persist and set demo session in client state
    setUser(target);
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(target));
    setLoading(false);
    return target;
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
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
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore network errors
    }
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
      value={{ user, loading, language, city, t, setLanguage, setCity, refreshUser, loginAsDemo, logout }}
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
