import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import AuthDecoration from "../../components/auth/AuthDecoration";
import setupbusiness from "../../assets/auth/setupbusiness.svg";
import logo from "../../assets/auth/logo.svg";

import { regBusiness } from "../../api/businessApi";

function SetupBusiness() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    city: "",
  });
  const [errors, setErrors] = useState({
    businessName: "",
    businessType: "",
    city: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {
      businessName: "",
      businessType: "",
      city: "",
    };
    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!formData.businessType) {
      newErrors.businessType = "Please select a business type";
    }
    if (!formData.city) {
      newErrors.city = "Please select a city";
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };
  const location = useLocation();
  const email = location.state?.email;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const data = await regBusiness(
        {
          business_name: formData.businessName,
          business_type: formData.businessType,
          city: formData.city,
        },
        accessToken,
      );
      navigate("/complete-setup");
    } catch (error) {
      console.error("Business registration failed:", error);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#00010f] px-4 py-8 text-[#e6e6e8]">
      <div className="fixed left-0 top-0 z-50 h-16 w-full bg-[#00010f] sm:hidden">
        <Link to="/" className="absolute left-1/2 top-6 -translate-x-1/2">
          <img src={logo} alt="KOSH" className="h-6 w-auto" />
        </Link>
      </div>
      <Link to="/" className="fixed left-8 top-8 hidden sm:block">
        <img src={logo} alt="KOSH" className="h-7 w-auto" />
      </Link>
      <AuthDecoration />

      <div className="w-full max-w-4xl pt-20 sm:pt-0">
        <div className="mb-8 ml-10 text-left">
          <p className="mt-2 text-3xl">Let's Setup Your Business</p>
          <p className="mt-2 text-l text-[#b4bedd]">
            Tell us about your business to get started
          </p>
        </div>
        <div className="mx-auto w-full max-w-md p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full lg:w-1/2 lg:pr-8"
          >
            <div className="mb-5">
              <label
                htmlFor="businessName"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                name="businessName"
                maxLength={100}
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter your business name"
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
                  errors.businessName
                    ? "border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              />
              {errors.businessName && (
                <p className="mt-2 text-xs text-[#d14d4d]">
                  {errors.businessName}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label
                htmlFor="businessType"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                Business Type
              </label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm outline-none transition ${
                  formData.businessType ? "text-[#e6e6e8]" : "text-[#9697a1]"
                } ${
                  errors.businessType
                    ? "border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              >
                <option value="">Select business type</option>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="restaurant">Restaurant</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
              {errors.businessType && (
                <p className="mt-2 text-xs text-[#d14d4d]">
                  {errors.businessType}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="city"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                City
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm outline-none transition ${
                  formData.city ? "text-[#e6e6e8]" : "text-[#9697a1]"
                } ${
                  errors.city
                    ? "border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              >
                <option value="">Select city</option>
                <option value="delhi">Delhi</option>
                <option value="gurugram">Gurugram</option>
                <option value="noida">Noida</option>
                <option value="ghaziabad">Ghaziabad</option>
                <option value="mumbai">Mumbai</option>
                <option value="bangalore">Bangalore</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="pune">Pune</option>
                <option value="chennai">Chennai</option>
                <option value="kolkata">Kolkata</option>
                <option value="other">Other</option>
              </select>
              {errors.city && (
                <p className="mt-2 text-xs text-[#d14d4d]">{errors.city}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-[#2b2c40] py-3 text-sm font-semibold text-[#9697a1] transition duration-200 hover:bg-[#b4bedd] hover:text-[#000119]"
            >
              Next
            </button>
          </form>
          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:self-stretch lg:pl-8">
            <div className="flex h-72 w-full items-center justify-center rounded-lg">
              <img src={setupbusiness} alt="setup illustration" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SetupBusiness;
