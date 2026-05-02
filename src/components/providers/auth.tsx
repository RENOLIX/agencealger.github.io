import { createContext, useContext, useMemo, useState } from "react";
import { getUsers, readStore, writeStore, type User } from "../../lib/data";

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStore<User | null>("hv-user", null));

  const value = useMemo<AuthContextValue>(() => ({
    user,
    login(email, password) {
      const found = getUsers().find((item) => item.email === email.trim().toLowerCase() && item.password === password);
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
