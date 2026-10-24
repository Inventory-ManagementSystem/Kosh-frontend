import { NavLink } from "react-router-dom";

import { MdDashboard } from "react-icons/md";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { CgPushLeft } from "react-icons/cg";
import { CgPushRight } from "react-icons/cg";
import { IoMdListBox } from "react-icons/io";
import { MdAccountBalanceWallet } from "react-icons/md";
import { MdPersonAddAlt1 } from "react-icons/md";
import { BiSolidReport } from "react-icons/bi";
import { FaClipboardList } from "react-icons/fa";

export const supplierNavItems = [
  { label: "Dashboard", path: "/supplier-dashboard", icon: MdDashboard },
  { label: "New RFQ", path: "/supplier-rfqs", icon: TbAlertTriangleFilled },
  { label: "All Quotation", path: "/quotations", icon: FaClipboardList },
  { label: "PO & Invoice", path:"/supplier/orders", icon: IoMdListBox },
  { label: "Kosh AI", path: "/supplier/kosh-ai", icon: MdPersonAddAlt1 },
  {
    label: "Account Details",
    path: "/account-details",
    icon: MdAccountBalanceWallet,
  },
];

function SupplierSidebar({ collapsed, setCollapsed }) {
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
            {supplierNavItems.map((item, index) => {
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

export default SupplierSidebar;
