import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import addEmployeeImage from "../../../assets/auth/addEmployee.svg";

import { addEmployee } from "../api/addEmployeeApi";

function AddEmployee() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "email") {
      if (!value.trim()) {
        setErrors({ ...errors, email: "Email is required" });
      } else if (/[^\x00-\x7F]/.test(value)) {
        setErrors({ ...errors, email: "Emojis are not allowed" });
      } else if (value.length > 30) {
        setErrors({ ...errors, email: "Maximum limit reached" });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors({ ...errors, email: "Enter a valid email address" });
      } else {
        setErrors({ ...errors, email: "" });
      }
    } else if (name === "phone") {
      if (!value.trim()) {
        setErrors({ ...errors, phone: "Phone number is required" });
      } else if (!/^\+?\d*$/.test(value)) {
        setErrors({
          ...errors,
          phone: "Phone number can contain only digits and an optional +",
        });
      } else if (!/^\+?\d{10,15}$/.test(value)) {
        setErrors({ ...errors, phone: "Phone number must be 10-15 digits" });
      } else {
        setErrors({ ...errors, phone: "" });
      }
    }
  };
  const validateForm = () => {
    const newErrors = {
      email: "",
      phone: "",
    };
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (/[^\x00-\x7F]/.test(formData.email)) {
      newErrors.email = "Emojis are not allowed";
    } else if (formData.email.length > 30) {
      newErrors.email = "Maximum limit reached";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10-15 digits";
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const data = await addEmployee(formData, accessToken);
      toast.success(data.message || "Employee invite sent successfully.");
      navigate("/employees");
    } catch (error) {
      toast.error(error.message || "Failed to send employee invite.");
    }
  };

  const isFormFilled =
    Boolean(formData.email.trim()) && Boolean(formData.phone);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-2 text-[#e6e6e8]">
      <div className="w-full max-w-4xl pt-10 sm:pt-0">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Add Employee</h1>
        </div>
        <div className="mx-auto w-full max-w-md rounded-lg border border-[#2b2c40] bg-[#000112] p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <form
            noValidate
            onSubmit={handleAddEmployee}
            className="w-full lg:w-1/2 lg:pr-8"
          >
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                Employee's Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your employee's email"
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
                  errors.email
                    ? "border-[#d14d4d] focus:border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-xs text-[#d14d4d]">{errors.email}</p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                Employee's Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                maxLength={15}
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter employee's phone number"
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
                  errors.phone
                    ? "border-[#d14d4d] focus:border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              />
              {errors.phone && (
                <p className="mt-2 text-xs text-[#d14d4d]">{errors.phone}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormFilled}
              className="w-full rounded-md bg-[#b4bedd] py-3 text-sm font-semibold text-[#000119] transition duration-200 hover:bg-[#e6e6e8]"
            >
              Add Employee
            </button>
          </form>

          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:self-stretch lg:pl-8">
            <div className="flex h-72 w-full items-center justify-center rounded-lg">
              <img
                src={addEmployeeImage}
                alt="Add Employee illustration"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AddEmployee;
