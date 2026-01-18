import { createContext, useContext, useMemo, useState } from "react";
import { AuthTokensDto, UserDto } from "@devassist/shared";

const AUTH_STORAGE_KEY = "devassist.auth";

const loadStoredAuth = (): { user: UserDto; accessToken: string } | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { user: UserDto; accessToken: string };
  } catch {
    return null;
  }
};

const persistAuth = (payload: { user: UserDto; accessToken: string }) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

interface AuthContextValue {
  user: UserDto | null;
  accessToken: string | null;
  login: (tokens: AuthTokensDto) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const stored = loadStoredAuth();
  const [user, setUser] = useState<UserDto | null>(stored?.user ?? null);
  const [accessToken, setAccessToken] = useState<string | null>(stored?.accessToken ?? null);

  const login = (tokens: AuthTokensDto) => {
    setUser(tokens.user);
    setAccessToken(tokens.accessToken);
    persistAuth({ user: tokens.user, accessToken: tokens.accessToken });
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    clearAuth();
  };

  const value = useMemo(() => ({ user, accessToken, login, logout }), [user, accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
