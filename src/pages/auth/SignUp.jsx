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
import GithubButton from "../../components/auth/GithubButton";

import { regUser } from "../../api/regApi";
import { googleLogin } from "../../api/googleApi";
import { githubLogin } from "../../api/githubApi";

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
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "name") {
      if (!value.trim()) {
        setErrors({
          ...errors,
          name: "Name is required",
        });
      } else if (value.length < 3) {
        setErrors({
          ...errors,
          name: "Name must be at least 3 characters",
        });
      } else if (value.length >= 50) {
        setErrors({
          ...errors,
          name: "Name must not exceed 50 characters",
        });
      } else if (!/^[A-Za-z ]+$/.test(value)) {
        setErrors({
          ...errors,
          name: "Name can contain only letters and spaces",
        });
      } else {
        setErrors({
          ...errors,
          name: "",
        });
      }
    } else if (name === "email") {
      if (!value.trim()) {
        setErrors({
          ...errors,
          email: "Email is required",
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors({
          ...errors,
          email: "Enter a valid email address",
        });
      } else {
        setErrors({
          ...errors,
          email: "",
        });
      }
    } else if (name === "password") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,30}$/;

      if (!value) {
        setErrors({
          ...errors,
          password: "Password is required",
        });
      } else if (value.length < 8) {
        setErrors({
          ...errors,
          password: "Password must be at least 8 characters",
        });
      } else if (!/[a-z]/.test(value)) {
        setErrors({
          ...errors,
          password: "Password must contain a lowercase letter",
        });
      } else if (!/[A-Z]/.test(value)) {
        setErrors({
          ...errors,
          password: "Password must contain an uppercase letter",
        });
      } else if (!/\d/.test(value)) {
        setErrors({
          ...errors,
          password: "Password must contain a number",
        });
      } else if (!/[@$!%*?&#]/.test(value)) {
        setErrors({
          ...errors,
          password: "Password must contain a special character",
        });
      } else if (!passwordRegex.test(value)) {
        setErrors({
          ...errors,
          password: "Password contains an invalid character",
        });
      } else {
        setErrors({
          ...errors,
          password: "",
        });
      }
    } else if (name === "confirmPassword") {
      if (!value) {
        setErrors({
          ...errors,
          confirmPassword: "Please confirm your password",
        });
      } else if (value !== formData.password) {
        setErrors({
          ...errors,
          confirmPassword: "Passwords do not match",
        });
      } else {
        setErrors({
          ...errors,
          confirmPassword: "",
        });
      }
    } else {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    setApiError("");
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    const nameRegex = /^[A-Za-z ]+$/;
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Maximum Limit reached";
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = "Name can contain only letters and spaces";
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
    Boolean(formData.name.trim()) &&
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
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      sessionStorage.setItem("registrationName", formData.name);
      sessionStorage.setItem("registrationEmail", formData.email);
      navigate("/registration-otp");
    } catch (error) {
      console.error("Registration failed:", error.message);
      setApiError(error.message);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#00010f] text-[#e6e6e8]">
      <div className="fixed left-0 top-0 z-50 h-16 w-full bg-[#00010f] min-[700px]:hidden">
        <Link to="/" className="absolute left-8 top-7">
          <img src={logo} alt="KOSH" className="h-6 w-auto" />
        </Link>
      </div>
      <Link to="/" className="absolute left-10 top-8">
        <img src={logo} alt="KOSH" className="h-7 w-auto" />
      </Link>
      <AuthDecoration />

      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 min-[700px]:px-6 min-[700px]:pt-8">
        <div className="mb-4 text-center min-[700px]:mb-5">
          <p className="font-['Google_Sans_Flex'] text-xl font-semibold min-[700px]:text-2xl">
            Create account as{" "}
            <span className="font-bold text-[#b4bedd]">{roleName}</span>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl rounded-lg border border-[#2b2c40] bg-[#000112] p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-3 top-3 z-10 cursor-pointer text-[#b4bedd]"
          >
            <IoMdArrowRoundBack size={20} />
          </button>
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full pl-6 lg:w-1/2 lg:pl-6"
          >
            <div className="mb-5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[#e6e6e8]"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                maxLength={50}
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className={`mt-2 w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm text-[#e6e6e8] caret-[#b4bedd] outline-none transition placeholder:text-[#9697a1]${
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
                placeholder="Enter Email"
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 caret-[#b4bedd] text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
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
                  placeholder="Create a strong password"
                  className={`w-full rounded-md border bg-[#00010f] px-4 caret-[#b4bedd] py-3 pr-12 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
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
                  placeholder="Confirm password"
                  className={`w-full rounded-md border bg-[#00010f] caret-[#b4bedd] px-4 py-3 pr-12 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
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

            <div className="flex gap-5">
              <GoogleButton onClick={googleLogin} className="w-1/2" />
              <GithubButton onClick={githubLogin} className="w-1/2" />
            </div>
          </form>

          <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:self-stretch lg:pl-8">
            <div className="flex flex-1 w-full items-center justify-center">
              <div className="flex h-72 w-full items-center justify-center rounded-lg">
                <img src={createaccount} alt="SignUp illustration" />
              </div>
            </div>
            <p className="mt-6 text-sm text-[#9697a1]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className=" text-[#b4bedd] underline underline-offset-4 transition hover:text-[#e6e6e8]"
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
              className="text-[#b4bedd] underline underline-offset-4 transition hover:text-[#e6e6e8]"
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
