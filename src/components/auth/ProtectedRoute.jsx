import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  console.log("PROTECTED ROUTE:", { isAuthenticated, loading });
  if (loading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
