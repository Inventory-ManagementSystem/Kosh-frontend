import {
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";
import { logoutUser } from "../../../api/logoutApi";
import { useTheme } from "../../../context/ThemeContext";

function OwnerTopbar() {
  const { logout } = useAuth();
  const { themes, toggleTheme } = useTheme();
  const theme = themes.owner;

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
    <header className="fixed left-57.5 right-0 top-0 z-30 h-18 bg-(--page-background)">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[320px] lg:block">
          <div className="flex h-10 items-center gap-3 rounded-xl bg-(--input-background) px-3">
            <FiSearch size={17} className="text-(--secondary-text-color)" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color)"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full text-(--secondary-text-color) hover:bg-(--input-background) hover:text-(--text-color)"
          >
            <FiBell size={18} />
          </button>

          <button
            type="button"
            onClick={() => toggleTheme("owner")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-(--secondary-text-color) hover:bg-(--input-background) hover:text-(--text-color)"
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <button
            type="button"
            aria-label="Profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-(--card-background) text-(--accent-color)"
          >
            <FiUser size={18} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-xl border border-(--border-color) px-4 py-2 text-sm text-(--text-color) hover:bg-(--input-background) sm:block"
          >
            Logout
          </button>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-(--secondary-text-color) hover:bg-(--input-background) hover:text-(--text-color) sm:hidden"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default OwnerTopbar;
