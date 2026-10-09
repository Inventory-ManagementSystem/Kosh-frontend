import { FiSearch, FiBell, FiSun, FiLogOut, FiUser } from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";
import { logoutUser } from "../../../api/logoutApi";

function OwnerTopbar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    } finally {
      logout();
    }
  };

  return (
    <header className="fixed left-57.5 right-0 top-0 z-30 h-18 bg-[#00010f]">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[320px] lg:block">
          <div className="flex h-10 items-center gap-3 rounded-xl bg-[#10111f] px-3">
            <FiSearch size={17} className="text-[#9697a1]" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent text-sm text-[#e6e6e8] outline-none placeholder:text-[#666875]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#9697a1] hover:bg-[#10111f] hover:text-[#e6e6e8]">
            <FiBell size={18} />
          </button>

          <button className="hidden h-10 w-10 items-center justify-center rounded-full text-[#9697a1] hover:bg-[#10111f] hover:text-[#e6e6e8] sm:flex">
            <FiSun size={18} />
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1b29] text-[#b4bedd]">
            <FiUser size={18} />
          </button>

          <button
            onClick={handleLogout}
            className="hidden rounded-xl border border-[#2b2c40] px-4 py-2 text-sm text-[#e6e6e8] hover:bg-[#10111f] sm:block"
          >
            Logout
          </button>

          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#9697a1] hover:bg-[#10111f] hover:text-[#e6e6e8] sm:hidden"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default OwnerTopbar;
