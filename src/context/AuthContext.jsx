import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { refreshAccessToken, setOnTokenRefresh } from "../api/refreshTokenApi";
import { getProfile } from "../api/getProfileApi";
import { logoutUser } from "../api/logoutApi";
import { disablePush } from "../features/notifications/pushService";
import {
  markLogin,
  clearLoginMarkers,
  canRestoreSession,
} from "../utils/remember";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const restored = useRef(false);
  const tokenRef = useRef(null);
  tokenRef.current = accessToken;

  const login = useCallback((access, userRole, remember = true) => {
    console.log("LOGIN CONTEXT CALLED");
    markLogin(remember);
    setAccessToken(access);
    setRole(userRole);
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    const profile = await getProfile(accessToken);
    setRole(profile.data.role);
    return profile.data;
  }, [accessToken]);

  const logout = useCallback(async () => {
    try {
      await disablePush(tokenRef.current);
      await logoutUser();
    } finally {
      clearLoginMarkers();
      setAccessToken(null);
      setRole(null);
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    setOnTokenRefresh(setAccessToken);
    return () => {
      setOnTokenRefresh(null);
    };
  }, []);
  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const timer = setTimeout(
      async () => {
        try {
          await refreshAccessToken();
        } catch (error) {
          console.error("Scheduled token refresh failed:", error);
        }
      },
      8 * 60 * 1000,
    );
    return () => {
      clearTimeout(timer);
    };
  }, [accessToken]);

  useEffect(() => {
    if (restored.current) {
      return;
    }
    restored.current = true;
    const restoreSession = async () => {
      if (!canRestoreSession()) {
        try {
          await logoutUser();
        } catch {
          // ignore
        }
        clearLoginMarkers();
        setAccessToken(null);
        setRole(null);
        setLoading(false);
        return;
      }
      console.log("Trying to refresh session");
      try {
        const access = await refreshAccessToken();
        console.log("New access token received");
        setAccessToken(access);
        const profile = await getProfile(access);
        console.log("Profile received:", profile);
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
      refreshProfile,
    }),
    [accessToken, login, logout, loading, role, refreshProfile],
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
