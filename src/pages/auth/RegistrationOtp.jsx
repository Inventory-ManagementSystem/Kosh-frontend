import { useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import AuthDecoration from "../../components/auth/AuthDecoration";
import logo from "../../assets/auth/logo.svg";

import { regVerifyOtp } from "../../api/regVerifyOtp";
import BackButton from "../../components/auth/BackButton";
import NavigationButton from "../../components/auth/NavigationButton";

function RegistrationOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const isFormFilled = otp.every((digit) => digit !== "");

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    if (!email) {
      setError("Email not found. Please restart registration.");
      return;
    }

    try {
      const data = await regVerifyOtp({
        email: email,
        otp: enteredOtp,
      });

      console.log("Registration OTP verified:", data);

      navigate("/login", {
        state: {
            fromRegistration: true,
            email,
        },
    });
    } catch (error) {
      if (error.remainingAttempts !== undefined) {
        setError(
          `${error.message} ${error.remainingAttempts} attempts remaining.`
        );
      } else {
        setError(error.message);
      }
    }
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();

    console.log("OTP resent");
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

      <div className="w-full max-w-2xl pt-20 sm:pt-0">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Verify OTP
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm text-[#9697a1]">
            Enter the 6-digit OTP sent to your email address.
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit}>
          <div className="grid w-full grid-cols-6 gap-3 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`h-12 min-w-0 rounded-md border bg-[#00010f] text-center text-lg font-semibold text-[#e6e6e8] outline-none transition sm:h-14 sm:w-12 ${
                  error
                    ? "border-[#d14d4d] focus:border-[#d14d4d]"
                    : "border-[#2b2c40] focus:border-[#b4bedd]"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="mt-4 text-center text-xs text-[#d14d4d]">
              {error}
            </p>
          )}

          <p className="mt-5 text-center text-sm text-[#9697a1]">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-[#b4bedd] transition hover:text-[#e6e6e8]"
            >
              Resend OTP
            </button>
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <BackButton onClick={() => navigate(-1)}>
              Back
            </BackButton>

            <NavigationButton
              type="submit"
              isFormFilled={isFormFilled}
            >
              Verify OTP
            </NavigationButton>
          </div>
        </form>
      </div>
    </main>
  );
}

export default RegistrationOTP;