import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getUsers, readStore, syncUsersFromSupabase, writeStore, type User } from "../../lib/data";

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStore<User | null>("hv-user", null));

  useEffect(() => {
    let alive = true;

    void syncUsersFromSupabase()
      .then((users) => {
        if (!alive || !user) return;
        const refreshed = users.find((item) => item.id === user.id || item.email === user.email) ?? null;
        if (!refreshed) {
          setUser(null);
          localStorage.removeItem("hv-user");
          return;
        }
        if (
          refreshed.id === user.id &&
          refreshed.name === user.name &&
          refreshed.email === user.email &&
          refreshed.password === user.password &&
          refreshed.role === user.role &&
          refreshed.avatar === user.avatar
        ) return;
        setUser(refreshed);
        writeStore("hv-user", refreshed);
      })
      .catch(() => undefined);

    return () => {
      alive = false;
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email, password) {
      let users = getUsers();
      try {
        users = await syncUsersFromSupabase();
      } catch {
        users = getUsers();
      }
      const found = users.find((item) => item.email === email.trim().toLowerCase() && item.password === password);
      if (!found) return false;
      setUser(found);
      writeStore("hv-user", found);
      return true;
    },
    logout() {
      setUser(null);
      localStorage.removeItem("hv-user");
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
