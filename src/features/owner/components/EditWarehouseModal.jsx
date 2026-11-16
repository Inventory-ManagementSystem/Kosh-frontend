import { useState } from "react";
import toast from "react-hot-toast";
import { editWarehouse } from "../api/warehouseApi";

const removeEmojis = (value) =>
  value.replace(
    /[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\u20E3]/gu,
    "",
  );

function EditWarehouseModal({ warehouse, accessToken, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: warehouse?.name || "",
    address: warehouse?.address || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: removeEmojis(value) }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Warehouse name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!accessToken) {
      toast.error("Please log in again to continue.");
      return;
    }

    const updatedData = {};
    if (form.name.trim() !== warehouse?.name) {
      updatedData.name = form.name.trim();
    }
    if (form.address.trim() !== warehouse?.address) {
      updatedData.address = form.address.trim();
    }
    if (Object.keys(updatedData).length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const response = await editWarehouse(accessToken, updatedData);
      toast.success("Warehouse details updated successfully.");
      onSaved(response.data);
    } catch (error) {
      toast.error(error.message || "Failed to update warehouse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-(--page-background)/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-(--border-color) bg-(--sidebar-active-background) p-6">
        <h2 className="mb-5 text-lg font-semibold text-(--text-color)">
          Edit Warehouse
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="warehouseName"
              className="mb-2 block text-sm font-medium text-(--text-color)"
            >
              Warehouse Name
            </label>
            <input
              id="warehouseName"
              name="name"
              type="text"
              maxLength={50}
              value={form.name}
              onChange={handleChange}
              placeholder="Enter warehouse name"
              className={`w-full rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color) ${
                errors.name
                  ? "border-(--error-color)"
                  : "border-(--border-color) focus:border-(--accent-color)"
              }`}
            />
            {errors.name && (
              <p className="mt-2 text-xs text-(--error-color)">{errors.name}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="warehouseAddress"
              className="mb-2 block text-sm font-medium text-(--text-color)"
            >
              Address
            </label>
            <textarea
              id="warehouseAddress"
              name="address"
              rows={3}
              maxLength={250}
              value={form.address}
              onChange={handleChange}
              placeholder="Enter warehouse address"
              className={`w-full resize-none rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color) ${
                errors.address
                  ? "border-(--error-color)"
                  : "border-(--border-color) focus:border-(--accent-color)"
              }`}
            />
            {errors.address && (
              <p className="mt-2 text-xs text-(--error-color)">
                {errors.address}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-md border border-(--border-color) px-4 py-2 text-sm text-(--text-color) transition hover:bg-(--input-background) disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-(--accent-color) px-4 py-2 text-sm font-semibold text-(--page-background) transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditWarehouseModal;
