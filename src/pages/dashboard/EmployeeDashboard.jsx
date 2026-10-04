import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../api/logoutApi";

import logo from "../../assets/auth/logo.svg";
import AuthDecoration from "../../components/auth/AuthDecoration";

function EmployeeDashboard() {
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
    <main className="relative min-h-screen overflow-x-hidden bg-[#00010f] text-[#e6e6e8]">
      <div className="fixed left-0 top-0 z-50 h-16 w-full bg-[#00010f] min-[700px]:hidden">
        <Link to="/" className="absolute left-8 top-7">
          <img src={logo} alt="KOSH" className="h-6 w-auto" />
        </Link>
      </div>

      <Link to="/" className="absolute left-10 top-8">
        <img src={logo} alt="KOSH" className="h-7 w-auto" />
      </Link>

      <AuthDecoration />

      <div className="flex min-h-screen flex-col px-4 pt-20 min-[700px]:px-6 min-[700px]:pt-8">
        <div className="absolute left-20 top-20">
          <p className="font-['Google_Sans_Flex'] text-xl font-semibold min-[700px]:text-2xl">
            Employee's Dashboard
          </p>
        </div>

        <div className="absolute left-20 top-30">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-[#2b2c40] px-4 py-2 text-sm text-[#e6e6e8] transition hover:border-[#b4bedd] hover:text-[#b4bedd]"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

export default EmployeeDashboard;
