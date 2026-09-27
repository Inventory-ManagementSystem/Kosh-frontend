import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";

import createaccount from "../../assets/auth/createaccount.svg";
import logo from "../../assets/auth/logo.svg";
import AuthDecoration from "../../components/auth/AuthDecoration";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || "business_owner";
  const roleName = role === "employee" ? "Employee/Staff" : "Business Owner";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (/\s/.test(formData.password)) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (/\s/.test(formData.confirmPassword)) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    console.log({
      ...formData,
      role,
    });
    navigate("/setup-business");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#00010f] px-4 py-8 text-[#e6e6e8]">
      <Link to="/" className="fixed top-8 left-8 sm:left-15">
        <img src={logo} alt="KOSH" className="h-4 w-auto sm:h-6" />
      </Link>
      <AuthDecoration />

      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <p className="mt-2 text-2xl">Create account as {roleName}</p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-lg border border-[#2b2c40] bg-[#000112] p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full lg:w-1/2 lg:pr-8"
          >
            <div className="mb-5">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                maxLength={50}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1]${
                  errors.name
                    ? "border-[#d14d4d] focus:border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              />

              {errors.name && (
                <p className="mt-2 text-xs text-[#d14d4d]">{errors.name}</p>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                maxLength={30}
                onChange={handleChange}
                placeholder="Enter your email"
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

            <div className="mb-5">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  maxLength={20}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full rounded-md border bg-[#00010f] px-4 py-3 pr-12 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
                    errors.password
                      ? "border-[#d14d4d] focus:border-[#d14d4d]"
                      : "border-[#2b2c40] focus:border-[#b4bedd]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9697a1] transition hover:text-[#e6e6e8]"
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 text-xs text-[#d14d4d]">{errors.password}</p>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  maxLength={20}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full rounded-md border bg-[#00010f] px-4 py-3 pr-12 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
                    errors.confirmPassword
                      ? "border-[#d14d4d] focus:border-[#d14d4d]"
                      : "border-[#2b2c40] focus:border-[#b4bedd]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9697a1] transition hover:text-[#e6e6e8]"
                >
                  {showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-[#d14d4d]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[#2b2c40] text-[#9697a1] py-3 text-sm font-semibold transition hover:bg-[#b4bedd] hover:text-[#000119]"
            >
              Create Account
            </button>

            <div className="my-5 text-center text-xs text-[#9697a1]">OR</div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 py-3 text-sm font-semibold text-[#e6e6e8] cursor-pointer"
            >
              <FcGoogle />
              Continue with Google
            </button>
          </form>

          <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:self-stretch lg:pl-8">
            <div className="flex flex-1 w-full items-center justify-center">
              <div className="flex h-72 w-full items-center justify-center rounded-lg">
                <img src={createaccount} alt="SignUp illustration" />
              </div>
            </div>
            <p className="mt-6 text-xs text-[#9697a1]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-base text-[#b4bedd] transition hover:text-[#e6e6e8]"
              >
                Login
              </button>
            </p>
          </div>

          <div className="mt-6 text-center text-sm text-[#9697a1] lg:hidden">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-base text-[#b4bedd] transition hover:text-[#e6e6e8]"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Signup;
