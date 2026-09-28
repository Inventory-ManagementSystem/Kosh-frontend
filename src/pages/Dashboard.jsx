import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../api/logoutApi";

function Dashboard() {
  const { logout, refreshToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser(refreshToken);
    } catch (error) {
      console.log("Logout API failed:", error.message);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
