import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoCheckmarkOutline } from "react-icons/io5";

import logo from "../../assets/auth/logo.svg";
import AuthDecorations from "../../components/auth/AuthDecoration";

function SetupComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleDashboard = () => {
    if (location.state?.employee) {
      navigate("/employee-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#020313] text-white relative overflow-hidden">
      <Link to="/" className="fixed  top-8 left-8 sm:left-15">
        <img src={logo} alt="KOSH" className="h-6 w-auto sm:h-7" />
      </Link>
      <AuthDecorations />
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-xl text-center">
          <div className="mx-auto mb-6 sm:mb-8 size-16 sm:size-[68px] rounded-full bg-[#5bc46b] flex items-center justify-center">
            <IoCheckmarkOutline
              className="size-8 sm:size-9 text-white"
              strokeWidth={3}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#f1f2f7]">
            All Set!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400">
            Your business is ready to go
          </p>
          <div className="mt-6 sm:mt-7 w-full rounded-lg bg-[#07181e] px-4 sm:px-6 py-3 sm:py-4">
            <p className="text-xs sm:text-sm leading-relaxed text-[#5bc46b]">
              You can now start using KOSH to manage your inventory, sales,
              invoices and more.
            </p>
          </div>
          <button
            onClick={handleDashboard}
            className="mt-6 sm:mt-7 px-6 sm:px-8 py-2 sm:py-2.5 rounded-md bg-[#b5c1e2] text-xs sm:text-sm font-bold text-[#090b16] hover:bg-[#c5cdeb] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupComplete;
