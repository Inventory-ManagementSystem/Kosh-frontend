import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { refreshAccessToken } from "../api/refreshTokenApi";
import { getProfile } from "../api/getProfileApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const restored = useRef(false);

  const login = useCallback((access, userRole) => {
    setAccessToken(access);
    setRole(userRole);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRole(null);
  }, []);

  useEffect(() => {
    if (restored.current) {
      return;
    }
    restored.current = true;
    const restoreSession = async () => {
      console.log("Trying to refresh session");
      try {
        const access = await refreshAccessToken();
        console.log("New access token received");
        setAccessToken(access);
        const profile = await getProfile(access);
        setRole(profile.data.role);
      } catch (error) {
        console.log("Refresh failed:", error);
        setAccessToken(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      login,
      logout,
      loading,
      role,
    }),
    [accessToken, login, logout, loading, role],
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
