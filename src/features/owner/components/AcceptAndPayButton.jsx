import { useState } from "react";
import {
  FiCreditCard,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { acceptQuotation } from "../api/quotationApi";
import {
  startAdvancePayment,
  verifyAdvancePayment,
  getAdvancePaymentStatus,
} from "../api/paymentApi";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const getSavedPoId = (quotationId) =>
  sessionStorage.getItem(`kosh-po-${quotationId}`);
const savePoId = (quotationId, poId) =>
  sessionStorage.setItem(`kosh-po-${quotationId}`, poId);
const removeSavedPoId = (quotationId) =>
  sessionStorage.removeItem(`kosh-po-${quotationId}`);

function AcceptAndPayButton({ quotationId, advanceAmount, onPaymentUpdate }) {
  const { accessToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentPopup, setPaymentPopup] = useState(null);

  const showPaymentPopup = (type, message) => {
    setPaymentPopup({ type, message });
  };
  const closePaymentPopup = () => {
    setPaymentPopup(null);
  };
  const refreshStatus = async (poId) => {
    const statusData = await getAdvancePaymentStatus(accessToken, poId);
    setOrderStatus(statusData.order.status);
    onPaymentUpdate?.(statusData);
    if (
      statusData.order.status === "issued" ||
      statusData.order.status === "cancelled"
    ) {
      removeSavedPoId(quotationId);
    }
    return statusData;
  };

  const waitForPaymentConfirmation = async (poId) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      try {
        const statusData = await refreshStatus(poId);
        if (
          statusData.order.status === "issued" ||
          statusData.order.status === "cancelled"
        ) {
          return statusData;
        }
        if (statusData.payments?.some((payment) => payment.status === "paid")) {
          return statusData;
        }
      } catch {
        // Retry the status check.
      }
      if (attempt < 11) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    return null;
  };

  const showConfirmedStatus = (statusData) => {
    if (statusData?.order?.status === "issued") {
      removeSavedPoId(quotationId);
      showPaymentPopup(
        "success",
        "Your advance payment has been confirmed, and your purchase order has been issued.",
      );
      return "success";
    }
    if (statusData?.order?.status === "cancelled") {
      removeSavedPoId(quotationId);
      showPaymentPopup(
        "failure",
        "This purchase order was cancelled. Please check the payment status and refund details.",
      );
      return "failure";
    }
    return "pending";
  };

  const handleAcceptAndPay = async () => {
    if (busy || checkoutOpen) return;
    if (!accessToken) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }
    setBusy(true);
    let poId = getSavedPoId(quotationId);
    try {
      let purchaseOrder;

      if (poId) {
        const statusData = await refreshStatus(poId);
        purchaseOrder = statusData.order;
      } else {
        purchaseOrder = await acceptQuotation(accessToken, quotationId);
        poId = purchaseOrder.id;
        savePoId(quotationId, poId);
        setOrderStatus(purchaseOrder.status);
      }

      if (
        purchaseOrder.status === "issued" ||
        Number(purchaseOrder.advance_amount) === 0
      ) {
        removeSavedPoId(quotationId);
        setOrderStatus(purchaseOrder.status);
        toast.success("Purchase order confirmed.");
        onPaymentUpdate?.(purchaseOrder);
        return;
      }

      if (purchaseOrder.status !== "awaiting_advance") {
        if (purchaseOrder.status === "cancelled") {
          removeSavedPoId(quotationId);
        }
        throw new Error(
          `This order cannot be paid. Current status: ${purchaseOrder.status}.`,
        );
      }

      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error(
          "Couldn't load Razorpay. Please check your connection.",
        );
      }
      const checkoutData = await startAdvancePayment(accessToken, poId);
      const options = {
        key: checkoutData.key,
        order_id: checkoutData.order_id,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: checkoutData.name,
        description: checkoutData.description,
        prefill: checkoutData.prefill,
        notes: checkoutData.notes,

        handler: async (response) => {
          setCheckoutOpen(false);

          try {
            const result = await verifyAdvancePayment(accessToken, poId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const order = result.data;
            setOrderStatus(order.status);
            onPaymentUpdate?.(order);
            if (order.status === "issued") {
              removeSavedPoId(quotationId);
              showPaymentPopup(
                "success",
                result.message ||
                  "Your advance payment has been verified successfully. Your purchase order has been issued.",
              );
              return;
            }

            if (order.status === "cancelled") {
              removeSavedPoId(quotationId);
              showPaymentPopup(
                "failure",
                "This purchase order was cancelled. Please check the payment status and refund details.",
              );
              await refreshStatus(poId);
              return;
            }

            toast("Payment submitted. Checking order status.");
            const statusData = await waitForPaymentConfirmation(poId);
            const status = showConfirmedStatus(statusData);
            if (status === "pending") {
              toast(
                "Payment is still being confirmed. Please check the order status shortly.",
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            const statusData = await waitForPaymentConfirmation(poId);
            const status = showConfirmedStatus(statusData);
            if (status === "pending") {
              toast(
                "We couldn't confirm your payment yet. Check the order status before retrying.",
              );
            }
          } finally {
            setBusy(false);
          }
        },

        modal: {
          ondismiss: async () => {
            setCheckoutOpen(false);
            setBusy(false);

            try {
              const statusData = await refreshStatus(poId);
              showConfirmedStatus(statusData);
            } catch {
              toast(
                "Checkout closed. Check the payment status before retrying.",
              );
            }
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", async (response) => {
        setCheckoutOpen(false);
        setBusy(false);

        try {
          const statusData = await refreshStatus(poId);
          const status = showConfirmedStatus(statusData);

          if (status === "pending") {
            showPaymentPopup(
              "failure",
              response.error?.description ||
                "Your payment could not be completed. You can try again.",
            );
          }
        } catch (error) {
          console.error("Payment status check failed:", error);

          showPaymentPopup(
            "failure",
            response.error?.description ||
              "Your payment could not be completed. Check your order status before retrying.",
          );
        }
      });

      setCheckoutOpen(true);
      razorpay.open();
    } catch (error) {
      if (
        error.code === "ADVANCE_EXPIRED" ||
        error.code === "ADVANCE_ALREADY_PAID" ||
        error.code === "NO_ADVANCE_DUE" ||
        error.code === "ORDER_CANCELLED"
      ) {
        if (poId) {
          try {
            await refreshStatus(poId);
          } catch {
            // Preserve the original API error.
          }
        }
      }

      toast.error(error.message || "Unable to start payment.");
      setBusy(false);
      setCheckoutOpen(false);
    }
  };

  return (
    <>
      {orderStatus === "issued" ? (
        <div className="flex items-center gap-2 text-sm font-medium text-(--secondary-text-color)">
          <FiCheckCircle />
          Order placed
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAcceptAndPay}
          disabled={busy || checkoutOpen}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--accent-color) px-4 py-2.5 text-sm font-semibold text-(--base-background) transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy || checkoutOpen ? (
            <FiLoader className="animate-spin" size={17} />
          ) : (
            <FiCreditCard size={17} />
          )}

          {checkoutOpen
            ? "Payment window open..."
            : busy
              ? "Processing..."
              : Number(advanceAmount) <= 0
                ? "Accept Quotation"
                : "Accept & Pay Advance"}
        </button>
      )}

      {paymentPopup && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-(--page-background)/70 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePaymentPopup();
            }
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-(--icon-border-color) bg-(--card-background) px-6 pb-8 pt-10 shadow-2xl">
            <button
              type="button"
              onClick={closePaymentPopup}
              className="absolute right-4 top-4 rounded-md p-1 text-(--secondary-text-color) transition hover:bg-(--dropdown-background) hover:text-(--text-color)"
              aria-label="Close popup"
            >
              <RxCross2 size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              {paymentPopup.type === "success" ? (
                <FiCheckCircle
                  size={54}
                  className="mb-4 text-(--accent-color)"
                />
              ) : (
                <FiXCircle size={54} className="mb-4 text-(--error-color)" />
              )}

              <h2 className="mb-2 text-xl font-semibold text-(--text-color)">
                {paymentPopup.type === "success"
                  ? "Payment Successful"
                  : "Payment Failed"}
              </h2>

              <p className="max-w-xs text-sm leading-6 text-(--secondary-text-color)">
                {paymentPopup.message}
              </p>

              <button
                type="button"
                onClick={closePaymentPopup}
                className="mt-7 h-10 w-full max-w-xs rounded-md bg-(--accent-color) text-sm font-semibold text-(--base-background) transition hover:opacity-90"
              >
                {paymentPopup.type === "success" ? "Continue" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AcceptAndPayButton;
