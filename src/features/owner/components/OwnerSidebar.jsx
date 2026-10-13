import { NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";

import { MdDashboard } from "react-icons/md";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { TbClipboardListFilled } from "react-icons/tb";
import { RiFileList3Fill } from "react-icons/ri";
import { FaWarehouse } from "react-icons/fa6";
import { AiFillProduct } from "react-icons/ai";
import { FaCartShopping } from "react-icons/fa6";
import { IoMdListBox } from "react-icons/io";
import { BiSolidReport } from "react-icons/bi";
import { BsArchiveFill } from "react-icons/bs";
import { BiSolidSend } from "react-icons/bi";
import { MdPersonAddAlt1 } from "react-icons/md";
import { BsPeopleFill } from "react-icons/bs";
import { BsPersonLinesFill } from "react-icons/bs";
import { CgPushLeft } from "react-icons/cg";
import { CgPushRight } from "react-icons/cg";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: MdDashboard,
  },
  {
    label: "RFQ & Alerts",
    path: "null",
    icon: TbAlertTriangleFilled,
  },
  {
    label: "Manage Quotation",
    path: "null",
    icon: TbClipboardListFilled,
  },
  {
    label: "PO & Invoice",
    path: "null",
    icon: RiFileList3Fill,
  },
  {
    label: "Warehouse",
    path: "/warehouse",
    icon: FaWarehouse,
  },
  {
    label: "Add Product",
    path: "null",
    icon: AiFillProduct,
  },
  {
    label: "Orders",
    path: "null",
    icon: FaCartShopping,
  },
  {
    label: "Create GRN",
    path: "null",
    icon: IoMdListBox,
  },
  {
    label: "Report",
    path: "null",
    icon: BiSolidReport,
  },
  {
    label: "Received Stock",
    path: "null",
    icon: BsArchiveFill,
  },
  {
    label: "Dispatch Stock",
    path: "null",
    icon: BiSolidSend,
  },
  {
    label: "Kosh AI",
    path: "null",
    icon: MdPersonAddAlt1,
  },
  {
    label: "Manage Employees",
    path: "/employees",
    icon: BsPeopleFill,
  },
  {
    label: "Manage Suppliers",
    path: "/suppliers",
    icon: BsPersonLinesFill,
  },
];

function OwnerSidebar({ collapsed, setCollapsed }) {
  const sidebarRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !collapsed
      ) {
        setCollapsed(true);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [collapsed, setCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed left-0 top-18 z-50
        h-[calc(100vh-4.5rem)]
        overflow-y-auto overflow-x-hidden
        [scrollbar-one]
        [&::-webkit-scrollbar]:hidden
        bg-(--page-background)
        transition-all duration-300
        ${collapsed ? "w-18" : "w-57.5"}
      `}
    >
      <div className="flex min-h-full flex-col">
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  style={{
                    marginTop: [1, 4, 11].includes(index) ? "24px" : undefined,
                  }}
                  className={({ isActive }) => `
                    flex h-9 items-center rounded-lg
                    transition-colors duration-200
                    ${collapsed ? "justify-center" : "gap-3 px-3"}
                    ${
                      isActive
                        ? "bg-(--sidebar-active-background) text-(--text-color)"
                        : "text-(--secondary-text-color) hover:bg-(--sidebar-hover-background) hover:text-(--text-color)"
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
              );
            })}
          </div>
        </nav>

        <div className="sticky bottom-0 bg-(--page-background) p-3">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
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

export default OwnerSidebar;
