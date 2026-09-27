import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import forgotpass from "../../assets/auth/forgotpass.svg";
import logo from "../../assets/auth/logo.svg";
import AuthDecoration from "../../components/auth/AuthDecoration";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    console.log({ email });
    navigate("/verify-otp", { state: { email } });
  };
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#00010f] px-4 py-8 text-[#e6e6e8]">
      <Link to="/" className="absolute top-6 left-6 sm:left-8">
        <img src={logo} alt="KOSH" className="h-4 w-auto sm:h-5" />
      </Link>
      <AuthDecoration />
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">KOSH</h1>
          <p className="mt-2 text-2xl">Forgot Password</p>
        </div>
        <div className="mx-auto w-full max-w-md rounded-lg border border-[#2b2c40] bg-[#000112] p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full lg:w-1/2 lg:pr-8"
          >
            <div className="mb-6">
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
                maxLength={50}
                value={email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full rounded-md border bg-[#00010f] px-4 py-3 text-sm text-[#e6e6e8] outline-none transition placeholder:text-[#9697a1] ${
                  error
                    ? "border-[#d14d4d] focus:border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              />
              {error && <p className="mt-2 text-xs text-[#d14d4d]">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-md bg-[#2b2c40] py-3 text-sm font-semibold text-[#9697a1] transition duration-200 hover:bg-[#b4bedd] hover:text-[#000119]"
            >
              Send OTP
            </button>
          </form>

          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:pl-8">
            <div className="flex h-72 w-full items-center justify-center rounded-lg">
              <img src={forgotpass} alt="Forgot Password illustration" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
