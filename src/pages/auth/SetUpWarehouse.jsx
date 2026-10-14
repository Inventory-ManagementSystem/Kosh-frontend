import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { updateWarehouse } from "../../features/owner/api/warehouseApi";

import forgotpass from "../../assets/auth/forgotpass.svg";
import logo from "../../assets/auth/logo.svg";
import AuthDecoration from "../../components/auth/AuthDecoration";

import NavigationButton from "../../components/auth/NavigationButton";
import BackButton from "../../components/auth/BackButton";

function SetUpWarehouse() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [warehouseName, setWarehouseName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!warehouseName.trim()) {
      newErrors.warehouseName = "Warehouse name is required";
    }
    if (!address.trim()) {
      newErrors.address = "Address is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!accessToken) {
      toast.error("Please log in again to continue.");
      return;
    }

    try {
      await updateWarehouse(accessToken, {
        name: warehouseName.trim(),
        address: address.trim(),
      });
      toast.success("Warehouse details updated successfully");
      navigate("/complete-setup");
    } catch (error) {
      toast.error(error.message || "Failed to set up warehouse");
    }
  };

  const isFormFilled = Boolean(warehouseName.trim() && address.trim());

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#00010f] px-4 py-8 text-[#e6e6e8]">
      <Link to="/" className="fixed top-8 left-8 sm:left-15">
        <img src={logo} alt="KOSH" className="h-6 w-auto sm:h-7" />
      </Link>
      <AuthDecoration />
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <p className="mt-2 text-2xl">Set Up Warehouse</p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-lg border border-(--border-color) bg-(--card-background) p-6 sm:p-8 lg:flex lg:max-w-4xl lg:items-center lg:p-10">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full lg:w-1/2 lg:pr-8"
          >
            <div className="mb-6">
              <label
                htmlFor="warehouseName"
                className="mb-2 block text-sm font-medium text-(--text-color)"
              >
                Warehouse Name
              </label>
              <input
                id="warehouseName"
                type="text"
                name="warehouseName"
                maxLength={50}
                value={warehouseName}
                onChange={(e) => {
                  setWarehouseName(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    warehouseName: "",
                  }));
                }}
                placeholder="Enter your warehouse name"
                className={`w-full rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none transition placeholder:text-(--secondary-text-color) ${
                  errors.warehouseName
                    ? "border-(--error-color) focus:border-(--error-color)"
                    : "border-(--border-color) focus:border-(--accent-color)"
                }`}
              />
              {errors.warehouseName && (
                <p className="mt-2 text-xs text-(--error-color)">
                  {errors.warehouseName}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-(--text-color)"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                maxLength={250}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    address: "",
                  }));
                }}
                placeholder="Enter your warehouse address"
                className={`w-full resize-none rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none transition placeholder:text-(--secondary-text-color) ${
                  errors.address
                    ? "border-(--error-color) focus:border-(--error-color)"
                    : "border-(--border-color) focus:border-(--accent-color)"
                }`}
              />
              {errors.address && (
                <p className="mt-2 text-xs text-(--error-color)">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <BackButton onClick={() => navigate(-1)}>Back</BackButton>

              <NavigationButton type="submit" isFormFilled={isFormFilled}>
                Next
              </NavigationButton>
            </div>
          </form>

          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:pl-8">
            <div className="flex h-72 w-full items-center justify-center rounded-lg">
              <img src={forgotpass} alt="Warehouse setup illustration" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SetUpWarehouse;
