import { getSuppliers, deleteSuppliers } from "../api/supplierApi";

import PeopleTableSkeleton from "../components/PeopleTableSkeleton";
import ManagePeople from "../components/ManagePeople";

const loadSupplierItems = async (accessToken) => {
  const response = await getSuppliers(accessToken);
  return (response.data ?? []).map((item) => ({
    ...item,
    name: item.display_name,
    status: item.status?.charAt(0).toUpperCase() + item.status?.slice(1),
    rowType: "supplier",
  }));
};

const removeSupplierItem = async (item, accessToken) => {
  return deleteSuppliers(accessToken, item.id);
};

const supplierColumns = [
  { key: "name", label: "Supplier Name", width: "30%" },
  { key: "email", label: "Email", width: "40%" },
  { key: "status", label: "Status", width: "15%" },
];

const getSupplierStatusClass = (status) => {
  if (status === "Linked") {
    return "bg-[#26af41]/20 text-[#5fba71]";
  }
  if (status === "Invited") {
    return "bg-[#454645]/37 text-(--text-color)";
  }
  return "";
};

function ManageSuppliers() {
  return (
    <ManagePeople
      title="Manage Suppliers"
      description="Manage the suppliers connected to your business."
      searchPlaceholder="Search Supplier"
      addButtonLabel="Add Supplier"
      addRoute="/add-supplier"
      detailsTitle="Supplier Details"
      columns={supplierColumns}
      loadItems={loadSupplierItems}
      removeItem={removeSupplierItem}
      Skeleton={PeopleTableSkeleton}
      getStatusClass={getSupplierStatusClass}
      emptyMessage="No suppliers found."
      searchEmptyMessage="No suppliers match your search."
    />
  );
}

export default ManageSuppliers;
