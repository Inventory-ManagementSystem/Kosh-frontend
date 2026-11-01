import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHomeRoute } from "../../utils/onboarding";
import AuthLoadingScreen from "./AuthLoadingScreen";

function RequireSetupRole({ roleKey, children }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role) return <Navigate to={getHomeRoute(role)} replace />;

  if (sessionStorage.getItem("chosenRole") !== roleKey) {
    return <Navigate to="/role" replace />;
  }
  return children ?? <Outlet />;
}

export default RequireSetupRole;
