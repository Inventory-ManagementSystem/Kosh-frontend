import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link } from "react-router-dom";

import AuthDecoration from "../../components/auth/AuthDecoration";
import loginsvg from "../../assets/auth/loginsvg.svg";
import logo from "../../assets/auth/logo.svg";

import { resetPwd } from "../../api/resetPwd";

function ResetPassword() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
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
      password: "",
      confirmPassword: "",
    };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    const resetToken = sessionStorage.getItem("resetToken");
    if (!resetToken) {
      console.log("Reset token not found");
      return;
    }
    try {
      const data = await resetPwd(
        resetToken,
        formData.password,
        formData.confirmPassword,
      );
      console.log("Password reset successful:", data);
      sessionStorage.removeItem("resetToken");
      navigate("/login");
    } catch (error) {
      console.log("Password reset failed:", error.message);
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Reset Password
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm text-[#9697a1]">
            Create a new password for your account.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-lg border border-[#2b2c40] bg-[#000112] p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full lg:w-1/2 lg:pr-8"
          >
            <div className="mb-5">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  maxLength={50}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className={`w-full rounded-md border bg-[#00010f] px-4 py-3 pr-11 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
                    errors.password
                      ? "border-[#d14d4d] focus:border-[#d14d4d]"
                      : "border-[#2b2c40] focus:border-[#b4bedd]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#9697a1] transition hover:text-[#e6e6e8]"
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 text-xs text-[#d14d4d]">{errors.password}</p>
              )}
            </div>

            <div className="mb-6">
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
                  maxLength={50}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className={`w-full rounded-md border bg-[#00010f] px-4 py-3 pr-11 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
                    errors.confirmPassword
                      ? "border-[#d14d4d] focus:border-[#d14d4d]"
                      : "border-[#2b2c40] focus:border-[#b4bedd]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#9697a1] transition hover:text-[#e6e6e8]"
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
              className="w-full rounded-md bg-[#2b2c40] py-3 text-sm font-semibold text-[#9697a1] transition duration-200 hover:bg-[#b4bedd] hover:text-[#000119]"
            >
              Reset Password
            </button>
          </form>

          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:self-stretch lg:pl-8">
            <div className="flex h-72 w-full items-center justify-center rounded-lg">
              <img src={loginsvg} alt="Reset Password illustration" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;
