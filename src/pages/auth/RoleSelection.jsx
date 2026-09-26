import { useNavigate } from "react-router-dom";
import RoleCard from "../../components/auth/RoleCard";
import AuthDecoration from "../../components/auth/AuthDecoration";

function RoleSelection() {
  const navigate = useNavigate();

  const handleSignup = (role) => {
    navigate("/signup", { state: { role } });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#00010f] px-4 py-8 text-[#e6e6e8] sm:px-6">
      <AuthDecoration />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Welcome to KOSH</h1>
        </div>

        <div className="flex w-full flex-col items-center gap-14 sm:flex-row sm:justify-center">
          <RoleCard
            title="Business Owner"
            description="Full access to all the features and settings"
            active={false}
            onSignup={() => handleSignup("business_owner")}
          />

          <RoleCard
            title="Employee/Staff"
            description="Access limited to assigned features"
            active={false}
            onSignup={() => handleSignup("employee")}
          />
        </div>

        <p className="mt-10 text-sm text-[#9697a1]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium text-[#b4bedd] transition hover:text-[#e6e6e8]"
          >
            Login
          </button>
        </p>
      </div>
    </main>
  );
}

export default RoleSelection;
