import { NavLink } from "react-router-dom";

import { MdDashboard } from "react-icons/md";
import { CgPushLeft } from "react-icons/cg";
import { CgPushRight } from "react-icons/cg";
import { FaWarehouse } from "react-icons/fa6";
import { FaCartShopping } from "react-icons/fa6";
import { IoMdListBox } from "react-icons/io";
import { BiSolidReport } from "react-icons/bi";
import { BiSolidSend } from "react-icons/bi";
import { MdPersonAddAlt1 } from "react-icons/md";

export const employeeNavItems = [
  { label: "Dashboard", path: "/employee-dashboard", icon: MdDashboard },
  { label: "Warehouse", path: "/employee-warehouse", icon: FaWarehouse },
  { label: "Orders", path: null, icon: FaCartShopping },
  { label: "Create GRN", path: null, icon: IoMdListBox },
  { label: "Report", path: null, icon: BiSolidReport },
  { label: "Dispatch Stock", path: null, icon: BiSolidSend },
  { label: "Kosh AI", path: null, icon: MdPersonAddAlt1 },
];

function EmployeeSidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`
        fixed left-0 top-18 z-40
        hidden lg:block
        h-[calc(100vh-4.5rem)]
        overflow-y-auto overflow-x-hidden
        [&::-webkit-scrollbar]:hidden
        bg-(--page-background)
        transition-all duration-300
        ${collapsed ? "w-18" : "w-57.5"}
      `}
    >
      <div className="flex min-h-full flex-col">
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {employeeNavItems.map((item, index) => {
              const Icon = item.icon;

              const itemClass = `
                flex h-9 items-center rounded-lg
                transition-colors duration-200
                ${collapsed ? "justify-center" : "gap-3 px-3"}
                text-(--secondary-text-color)
                hover:bg-(--sidebar-hover-background)
                hover:text-(--text-color)
              `;

              return item.path ? (
                <NavLink
                  key={item.label}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  style={{
                    marginTop: [1, 4].includes(index) ? "24px" : undefined,
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
                  {!collapsed && (
                    <span className="whitespace-nowrap text-xs font-medium">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ) : (
                <div
                  key={item.label}
                  title={collapsed ? item.label : undefined}
                  style={{
                    marginTop: [1, 4, 11].includes(index) ? "24px" : undefined,
                  }}
                  className={itemClass}
                >
                  <Icon size={17} className="shrink-0" />
                  {!collapsed && (
                    <span className="whitespace-nowrap text-xs font-medium">
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="sticky bottom-0 bg-(--page-background) p-3">
          <button
            type="button"
            onClick={() => setCollapsed((previous) => !previous)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`
              flex h-10 w-full items-center rounded-lg
              text-(--secondary-text-color)
              transition-colors
              hover:bg-(--sidebar-hover-background)
              hover:text-(--text-color)
              ${collapsed ? "justify-center" : "gap-3 px-3"}
            `}
          >
            {collapsed ? <CgPushRight size={18} /> : <CgPushLeft size={18} />}
            {!collapsed && (
              <span className="whitespace-nowrap text-xs font-medium">
                Collapse/Expand
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default EmployeeSidebar;
