import { useState } from "react";
import { Outlet } from "react-router-dom";

import OwnerSidebar from "../features/owner/components/OwnerSidebar";
import OwnerTopbar from "../features/owner/components/OwnerTopbar";
import logo from "../assets/auth/logo.svg";

function OwnerLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#00010f] text-[#e6e6e8]">
      <div className="fixed left-0 top-0 z-50 flex h-18 w-57.5 items-center px-5 bg-[#00010f]">
        <img src={logo} alt="KOSH" className="h-7 w-auto shrink-0" />
      </div>
      <OwnerTopbar />
      <OwnerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className={`
          min-h-screen
          ml-18
          pt-18
          transition-all
          ${collapsed ? "lg:ml-18" : "lg:ml-57.5"}
        `}
      >
        <div className="relative min-h-screen overflow-hidden">
          <div
            className="
              pointer-events-none
              absolute left-1/2 top-1/3
              h-97.5 w-93
              
              rounded-full
              bg-[#6EFFFF]
              opacity-20
              blur-[225px]
            "
          />
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
export default OwnerLayout;
