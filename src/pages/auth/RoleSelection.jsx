import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import RoleCard from "../../components/auth/RoleCard";
import AuthDecorations from "../../components/auth/AuthDecoration";

import firstscreen from "../../assets/auth/firstscreen.svg";
import logo from "../../assets/auth/logo.svg";

function RoleSelection() {
  const navigate = useNavigate();
  const [role, setRole] = useState("business_owner");

  const handleNext = () => {
    navigate("/signup", { state: { role } });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#00010f] text-[#e6e6e8]">
      <AuthDecorations />
      <Link to="/" className="fixed left-8 top-8 z-50">
        <img src={logo} alt="KOSH" className="h-4 w-auto sm:h-5" />
      </Link>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-8 py-20 lg:px-12">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-semibold sm:text-5xl">
              Choose your
              <span className="block font-extrabold text-[#b4bedd]">
                Workplace.
              </span>
            </h1>
            <div className="mt-8 flex flex-col gap-4">
              <RoleCard
                title="Business Owner"
                active={role === "business_owner"}
                onSelect={() => setRole("business_owner")}
              />
              <RoleCard
                title="Employee"
                active={role === "employee"}
                onSelect={() => setRole("employee")}
              />
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="mt-6 w-24 rounded-md bg-[#b4bedd] py-2 text-xs font-bold text-[#000119] transition hover:bg-[#95a3cf]"
            >
              Next
            </button>
          </div>
          <div className="hidden flex-col items-center justify-center lg:flex">
            <img
              src={firstscreen}
              alt="KOSH workplace"
              className="w-full max-w-lg"
            />
            <div className="mt-5 flex h-5 w-48 items-center justify-center rounded-full bg-[#16172b] text-[7px] text-[#9697a1]">
              Inventory&nbsp;&nbsp;•&nbsp;&nbsp;Stock&nbsp;&nbsp;•&nbsp;&nbsp;Invoice&nbsp;&nbsp;•&nbsp;&nbsp;Payment
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RoleSelection;
