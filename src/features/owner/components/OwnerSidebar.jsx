import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiArchive,
  FiHeadphones,
  FiUserPlus,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FiGrid,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: FiPackage,
  },
  {
    label: "Manage Employees",
    path: "/employees",
    icon: FiUsers,
  },
  {
    label: "Sales & Invoice",
    path: "/sales",
    icon: FiShoppingCart,
  },
  {
    label: "Warehouse",
    path: "/warehouses",
    icon: FiArchive,
  },
  {
    label: "Customer Portal",
    path: "/customers",
    icon: FiHeadphones,
  },
  {
    label: "Kosh",
    path: "/kosh",
    icon: FiUserPlus,
  },
];

function OwnerSidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`
          fixed left-0 top-18 z-50 min-h-screen
          bg-[#00010f]
          transition-all
          ${collapsed ? "w-18" : "w-57.5"}
        `}
    >
      <div className="flex h-full flex-col">
        <nav className="px-3 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `
                      flex h-11 items-center rounded-xl
                      ${collapsed ? "justify-center" : "gap-3 px-3"}
                      ${
                        isActive
                          ? "bg-[#171827] text-[#e6e6e8]"
                          : "text-[#9697a1] hover:bg-[#10111f] hover:text-[#e6e6e8]"
                      }
                      `
                  }
                >
                  <Icon size={19} />

                  {!collapsed && (
                    <span className="whitespace-nowrap text-sm">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
                flex h-11 w-full items-center rounded-xl
                text-[#9697a1]
                transition-colors
                hover:bg-[#10111f]
                hover:text-[#e6e6e8]
                ${collapsed ? "justify-center" : "gap-3 px-3"}
              `}
          >
            {collapsed ? (
              <FiChevronsRight size={19} />
            ) : (
              <FiChevronsLeft size={19} />
            )}

            {!collapsed}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default OwnerSidebar;
