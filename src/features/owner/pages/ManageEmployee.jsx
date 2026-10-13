import { getEmployees } from "../api/getEmployeeApi";
import { deleteEmployee } from "../api/deleteEmployeeApi";
import { cancelEmployeeInvite } from "../api/cancelEmployeeInviteApi";
import PeopleTableSkeleton from "../components/PeopleTableSkeleton";
import ManagePeople from "../components/ManagePeople";

const loadEmployeeItems = async (accessToken) => {
  const response = await getEmployees(accessToken);
  const data = response.data;
  const employees = (data.employees ?? []).map((item) => ({
    ...item,
    status: item.status || "Approved",
    rowType: "employee",
  }));
  const invites = (data.invites ?? []).map((item) => ({
    ...item,
    status: "Pending",
    rowType: "invite",
  }));
  return [...employees, ...invites];
};

const removeEmployeeItem = async (item, accessToken) => {
  if (item.rowType === "invite") {
    return cancelEmployeeInvite(item.id, accessToken);
  }
  return deleteEmployee(item.id, accessToken);
};

const employeeColumns = [
  { key: "name", label: "Name", width: "35%" },
  { key: "email", label: "Email", width: "27%" },
  { key: "status", label: "Status", width: "23%" },
];

const getEmployeeStatusClass = (status) => {
  if (status === "Approved") {
    return "bg-[#26af41]/20 text-[#5fba71]";
  }
  if (status === "Pending") {
    return "bg-[#454645]/37 text-(--text-color)";
  }
  return "";
};

function ManageEmployees() {
  return (
    <ManagePeople
      title="Manage Employees"
      description="Make your inventory accessible to your staff/employees."
      searchPlaceholder="Search Employee"
      addButtonLabel="Add Employee"
      addRoute="/add-employee"
      detailsTitle="Employee Details"
      columns={employeeColumns}
      loadItems={loadEmployeeItems}
      removeItem={removeEmployeeItem}
      Skeleton={PeopleTableSkeleton}
      getStatusClass={getEmployeeStatusClass}
      emptyMessage="No employees found."
      searchEmptyMessage="No employees match your search."
    />
  );
}

export default ManageEmployees;
