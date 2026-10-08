// import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";

// import { getEmployees } from "../api/getEmployeeApi";

// import EmployeeTable from "../components/EmployeeTable";
// import EmployeeTableSkeleton from "../components/EmployeeTableSkeleton";

function ManageEmployees() {
  const navigate = useNavigate();

  // const [employees, setEmployees] = useState([]);
  // const [search, setSearch] = useState("");
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");

  // useEffect(() => {
  //   const fetchEmployees = async () => {
  //     try {
  //       setLoading(true);
  //       setError("");

  //       const response = await getEmployees();

  //       setEmployees(response.data.employees || []);
  //     } catch (error) {
  //       setError(error.message || "Unable to load employees.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchEmployees();
  // }, []);

  // const filteredEmployees = employees.filter((employee) => {
  //   const value = search.toLowerCase();
  //   return (
  //     employee?.name?.toLowerCase().includes(value) ||
  //     employee?.email?.toLowerCase().includes(value) ||
  //     employee?.role?.toLowerCase().includes(value) ||
  //     employee?.store?.toLowerCase().includes(value) ||
  //     employee?.warehouse?.toLowerCase().includes(value) ||
  //     employee?.status?.toLowerCase().includes(value)
  //   );
  // });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-['Google_Sans_Flex'] text-2xl font-semibold sm:text-3xl">
          Manage Employees
        </h1>
        <p className="mt-2 text-sm text-[#9697a1]">
          Manage your inventory accessible to your staff/employees.
        </p>
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-xl bg-[#10111f] px-3">
          <FiSearch size={16} className="shrink-0 text-[#9697a1]" />
          <input
            type="text"
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Employee"
            className="w-full bg-transparent text-sm text-[#e6e6e8] outline-none placeholder:text-[#9697a1]"
          />
        </div>
        <button
          type="button"
          onClick={() => navigate("/add-employee")}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#b4bedd] px-4 text-sm font-semibold text-[#00010f] transition hover:bg-[#e6e6e8]"
        >
          <FiPlus size={16} />
          Add Employee
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl bg-[#10111f]/10">
        <div className="border-b border-[#2b2c40] px-5 py-4">
          <h2 className="text-base font-medium text-[#e6e6e8]">
            Employee Details
          </h2>
        </div>
        {/* {loading && <EmployeeTableSkeleton />}
        {!loading && error && (
          <div className="px-5 py-8 text-sm text-[#d14d4d]">{error}</div>
        )}
        {!loading && !error && filteredEmployees.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-[#9697a1]">
            {search ? "No employees match your search." : "No employees found."}
          </div>
        )}
        {!loading && !error && filteredEmployees.length > 0 && (
          <EmployeeTable employees={filteredEmployees} />
        )} */}
      </div>
    </div>
  );
}

export default ManageEmployees;
