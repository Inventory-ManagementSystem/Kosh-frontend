import { useNavigate } from "react-router-dom";
import { FiPackage, FiUsers, FiShoppingBag } from "react-icons/fi";
import cuate from "../../../assets/auth/cuate.svg";

function NewSupplierDashboard({ name }) {
  const navigate = useNavigate();

  const buttons = [
    {
      label: "Manage Quotations",
      icon: FiPackage,
      path: "/quotations",
    },
    {
      label: "Manage Account",
      icon: FiUsers,
      path: "/account-details",
    },
    {
      label: "View RFQ",
      icon: FiShoppingBag,
      path: "/supplier-rfqs",
    },
  ];

  return (
    <div className="dashboard min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <div className="w-full">
        <div className="text-left">
          <h1 className="font-['Google_Sans_Flex'] truncate text-2xl font-semibold text-(--accent-color) sm:text-4xl lg:text-5xl">
            Hello{name ? ` ${name},` : ""}
          </h1>
          <p className="mt-2 text-xl font-medium text-(--text-color) sm:text-2xl lg:text-3xl">
            Welcome to KOSH
          </p>
        </div>

        <div className="my-8 flex w-full items-center justify-center sm:my-10">
          <img
            src={cuate}
            alt="dashboard"
            className="h-auto w-full max-w-sm object-contain sm:max-w-lg lg:max-w-xl"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          {buttons.map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="flex min-h-12 w-full max-w-xs items-center justify-center gap-3 rounded-full border border-(--border-color) bg-(--card-background) px-6 py-3 text-sm font-medium text-(--text-color) transition hover:border-(--accent-color) hover:bg-(--decoration-background) sm:w-auto"
            >
              <Icon size={18} className="text-(--accent-color)" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewSupplierDashboard;
