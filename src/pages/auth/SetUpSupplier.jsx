import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

import AuthDecoration from "../../components/auth/AuthDecoration";
import supplier from "../../assets/auth/supplier.svg";
import logo from "../../assets/auth/logo.svg";

import { registerSupplier, getSupplierCategories } from "../../api/supplierApi";

function SetupSupplier() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState({
    businessName: "",
    phoneNumber: "",
    gstin: "",
    category: "",
    pincode: "",
    city: "",
    address: "",
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      setCategories([]);
      setCategoriesLoading(false);
      return;
    }

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setApiError("");
      try {
        const result = await getSupplierCategories(accessToken);
        const categoryList = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];
        setCategories(categoryList);
        if (categoryList.length === 0) {
          setApiError("No supplier categories were returned.");
        }
      } catch (error) {
        setCategories([]);
        setApiError(error.message || "Unable to load supplier categories.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [accessToken]);

  const validateField = (name, value) => {
    switch (name) {
      case "businessName":
        if (!value.trim()) {
          return "Agency name is required";
        }
        return "";
      case "phoneNumber":
        if (!/^[6-9]\d{9}$/.test(value)) {
          return "Enter a valid 10-digit phone number";
        }
        return "";
      case "gstin":
        if (value && !/^[0-9A-Z]{15}$/.test(value.toUpperCase())) {
          return "Enter a valid 15-character GSTIN";
        }
        return "";
      case "category":
        if (!value) {
          return "Please select a category";
        }
        return "";
      case "pincode":
        if (!/^\d{6}$/.test(value)) {
          return "Enter a valid 6-digit pincode";
        }
        return "";
      case "city":
        if (!value) {
          return "Please select a city";
        }
        return "";
      case "address":
        if (!value.trim()) {
          return "Address is required";
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
    setApiError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([name, value]) => {
      newErrors[name] = validateField(name, value);
    });
    setErrors(newErrors);
    setTouched({
      businessName: true,
      phoneNumber: true,
      gstin: true,
      category: true,
      pincode: true,
      city: true,
      address: true,
    });
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) {
      return;
    }
    if (!accessToken) {
      setApiError("Your session has expired. Please log in again.");
      return;
    }
    setLoading(true);
    try {
      await registerSupplier(
        {
          business_name: formData.businessName.trim(),
          category: Number(formData.category),
          phone_number: formData.phoneNumber,
          gstin: formData.gstin.trim().toUpperCase(),
          pincode: formData.pincode,
          city: formData.city,
          address: formData.address.trim(),
        },
        accessToken,
      );
      navigate("/supplier-dashboard");
    } catch (error) {
      setApiError(
        error.message || "Agency registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
      errors[field] && touched[field]
        ? "border-[#d14d4d]"
        : "border-[#2b2c40] focus:border-[#b4bedd]"
    }`;

  const selectClass = (field) =>
    `${inputClass(field)} ${formData[field] ? "" : "text-[#9697a1]"}`;

  const labelClass = "mb-2 block text-sm font-medium text-[#e6e6e8]";

  const renderError = (field) =>
    touched[field] && errors[field] ? (
      <p className="mt-2 text-xs leading-5 text-[#d14d4d]">{errors[field]}</p>
    ) : null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#00010f] text-[#e6e6e8]">
      <div className="fixed left-0 top-0 z-50 h-16 w-full bg-[#00010f] min-[700px]:hidden">
        <Link to="/" className="absolute left-8 top-7">
          <img src={logo} alt="KOSH" className="h-6 w-auto" />
        </Link>
      </div>

      <Link
        to="/"
        className="absolute left-10 top-8 z-10 hidden min-[700px]:block"
      >
        <img src={logo} alt="KOSH" className="h-7 w-auto" />
      </Link>

      <AuthDecoration />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-8 pt-20 min-[700px]:px-6 min-[700px]:pt-8">
        <div className="mb-4 text-center min-[700px]:mb-5">
          <h1 className="font-['Google_Sans_Flex'] text-xl font-semibold min-[700px]:text-2xl">
            Let's Setup Your Supplying Agency
          </h1>
        </div>

        <section className="relative mx-auto w-full max-w-xl rounded-lg border border-[#2b2c40] bg-[#111222] p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full lg:w-1/2 lg:pr-8"
          >
            <div className="mb-5">
              <label htmlFor="businessName" className={labelClass}>
                Agency Name
              </label>

              <input
                id="businessName"
                name="businessName"
                type="text"
                maxLength={100}
                value={formData.businessName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your agency name"
                className={inputClass("businessName")}
              />

              {renderError("businessName")}
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <label htmlFor="phoneNumber" className={labelClass}>
                  Phone Number
                </label>

                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "phoneNumber",
                        value: e.target.value.replace(/\D/g, "").slice(0, 10),
                      },
                    })
                  }
                  onBlur={handleBlur}
                  placeholder="10-digit number"
                  className={inputClass("phoneNumber")}
                />

                {renderError("phoneNumber")}
              </div>

              <div>
                <label htmlFor="gstin" className={labelClass}>
                  GSTIN
                </label>

                <input
                  id="gstin"
                  name="gstin"
                  type="text"
                  maxLength={15}
                  value={formData.gstin}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "gstin",
                        value: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  onBlur={handleBlur}
                  placeholder="Enter GSTIN"
                  className={inputClass("gstin")}
                />

                {renderError("gstin")}
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="category" className={labelClass}>
                Supplier Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={categoriesLoading || categories.length === 0}
                className={selectClass("category")}
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : categories.length === 0
                      ? "No categories available"
                      : "Select category"}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {renderError("category")}

              {categories.length === 0 && !categoriesLoading && apiError && (
                <p className="mt-2 text-xs leading-5 text-[#d14d4d]">
                  {apiError}
                </p>
              )}
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <label htmlFor="pincode" className={labelClass}>
                  Pincode
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "pincode",
                        value: e.target.value.replace(/\D/g, "").slice(0, 6),
                      },
                    })
                  }
                  onBlur={handleBlur}
                  placeholder="6-digit pincode"
                  className={inputClass("pincode")}
                />

                {renderError("pincode")}
              </div>

              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>

                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={selectClass("city")}
                >
                  <option value="">Select city</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Noida">Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Other">Other</option>
                </select>

                {renderError("city")}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="address" className={labelClass}>
                Full Address
              </label>

              <input
                id="address"
                name="address"
                type="text"
                maxLength={250}
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your agency address"
                className={inputClass("address")}
              />

              {renderError("address")}
            </div>

            {apiError && categories.length > 0 && (
              <p className="mb-4 text-sm leading-5 text-[#d14d4d]">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || categoriesLoading || categories.length === 0}
              className="w-full rounded-md bg-[#b4bedd] py-3 text-sm font-semibold text-[#00010f] transition duration-200 hover:bg-[#c7d0eb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Setting up..." : "Continue"}
            </button>
          </form>

          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:self-stretch lg:pl-8">
            <div className="flex min-h-[350px] w-full items-center justify-center rounded-lg">
              <img
                src={supplier}
                alt="Supplier setup illustration"
                className="h-auto w-full max-w-[280px] object-contain"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SetupSupplier;
