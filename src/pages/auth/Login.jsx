import { useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";

import loginsvg from "../../assets/auth/loginsvg.svg";
import logo from "../../assets/auth/logo.svg";
import AuthDecoration from "../../components/auth/AuthDecoration";
import AuthButton from "../../components/auth/AuthButton";
import GoogleButton from "../../components/auth/GoogleButton";

import { loginUser } from "../../api/loginApi";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
    general:"",
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
      identifier: "",
      password: "",
    };
    if (!formData.identifier.trim()) {
      newErrors.identifier = "Invalid credentials";
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,30}$/;
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be 8-30 characters with uppercase, lowercase, number and special character";
    }
    setErrors(newErrors);
    return !newErrors.identifier && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const data = await loginUser({
        identifier: formData.identifier,
        password: formData.password,
      });
      login(data.access, data.refresh);
        if (location.state?.fromRegistration) {
    navigate("/setup-business", {
      state: {
        email: location.state.email,
      },
    });
  } else {
  navigate("/dashboard");
}
    } catch (error) {
      console.log("Login Failed", error.message);
       setErrors({
        identifier: "",
        password: "",
        general: error.message,
  });
    }
  };

  const isFormFilled =
    Boolean(formData.identifier.trim()) && Boolean(formData.password);
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
          <p className="font-['Google_Sans_Flex'] mt-2 text-2xl font-bold">
            Welcome to <span className="text-[#b4bedd]">KOSH</span>
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
                htmlFor="identifier"
                className="mb-2 block text-sm font-medium text-[#e6e6e8]"
              >
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                name="identifier"
                maxLength={50}
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
                  errors.identifier
                    ? "border-[#d14d4d] focus:border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              />
              {errors.identifier && (
                <p className="mt-2 text-xs text-[#d14d4d]">
                  {errors.identifier}
                </p>
              )}
            </div>

            <div className="mb-4">
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
            {errors.general && (
                <p className="mb-4 text-center text-xs text-[#d14d4d]">
                  {errors.general}
                </p>
              )}
            <div className="mb-6 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-[#b4bedd] transition hover:text-[#e6e6e8] underline underline-offset-4"
              >
                Forgot Password?
              </button>
            </div>

            <AuthButton isFormFilled={isFormFilled}>Login</AuthButton>
            <div className="my-5 text-center text-xs text-[#9697a1]">OR</div>

            <GoogleButton onClick={() => console.log("Google Login")} />

            <p className="mt-6 text-center text-sm text-[#9697a1]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/role")}
                className="text-base text-[#b4bedd] underline underline-offset-4 transition hover:text-[#e6e6e8]"
              >
                Sign Up
              </button>
            </p>
          </form>

          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:pl-8">
            <div className="flex h-72 w-full items-center justify-center rounded-lg">
              <img src={loginsvg} alt="Login illustration" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
