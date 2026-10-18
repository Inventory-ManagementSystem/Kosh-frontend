import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";
import { logoutUser } from "../../../api/logoutApi";
import { useTheme } from "../../../context/ThemeContext";
import { employeeNavItems } from "./EmployeeSidebar";

function EmployeeTopbar() {
  const { logout } = useAuth();
  const { themes, toggleTheme } = useTheme();
  const theme = themes.owner;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    } finally {
      setMobileMenuOpen(false);
      logout();
    }
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 h-18 bg-(--page-background) lg:left-57.5">
        <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          <div className="min-w-0 w-full max-w-[320px]">
            <div className="flex h-10 items-center gap-2 rounded-xl bg-(--input-background) px-3">
              <FiSearch
                size={17}
                className="shrink-0 text-(--secondary-text-color)"
              />
              <input
                type="text"
                placeholder="Search"
                aria-label="Search"
                className="w-full min-w-0 bg-transparent text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color)"
              />
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-10 w-9 items-center justify-center rounded-full text-(--secondary-text-color) hover:bg-(--input-background) hover:text-(--text-color) sm:w-10"
            >
              <FiBell size={18} />
            </button>

            <button
              type="button"
              onClick={() => toggleTheme("owner")}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="flex h-10 w-9 items-center justify-center rounded-full text-(--secondary-text-color) hover:bg-(--input-background) hover:text-(--text-color) sm:w-10"
            >
              {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-xl border border-(--border-color) px-4 py-2 text-sm text-(--text-color) hover:bg-(--input-background) lg:block"
            >
              Logout
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-(--secondary-text-color) hover:bg-(--input-background) hover:text-(--text-color) lg:hidden"
            >
              {mobileMenuOpen ? <FiX size={21} /> : <FiMenu size={21} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-18 z-40 overflow-y-auto border-t border-(--border-color) bg-(--page-background) lg:hidden">
          <nav className="space-y-1 px-3 py-4">
            {employeeNavItems.map((item, index) => {
              const Icon = item.icon;

              const itemClass = `
                flex min-h-11 items-center gap-3 rounded-lg px-3
                text-(--secondary-text-color)
                transition-colors duration-200
                hover:bg-(--sidebar-hover-background)
                hover:text-(--text-color)
              `;

              return item.path ? (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    marginTop: [1, 4, 11].includes(index) ? "24px" : undefined,
                  }}
                  className={({ isActive }) => `
                    ${itemClass}
                    ${
                      isActive
                        ? "bg-(--sidebar-active-background) text-(--text-color)"
                        : ""
                    }
                  `}
                >
                  <Icon size={17} className="shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ) : (
                <div
                  key={item.label}
                  style={{
                    marginTop: [1, 4, 11].includes(index) ? "24px" : undefined,
                  }}
                  className={itemClass}
                >
                  <Icon size={17} className="shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-(--border-color) p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-(--text-color) transition-colors hover:bg-(--sidebar-hover-background)"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default EmployeeTopbar;
