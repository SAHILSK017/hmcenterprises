"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, clearAuthSession, setAuthSession, getToken } from "@/lib/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  avatar?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthUser>;
  oauthLogin: (payload: {
    provider: "google" | "github";
    providerId?: string;
    email: string;
    name?: string;
    avatar?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const raw = localStorage.getItem("hmk_user");
    if (token && raw) {
      try {
        setUser(JSON.parse(raw) as AuthUser);
      } catch {
        clearAuthSession();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthSession(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      const data = await api<{ token: string; user: AuthUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setAuthSession(data.token, data.user);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const oauthLogin = useCallback(
    async (payload: {
      provider: "google" | "github";
      providerId?: string;
      email: string;
      name?: string;
      avatar?: string;
    }) => {
      const data = await api<{ token: string; user: AuthUser }>("/api/auth/oauth", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setAuthSession(data.token, data.user);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, oauthLogin, logout }),
    [user, loading, login, register, oauthLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
