import { Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/auth/RoleSelection";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OTPVerification from "./pages/auth/OTPVerification";
import ResetPassword from "./pages/auth/ResetPassword";
import SetupBusiness from "./pages/auth/SetUpBusiness";
import SetupComplete from "./pages/auth/SetUpComplete";
import RegistrationOtp from "./pages/auth/RegistrationOtp";
import OAuthCallback from "./pages/auth/OAuthCallback";
import GitHubOAuthCallback from "./pages/auth/GitHubOAuthCallback";
import HomePage from "./pages/auth/HomePage";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./features/owner/pages/Dashboard";
import AddEmployee from "./features/owner/pages/AddEmployee";

import EmployeeInvites from "./features/employee/pages/EmployeeInvites";
import EmployeeDashboard from "./features/employee/pages/EmployeeDashboard";

import OwnerLayout from "./layouts/OwnerLayout";
import ManageEmployee from "./features/owner/pages/ManageEmployee";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/role" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/registration-otp" element={<RegistrationOtp />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/setup-business" element={<SetupBusiness />} />
          <Route path="/complete-setup" element={<SetupComplete />} />

          <Route element={<OwnerLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<ManageEmployee />} />
            <Route path="/add-employee" element={<AddEmployee />} />
          </Route>

          <Route path="/employee-invites" element={<EmployeeInvites />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        </Route>

        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/github/callback" element={<GitHubOAuthCallback />} />
      </Routes>
    </>
  );
}

export default App;
