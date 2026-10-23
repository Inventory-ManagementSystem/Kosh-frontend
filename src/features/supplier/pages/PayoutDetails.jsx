import { useCallback, useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";
import { BsFillCreditCard2BackFill } from "react-icons/bs";
import { BiSolidBank } from "react-icons/bi";
import { toast } from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getPayoutDetails, savePayoutDetails } from "../api/supplierPayoutApi";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const VPA_REGEX = /^[A-Za-z0-9.-]+@[A-Za-z0-9.-]+$/;
const ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;

const emptyForm = {
  account_holder_name: "",
  ifsc: "",
  account_number: "",
  account_number_confirm: "",
  vpa: "",
};

function PayoutDetails() {
  const { accessToken } = useAuth();

  const [savedDetails, setSavedDetails] = useState(null);
  const [method, setMethod] = useState("bank_account");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const loadPayoutDetails = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setPageError("");
      const details = await getPayoutDetails(accessToken);
      setSavedDetails(details);
      if (details) {
        setMethod(details.method);
        setFormData({
          ...emptyForm,
          account_holder_name: details.account_holder_name || "",
          ifsc: details.ifsc || "",
          vpa: details.vpa || "",
        });
      } else {
        setMethod("bank_account");
        setFormData(emptyForm);
      }
    } catch (error) {
      setPageError(error.message || "Unable to load payout details.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadPayoutDetails();
  }, [loadPayoutDetails]);

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    setFormData(emptyForm);
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: name === "ifsc" ? value.toUpperCase() : value,
    }));
  };

  const validateForm = () => {
    if (method === "vpa") {
      if (!VPA_REGEX.test(formData.vpa.trim())) {
        toast.error("Enter a valid UPI ID.");
        return false;
      }
      return true;
    }
    if (!formData.account_holder_name.trim()) {
      toast.error("Enter the account holder name.");
      return false;
    }
    if (!IFSC_REGEX.test(formData.ifsc.trim().toUpperCase())) {
      toast.error("Enter a valid 11-character IFSC code.");
      return false;
    }
    if (!ACCOUNT_NUMBER_REGEX.test(formData.account_number)) {
      toast.error("Account number must contain 9–18 digits.");
      return false;
    }
    if (!ACCOUNT_NUMBER_REGEX.test(formData.account_number_confirm)) {
      toast.error("Enter a valid confirmation account number.");
      return false;
    }
    if (formData.account_number !== formData.account_number_confirm) {
      toast.error("Account numbers do not match.");
      return false;
    }
    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const payload =
      method === "vpa"
        ? {
            method: "vpa",
            vpa: formData.vpa.trim(),
          }
        : {
            method: "bank_account",
            account_holder_name: formData.account_holder_name.trim(),
            ifsc: formData.ifsc.trim().toUpperCase(),
            account_number: formData.account_number,
            account_number_confirm: formData.account_number_confirm,
          };
    try {
      setSaving(true);
      const result = await savePayoutDetails(accessToken, payload);
      setSavedDetails(result.account);
      setMethod(result.account.method);
      setEditing(false);
      setFormData({
        ...emptyForm,
        account_holder_name: result.account.account_holder_name || "",
        ifsc: result.account.ifsc || "",
        vpa: result.account.vpa || "",
      });
      if (result.released_payouts > 0) {
        toast.success(
          `Payout details saved. ${result.released_payouts} waiting payout(s) started.`,
        );
      } else {
        toast.success("Payout details saved successfully.");
      }
    } catch (error) {
      if (error.errors) {
        const messages = Object.values(error.errors).flat();
        toast.error(messages[0] || error.message);
      } else {
        toast.error(error.message || "Failed to save payout details.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setMethod(savedDetails.method);
    setFormData({
      ...emptyForm,
      account_holder_name: savedDetails.account_holder_name || "",
      ifsc: savedDetails.ifsc || "",
      vpa: savedDetails.vpa || "",
    });
    setEditing(true);
  };
  const handleCancelEdit = () => {
    setMethod(savedDetails.method);
    setFormData({
      ...emptyForm,
      account_holder_name: savedDetails.account_holder_name || "",
      ifsc: savedDetails.ifsc || "",
      vpa: savedDetails.vpa || "",
    });
    setEditing(false);
  };
  const showForm = !savedDetails || editing;
  if (loading) {
    return (
      <div className="space-y-5 p-4 text-(--accent-color) sm:p-6">
        <h1 className="font-['Google_Sans_Flex'] text-3xl font-semibold">
          Payout Details
        </h1>

        <div className="h-48 animate-pulse rounded-xl border border-(--border-color) bg-(--card-background)" />
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-5 p-4 text-(--accent-color) sm:p-6">
      <h1 className="font-['Google_Sans_Flex'] text-3xl font-semibold">
        Payout Details
      </h1>

      <section>
        <h2 className="mb-5 text-base font-medium text-(--text-color)">
          Account Details
        </h2>

        {pageError && !savedDetails ? (
          <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
            <p className="text-sm text-(--error-color)">{pageError}</p>

            <button
              type="button"
              onClick={loadPayoutDetails}
              className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm"
            >
              Retry
            </button>
          </div>
        ) : showForm ? (
          <form
            onSubmit={handleSave}
            className="rounded-xl border border-(--border-color) bg-(--card-background) p-4 sm:p-5"
          >
            <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--accent-color)">
              <span className="bg-orange-400 rounded-full h-1.5 w-1.5"></span>
              {savedDetails ? "Edit your account" : "Add your account"}
            </div>

            <div className="mb-5 flex h-9 max-w-[465px] rounded-full bg-(--input-background) p-0.5">
              <button
                type="button"
                onClick={() => handleMethodChange("bank_account")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full text-xs font-medium transition ${
                  method === "bank_account"
                    ? "bg-(--accent-color) text-(--page-background)"
                    : "text-(--secondary-text-color)"
                }`}
              >
                <BiSolidBank size={14} />
                Bank Account
              </button>

              <button
                type="button"
                onClick={() => handleMethodChange("vpa")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full text-xs font-medium transition ${
                  method === "vpa"
                    ? "bg-(--accent-color) text-(--page-background)"
                    : "text-(--secondary-text-color)"
                }`}
              >
                <BsFillCreditCard2BackFill size={13} />
                UPI
              </button>
            </div>

            {method === "bank_account" ? (
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <FormField
                  label="Account Holder Name"
                  name="account_holder_name"
                  placeholder="Enter account holder name"
                  value={formData.account_holder_name}
                  onChange={handleChange}
                  maxLength={50}
                />

                <FormField
                  label="IFSC Code"
                  name="ifsc"
                  placeholder="Enter IFSC code"
                  value={formData.ifsc}
                  onChange={handleChange}
                  maxLength={11}
                />

                <FormField
                  label="Account Number"
                  name="account_number"
                  placeholder="Enter account number"
                  value={formData.account_number}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={18}
                />

                <FormField
                  label="Confirm Account Number"
                  name="account_number_confirm"
                  placeholder="Confirm account number"
                  value={formData.account_number_confirm}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={18}
                />
              </div>
            ) : (
              <div className="max-w-[465px]">
                <FormField
                  label="UPI ID"
                  name="vpa"
                  placeholder="Enter UPI ID"
                  value={formData.vpa}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-[10px] text-(--secondary-text-color)">
                <FaLock size={11} />
                Secured with RazorpayX
              </p>

              <div className="flex gap-2">
                {editing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="rounded-md border border-(--border-color) px-4 py-2 text-xs font-medium text-(--accent-color)"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="min-w-28 rounded-md bg-(--accent-color) px-5 py-2 text-xs font-semibold text-(--page-background) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving"
                    : savedDetails
                      ? "Update Details"
                      : "Save Details"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-4 sm:p-5">
            {savedDetails.method === "bank_account" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SavedField
                  label="Account Holder Name"
                  value={savedDetails.account_holder_name}
                />

                <SavedField label="Bank Name" value={savedDetails.bank_name} />

                <SavedField label="IFSC Code" value={savedDetails.ifsc} />

                <SavedField
                  label="Account Number"
                  value={`**** ${savedDetails.account_last4 || "----"}`}
                />
              </div>
            ) : (
              <SavedField label="UPI ID" value={savedDetails.vpa} />
            )}

            {savedDetails.updated_at && (
              <p className="mt-4 text-xs text-(--secondary-text-color)">
                Last updated:{" "}
                {new Date(savedDetails.updated_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-(--border-color) pt-4">
              <p className="flex items-center gap-1.5 text-[10px] text-(--secondary-text-color)">
                <FaLock size={11} />
                Secured with RazorpayX
              </p>

              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-2 rounded-md bg-(--accent-color) px-5 py-2 text-xs font-semibold text-(--page-background) transition hover:opacity-90"
              >
                Edit Details
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function FormField({
  label,
  name,
  placeholder,
  value,
  onChange,
  maxLength,
  inputMode,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-[10px] font-medium uppercase tracking-wide text-(--secondary-text-color)"
      >
        {label}
        <span className="text-(--error-color)">*</span>
      </label>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete="off"
        required
        className="h-10 w-full rounded-md border border-(--border-color) bg-(--input-background) px-3 text-xs text-(--text-color) outline-none transition placeholder:text-(--secondary-text-color) focus:border-(--accent-color)"
      />
    </div>
  );
}

function SavedField({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs text-(--secondary-text-color)">{label}</p>

      <p className="break-words text-sm font-medium text-(--text-color)">
        {value || "—"}
      </p>
    </div>
  );
}

export default PayoutDetails;
