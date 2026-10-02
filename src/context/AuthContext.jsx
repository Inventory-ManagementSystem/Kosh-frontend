import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "access";

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const login = useCallback((access) => {
    try {
      localStorage.setItem(TOKEN_KEY, access);
    } catch {
      /* ignore */
    }
    setAccessToken(access);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      login,
      logout,
    }),
    [accessToken, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};
