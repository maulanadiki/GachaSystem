// contexts/UserContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AppUser {
  user: string;      // username
  email: string;
  role: string;
  coins: number;
  rarity:string
  drop_rate:number
}

interface UserContextValue {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  updateCoins: (coins: number) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);

  // hydrate from storage on first load (page refresh, new tab, etc.)
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
    <UserContext.Provider value={{ user, setUser, updateCoins }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}