import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLoadingScreen from "./AuthLoadingScreen";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  console.log("PROTECTED ROUTE:", { isAuthenticated, loading });
  if (loading) {
    return <AuthLoadingScreen />;
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
