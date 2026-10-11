import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";

import { getEmployees } from "../api/getEmployeeApi";
import { deleteEmployee } from "../api/deleteEmployeeApi";
import { cancelEmployeeInvite } from "../api/cancelEmployeeInviteApi";

import EmployeeTable from "../components/EmployeeTable";
import EmployeeTableSkeleton from "../components/EmployeeTableSkeleton";

import { useAuth } from "../../../context/AuthContext";

function ManageEmployees() {
  const navigate = useNavigate();
  const { accessToken, loading: authLoading } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    const fetchEmployees = async () => {
      if (!accessToken) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getEmployees(accessToken);
        const data = response.data;

        const accepted = (data.employees ?? []).map((item) => ({
          ...item,
          status: item.status || "Approved",
          rowType: "employee",
        }));

        const pending = (data.invites ?? []).map((item) => ({
          ...item,
          status: "Pending",
          rowType: "invite",
        }));

        setEmployees([...accepted, ...pending]);
      } catch (error) {
        setError(error.message || "Unable to load employees.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [accessToken, authLoading]);

  const handleDelete = async (item) => {
    const isPending = item.rowType === "invite";
    const id = item.id;
    if (id == null) {
      toast.error("Unable to identify this record.");
      return;
    }
    const confirmed = window.confirm(
      isPending
        ? "Are you sure you want to cancel this invitation?"
        : "Are you sure you want to remove this employee?",
    );
    if (!confirmed) return;
    setDeletingId(id);
    try {
      if (isPending) {
        await cancelEmployeeInvite(id, accessToken);
      } else {
        await deleteEmployee(id, accessToken);
      }
      setEmployees((current) =>
        current.filter(
          (employee) =>
            !(employee.rowType === item.rowType && employee.id === id),
        ),
      );
      toast.success(isPending ? "Invitation cancelled." : "Employee removed.");
    } catch (error) {
      toast.error(error.message || "Unable to complete the action.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEmployees = employees.filter((item) => {
    const name = item.name ?? "";
    const email = item.email ?? "";
    return `${name} ${email} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-['Google_Sans_Flex'] text-2xl font-semibold text-(--text-color) sm:text-3xl">
          Manage Employees
        </h1>
        <p className="mt-2 text-sm text-(--secondary-text-color)">
          Make your inventory accessible to your staff/employees.
        </p>
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-xl bg-(--input-background) px-3">
          <FiSearch
            size={16}
            className="shrink-0 text-(--secondary-text-color)"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Employee"
            className="w-full bg-transparent text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color)"
          />
        </div>
        <button
          type="button"
          onClick={() => navigate("/add-employee")}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-(--accent-color) px-4 text-sm font-semibold text-[#00010f] transition hover:opacity-90"
        >
          Add Employee
          <FiPlus size={16} />
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-(--border-color) bg-(--card-background)">
        <div className="border-b border-(--border-color) px-4 py-3 sm:px-5">
          <h2 className="text-base font-medium text-(--text-color)">
            Employee Details
          </h2>
        </div>
        {loading && <EmployeeTableSkeleton />}
        {!loading && error && (
          <div className="px-5 py-8 text-sm text-(--error-color)">{error}</div>
        )}
        {!loading && !error && filteredEmployees.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-(--secondary-text-color)">
            {search ? "No employees match your search." : "No employees found."}
          </div>
        )}
        {!loading && !error && filteredEmployees.length > 0 && (
          <EmployeeTable
            employees={filteredEmployees}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </div>
    </div>
  );
}

export default ManageEmployees;
