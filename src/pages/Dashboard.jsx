import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../api/logoutApi";

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log("Logout API failed:", error.message);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#00010f] text-[#e6e6e8]">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm border border-white/20 rounded-md hover:bg-white/10 transition"
        >
          Logout
        </button>
      </nav>
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-semibold">Welcome to KOSH</h2>
          <p className="mt-2 text-gray-400">
            Your inventory management workspace.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
