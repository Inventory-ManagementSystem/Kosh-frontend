import { Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/auth/RoleSelection";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OTPVerification from "./pages/auth/OTPVerification";
import ResetPassword from "./pages/auth/ResetPassword";
import SetupBusiness from "./pages/auth/SetUpBusiness";
import SetupWarehouse from "./pages/auth/SetUpWarehouse";
import SetupComplete from "./pages/auth/SetUpComplete";
import RegistrationOtp from "./pages/auth/RegistrationOtp";
import OAuthCallback from "./pages/auth/OAuthCallback";
import GitHubOAuthCallback from "./pages/auth/GitHubOAuthCallback";
import HomePage from "./pages/auth/HomePage";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import OwnerLayout from "./layouts/OwnerLayout";
import Dashboard from "./features/owner/pages/Dashboard";
import AddEmployee from "./features/owner/pages/AddEmployee";
import ManageEmployee from "./features/owner/pages/ManageEmployee";
import ManageSuppliers from "./features/owner/pages/ManageSupplier";
import AddSupplier from "./features/owner/pages/AddSupplier";
import Warehouse from "./features/owner/pages/Warehouse";
import RFQAlerts from "./features/owner/pages/RFQAlerts";
import AddProduct from "./features/owner/pages/AddProduct";
import DispatchStock from "./features/owner/pages/DispatchStock";
import KoshAI from "./features/owner/pages/KoshAI";
import ManageQuotation from "./features/owner/pages/ManageQuotation";
import QuotationDetails from "./features/owner/pages/QuotationDetails";
import AllOrders from "./features/owner/pages/AllOrders";
import OrderDetails from "./features/owner/pages/OrderDetails";
import AllInvoices from "./features/owner/pages/AllInvoices";
import InvoiceDetail from "./features/owner/pages/InvoiceDetail";

import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeeInvites from "./features/employee/pages/EmployeeInvites";
import EmployeeDashboard from "./features/employee/pages/EmployeeDashboard";
import EmployeeWarehouse from "./features/employee/pages/EmployeeWarehouse";
import EmployeeOrders from "./features/employee/pages/EmployeeOrders";
import EmployeeDispatch from "./features/employee/pages/EmployeeDispatch";
import EmployeeKoshAI from "./features/employee/pages/EmployeeKoshAI";

import SupplierLayout from "./layouts/SupplierLayout";
import SetupSupplier from "./pages/auth/SetUpSupplier";
import SupplierDashboard from "./features/supplier/pages/SupplierDashboard";
import SupplierRFQs from "./features/supplier/pages/SupplierRfq";
import SupplierKoshAI from "./features/supplier/pages/SupplierKoshAI";
import PayoutDetails from "./features/supplier/pages/PayoutDetails";
import SupplierQuotation from "./features/supplier/pages/SupplierQuotation";

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
          <Route path="/setup-warehouse" element={<SetupWarehouse />} />
          <Route path="/complete-setup" element={<SetupComplete />} />
          <Route path="/setup-supplier" element={<SetupSupplier />} />

          <Route element={<OwnerLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<ManageEmployee />} />
            <Route path="/add-employee" element={<AddEmployee />} />
            <Route path="/suppliers" element={<ManageSuppliers />} />
            <Route path="/add-supplier" element={<AddSupplier />} />
            <Route path="/warehouse" element={<Warehouse />} />
            <Route path="/add-products" element={<AddProduct />} />
            <Route path="/rfq-alerts" element={<RFQAlerts />} />
            <Route path="/dispatch-stock" element={<DispatchStock />} />
            <Route path="/kosh-ai" element={<KoshAI />} />
            <Route
              path="/manage-quotation/:rfqId"
              element={<ManageQuotation />}
            />
            <Route
              path="/manage-quotation/:rfqId/quotation/:quotationId"
              element={<QuotationDetails />}
            />
            <Route path="/owner/orders" element={<AllOrders />} />
            <Route path="/owner/orders/:orderId" element={<OrderDetails />} />
            <Route path="/owner/invoices" element={<AllInvoices />} />
            <Route
              path="/owner/invoices/:invoiceId"
              element={<InvoiceDetail />}
            />
          </Route>

          <Route path="/employee-invites" element={<EmployeeInvites />} />
          <Route element={<EmployeeLayout />}>
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee-warehouse" element={<EmployeeWarehouse />} />
            <Route path="/employee/orders" element={<EmployeeOrders />} />
            <Route
              path="/employee/dispatch-stock"
              element={<EmployeeDispatch />}
            />
            <Route path="/employee/kosh-ai" element={<EmployeeKoshAI />} />
          </Route>

          <Route element={<SupplierLayout />}>
            <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier-rfqs" element={<SupplierRFQs />} />
            <Route path="/supplier/kosh-ai" element={<SupplierKoshAI />} />
            <Route path="/account-details" element={<PayoutDetails />} />
            <Route path="supplier/create-quotation/:id" element={<SupplierQuotation />} />
          </Route>
        </Route>

        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/github/callback" element={<GitHubOAuthCallback />} />
      </Routes>
    </>
  );
}

export default App;
