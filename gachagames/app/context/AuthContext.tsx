"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AppUser {
  user: string;   // username
  email: string;
  role: string;
  coins: number;
  rarity:string
  drop_rate:number
}

interface AuthContextValue {
  token: string | null;
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  updateCoins: (coins: number) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Read a cookie value from document.cookie by name */
function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function AuthProvider({
  children,
  token: serverToken,
}: {
  children: ReactNode;
  token: string | null;
}) {
  // Read the cookie directly on the client so it's always fresh,
  // falling back to the server-passed prop for SSR / first paint.
  const [liveToken, setLiveToken] = useState<string | null>(serverToken);
  const [user, setUserState] = useState<AppUser | null>(null);

  // On mount, read the actual cookie from the browser so we pick up
  // any value that was set after the server rendered the layout.
  useEffect(() => {
    const freshToken = getClientCookie("access_token");
    if (freshToken && freshToken !== liveToken) {
      setLiveToken(freshToken);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep in sync when the server prop changes (e.g. after router.refresh())
  useEffect(() => {
    if (serverToken && serverToken !== liveToken) {
      setLiveToken(serverToken);
    }
  }, [serverToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // hydrate user from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("app_user");
    if (stored) setUserState(JSON.parse(stored));
  }, []);

  const setUser = (u: AppUser | null) => {
    setUserState(u);
    if (u) sessionStorage.setItem("app_user", JSON.stringify(u));
    else sessionStorage.removeItem("app_user");
  };

  const updateCoins = (coins: number) => {
    setUserState(prev => {
      if (!prev) return prev;
      const next = { ...prev, coins };
      sessionStorage.setItem("app_user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ token: liveToken, user, setUser, updateCoins }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}