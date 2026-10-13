import AddPerson from "../components/AddPerson";
import addEmployeeImage from "../../../assets/auth/addEmployee.svg";
import { addSuppliers } from "../api/supplierApi";

function AddSupplier() {
  return (
    <AddPerson
      title="Add Supplier"
      image={addEmployeeImage}
      fields={[
        {
          name: "label",
          label: "Supplier Label",
          type: "text",
          placeholder: "Enter supplier label",
          maxLength: 30,
        },
        {
          name: "email",
          label: "Supplier's Email",
          type: "email",
          placeholder: "Enter supplier's email",
          maxLength: 30,
        },
        {
          name: "phone",
          label: "Supplier's Phone Number",
          type: "tel",
          placeholder: "Enter supplier's phone number",
          maxLength: 10,
        },
      ]}
      submitApi={(formData, accessToken) => addSuppliers(accessToken, formData)}
      successMessage="Supplier added successfully."
      redirectTo="/suppliers"
    />
  );
}

export default AddSupplier;
