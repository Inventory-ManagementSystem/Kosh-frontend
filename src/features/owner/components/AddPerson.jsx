import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdArrowRoundBack } from "react-icons/io";

import { useAuth } from "../../../context/AuthContext";
import NavigationButton from "../../../components/auth/NavigationButton";

function AddPersonForm({
  title,
  image,
  fields,
  submitApi,
  successMessage,
  redirectTo,
}) {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const initialFormData = Object.fromEntries(
    fields.map((field) => [field.name, ""]),
  );

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const field = fields.find((field) => field.name === name);
    const trimmedValue = value.trim();
    let error = "";
    if (!trimmedValue && field.required !== false) {
      error = `${field.label} is required`;
    } else if (trimmedValue && name === "email") {
      if (/[^\x00-\x7F]/.test(trimmedValue)) {
        error = "Emojis are not allowed";
      } else if (trimmedValue.length > 30) {
        error = "Maximum limit reached";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        error = "Enter a valid email address";
      }
    } else if (trimmedValue && name === "phone") {
      if (!/^\d{10}$/.test(trimmedValue)) {
        error = "Phone number must be of 10 digits";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach((field) => {
      const value = formData[field.name].trim();
      if (!value && field.required !== false) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.name === "email") {
        if (/[^\x00-\x7F]/.test(value)) {
          newErrors[field.name] = "Emojis are not allowed";
        } else if (value.length > 30) {
          newErrors[field.name] = "Maximum limit reached";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field.name] = "Enter a valid email address";
        }
      } else if (field.name === "phone") {
        if (!/^\d{10}$/.test(value)) {
          newErrors[field.name] = "Phone number must be of 10 digits";
        }
      }
    });
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const data = await submitApi(formData, accessToken);
      toast.success(data.message || successMessage);
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.message || "Failed to submit form.");
    }
  };

  const isFormFilled = fields
    .filter((field) => field.required !== false)
    .every((field) => Boolean(formData[field.name].trim()));

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-2 text-(--text-color)">
      <div className="w-full max-w-4xl pt-10 sm:pt-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-3 top-3 z-10 cursor-pointer text-(--icon-accent-color)"
        >
          <IoMdArrowRoundBack size={20} />
        </button>

        <div className="mb-8 text-left">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        </div>

        <div className="mx-auto w-full max-w-md rounded-lg border border-(--border-color) bg-(--card-background) p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full lg:w-1/2 lg:pr-8"
          >
            {fields.map((field) => (
              <div className="mb-5" key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-medium text-(--text-color)"
                >
                  {field.label}
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  maxLength={field.maxLength}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={`w-full rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none transition placeholder:text-(--secondary-text-color) ${
                    errors[field.name]
                      ? "border-(--error-color)"
                      : "border-(--border-color) focus:border-(--icon-accent-color)"
                  }`}
                />

                {errors[field.name] && (
                  <p className="mt-2 text-xs text-(--error-color)">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            <NavigationButton type="submit" isFormFilled={isFormFilled}>
              {title}
            </NavigationButton>
          </form>

          {image && (
            <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:self-stretch lg:pl-8">
              <div className="flex h-72 w-full items-center justify-center rounded-lg">
                <img
                  src={image}
                  alt={`${title} illustration`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default AddPersonForm;
