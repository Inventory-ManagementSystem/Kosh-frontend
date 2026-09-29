import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";

import createaccount from "../../assets/auth/createaccount.svg";
import logo from "../../assets/auth/logo.svg";
import AuthDecoration from "../../components/auth/AuthDecoration";
import AuthButton from "../../components/auth/AuthButton";
import GoogleButton from "../../components/auth/GoogleButton";

import { regUser } from "../../api/regApi";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || "business_owner";
  const roleName = role === "employee" ? "Employee/Staff" : "Business Owner";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [apiError, setApiError] = useState("");

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

    setApiError("");
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username =
        "Username must be 3-50 characters and contain only letters, numbers and underscores";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,30}$/;
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be 8-30 characters with uppercase, lowercase, number and special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  const isFormFilled =
    Boolean(formData.username.trim()) &&
    Boolean(formData.email.trim()) &&
    Boolean(formData.password) &&
    Boolean(formData.confirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setApiError("");
    try {
      const data = await regUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      console.log(data);
      navigate("/setup-business");
    } catch (error) {
      console.error("Registration failed:", error.message);
      setApiError(error.message);
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
        <img src={logo} alt="KOSH" className="h-5 w-auto" />
      </Link>
      <AuthDecoration />

      <div className="w-full max-w-4xl pt-20 sm:pt-0">
        <div className="mb-8 text-center">
          <p className="font-['Google_Sans_Flex'] mt-2 text-xl sm:text-2xl font-semibold">
            Create account as{" "}
            <span className="text-[#b4bedd] font-bold">{roleName}</span>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md rounded-lg border border-[#2b2c40] bg-[#000112] p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 z-10 cursor-pointer text-[#b4bedd]"
          >
            <IoMdArrowRoundBack size={20} />
          </button>
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full lg:w-1/2 lg:pr-8"
          >
            <div className="mb-5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-[#e6e6e8]"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                maxLength={50}
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1]${
                  errors.username
                    ? "border-[#d14d4d] focus:border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              />

              {errors.username && (
                <p className="mt-2 text-xs text-[#d14d4d]">{errors.username}</p>
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
                  maxLength={30}
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
                  {showPassword ? <BsEye /> : <BsEyeSlash />}
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
                  maxLength={30}
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
                  {showConfirmPassword ? <BsEye /> : <BsEyeSlash />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-[#d14d4d]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {apiError && (
              <p className="mb-4 text-center text-xs text-[#d14d4d]">
                {apiError}
              </p>
            )}
            <AuthButton isFormFilled={isFormFilled}>Create Account</AuthButton>

            <div className="my-5 text-center text-xs text-[#9697a1]">OR</div>

            <GoogleButton onClick={() => console.log("Google Login")} />
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
              className="text-base text-[#b4bedd] underline underline-offset-4 transition hover:text-[#e6e6e8]"
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
