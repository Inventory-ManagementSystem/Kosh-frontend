import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLoadingScreen from "../../components/auth/AuthLoadingScreen";

function HomePage() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role === "owner") {
    return <Navigate to="/dashboard" replace />;
  }
  if (role === "employee") {
    return <Navigate to="/employee-dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

export default HomePage;
