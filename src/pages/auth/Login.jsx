import { useState, useEffect , useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { IoMdArrowRoundBack } from "react-icons/io";

import loginsvg from "../../assets/auth/loginsvg.svg";
import logo from "../../assets/auth/logo.svg";
import AuthDecoration from "../../components/auth/AuthDecoration";
import AuthButton from "../../components/auth/AuthButton";
import { googleLogin } from "../../api/googleApi";
import { githubLogin } from "../../api/githubApi";

import GoogleButton from "../../components/auth/GoogleButton";
import GithubButton from "../../components/auth/GithubButton";

import { loginUser } from "../../api/loginApi";
import { debounce } from "../../utils/debounce";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("loginFormData");
    if (savedData) {
      const data = JSON.parse(savedData);
      return {
        email: data.email || "",
        password: "",
      };
    }
    return {
      email: "",
      password: "",
    };
  });
  useEffect(() => {
    localStorage.setItem(
      "loginFormData",
      JSON.stringify({
        email: formData.email,
      }),
    );
  }, [formData.email]);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      const newErrors = {
        ...prev,
        general: "",
      };

      if (name === "email") {
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (/[^\x00-\x7F]/.test(value)) {
          newErrors.email = "Emojis are not allowed";
        } else if (value.length > 50) {
          newErrors.email = "Maximum limit reached.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          newErrors.email = "Enter a valid email address";
        } else {
          newErrors.email = "";
        }
      }

      if (name === "password") {
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 3) {
          newErrors.password = "The password you entered is incorrect";
        } else if (value.length > 30) {
          newErrors.password = "Maximum limit reached";
        } else {
          newErrors.password = "";
        }
      }

      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 3) {
      newErrors.password = "The password you entered is incorrect";
    } else if (formData.password.length > 30) {
      newErrors.password = "Maximum limit reached";
    }

    setErrors(newErrors);

    return !newErrors.email && !newErrors.password;
  };

  const debouncedLogin=useMemo(()=>
  debounce(async(data)=>{
    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });

      login(response.data.access, response.data.role);
      localStorage.removeItem("loginFormData");

      const role = response.data.role;
      const selectedRole = localStorage.getItem("selectedRole");
      if (selectedRole === "supplier") {
        if (response.data.role === null) {
          navigate("/setup-supplier");
        } else {
          navigate("/supplier-dashboard");
        }
      } else if (selectedRole === "business_owner") {
        if (response.data.has_business === true) {
          navigate("/dashboard");
        } else {
          navigate("/setup-business");
        }
      } else if (selectedRole === "employee") {
        navigate("/employee-invites");
      } else if (role === "owner") {
        if (response.data.has_business === true) {
          navigate("/dashboard");
        } else {
          navigate("/setup-business");
        }
      } else if (role === "employee") {
        navigate("/employee-dashboard");
      }
      localStorage.removeItem("selectedRole");
    } catch (error) {
      console.log("Login Failed", error.message);
      if (error.status === 429) {
    setErrors({
      email: "",
      password: "",
      general: "Too many login attempts. Please try again later.",
    });
  } else {
    setErrors({
      email: "",
      password: "",
      general: error.message,
    });
  }
    }
  },500),
[login,navigate]
);

  const handleSubmit =(e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    debouncedLogin(formData);
  };

  const isFormFilled =
    Boolean(formData.email.trim()) && Boolean(formData.password);
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-(--page-background) text-(--text-color)">
      <div className="fixed left-0 top-0 z-50 h-16 w-full bg-(--page-background) min-[700px]:hidden">
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
            Welcome to <span className="text-(--accent-color)">KOSH</span>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl rounded-lg border border-(--border-color) bg-(--card-background) p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-3 top-3 z-10 cursor-pointer text-(--icon-accent-color)"
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
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-(--text-color)"
              >
                Email
              </label>
              <input
                id="email"
                type="text"
                name="email"
                maxLength={50}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none transition placeholder:text-(--secondary-text-color) ${
                  errors.email
                    ? "border-(--error-color) focus:border-(--error-color)"
                    : "border-(--border-color) focus:border-(--accent-color)"
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-xs text-(--error-color)">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-(--text-color)"
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
                  className={`w-full rounded-md border bg-(--input-background) px-4 py-3 pr-12 text-sm text-(--text-color) outline-none transition placeholder:text-(--secondary-text-color) ${
                    errors.password
                      ? "border-(--error-color) focus:border-(--error-color)"
                      : "border-(--border-color) focus:border-(--accent-color)"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-(--icon-color) transition hover:text-(--icon-accent-color)"
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-(--error-color)">
                  {errors.password}
                </p>
              )}
            </div>
            {errors.general && (
              <p className="mb-4 text-center text-xs text-(--error-color)">
                {errors.general}
              </p>
            )}
            <div className="mb-6 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-(--accent-color) transition hover:text-(--text-color) underline underline-offset-4"
              >
                Forgot Password?
              </button>
            </div>

            <AuthButton isFormFilled={isFormFilled}>Login</AuthButton>
            <div className="my-5 text-center text-xs text-(--secondary-text-color)">
              OR
            </div>

            <div className="flex gap-5">
              <GoogleButton onClick={googleLogin} className="w-1/2" />
              <GithubButton onClick={githubLogin} className="w-1/2" />
            </div>
          </form>

          <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:self-stretch lg:pl-8">
            <div className="flex flex-1 w-full items-center justify-center">
              <div className="flex h-72 w-full items-center justify-center rounded-lg">
                <img src={loginsvg} alt="LogIn illustration" />
              </div>
            </div>
            <p className="mt-6 text-sm text-(--secondary-text-color)">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/role")}
                className=" text-(--accent-color) underline underline-offset-4 transition hover:text-(--text-color)"
              >
                SignUp
              </button>
            </p>
          </div>

          <div className="mt-6 text-center text-sm text-[#9697a1] lg:hidden">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/role")}
              className="text-[#b4bedd] underline underline-offset-4 transition hover:text-[#e6e6e8]"
            >
              SignUp
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
