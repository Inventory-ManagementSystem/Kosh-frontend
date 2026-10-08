import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function HomePage() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
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
