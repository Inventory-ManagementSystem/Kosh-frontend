import AddPerson from "../components/AddPerson";
import addEmployeeImage from "../../../assets/auth/addEmployee.svg";
import { addEmployee } from "../api/addEmployeeApi";

function AddEmployee() {
  return (
    <AddPerson
      title="Add Employee"
      image={addEmployeeImage}
      fields={[
        {
          name: "email",
          label: "Employee's Email",
          type: "email",
          placeholder: "Enter your employee's email",
          maxLength: 30,
        },
        {
          name: "phone",
          label: "Employee's Phone Number",
          type: "tel",
          placeholder: "Enter employee's phone number",
          maxLength: 10,
        },
      ]}
      submitApi={addEmployee}
      successMessage="Employee invite sent successfully."
      redirectTo="/employees"
    />
  );
}

export default AddEmployee;
