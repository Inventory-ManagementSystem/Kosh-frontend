import { Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/auth/RoleSelection";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OTPVerification from "./pages/auth/OTPVerification";
import ResetPassword from "./pages/auth/ResetPassword";
import SetupBusiness from "./pages/auth/SetUpBusiness";
import SetupComplete from "./pages/auth/SetUpComplete";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RegistrationOtp from "./pages/auth/RegistrationOtp";
// import OAuthCallback from "./pages/auth/OAuthCallback";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/role" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/setup-business"
          element={
            <ProtectedRoute>
              <SetupBusiness />
            </ProtectedRoute>
          }
        />
        <Route path="/registration-otp" element={<RegistrationOtp />} />
        <Route
          path="/complete-setup"
          element={
            <ProtectedRoute>
              <SetupComplete />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/oauth/callback" element={<OAuthCallback />} /> */}
      </Routes>
    </>
  );
}

export default App;
