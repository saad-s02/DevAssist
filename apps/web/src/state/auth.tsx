import { createContext, useContext, useMemo, useState } from "react";
import { AuthTokensDto, UserDto } from "@devassist/shared";

interface AuthContextValue {
  user: UserDto | null;
  accessToken: string | null;
  login: (tokens: AuthTokensDto) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = (tokens: AuthTokensDto) => {
    setUser(tokens.user);
    setAccessToken(tokens.accessToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
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
