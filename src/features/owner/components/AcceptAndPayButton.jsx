import { useEffect, useState } from "react";
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
  findPurchaseOrderByQuotationId,
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

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });

      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

function AcceptAndPayButton({ quotationId, advanceAmount, onPaymentUpdate }) {
  const { accessToken } = useAuth();

  const [busy, setBusy] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentPopup, setPaymentPopup] = useState(null);
  const [advancePaid, setAdvancePaid] = useState(false);

  const showPaymentPopup = (type, message) => {
    setPaymentPopup({ type, message });
  };

  const closePaymentPopup = () => {
    setPaymentPopup(null);
  };

  const refreshStatus = async (poId) => {
    const statusData = await getAdvancePaymentStatus(accessToken, poId);
    setOrderStatus(statusData.order.status);
    const isPaid = statusData.payments?.some(
      (payment) => payment.status === "paid",
    );
    setAdvancePaid(Boolean(isPaid));
    onPaymentUpdate?.(statusData);
    return statusData;
  };

  useEffect(() => {
    if (!accessToken || !quotationId) return;
    let cancelled = false;
    const restoreExistingOrder = async () => {
      try {
        const existingOrder = await findPurchaseOrderByQuotationId(
          accessToken,
          quotationId,
        );
        if (!existingOrder) return;
        const statusData = await getAdvancePaymentStatus(
          accessToken,
          existingOrder.id,
        );
        if (cancelled) return;
        setOrderStatus(statusData.order.status);
        const isPaid = statusData.payments?.some(
          (payment) => payment.status === "paid",
        );
        setAdvancePaid(Boolean(isPaid));
        onPaymentUpdate?.(statusData);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to recover existing purchase order:", error);
        }
      }
    };
    restoreExistingOrder();
    return () => {
      cancelled = true;
    };
  }, [accessToken, quotationId]);

  const showConfirmedStatus = (statusData) => {
    if (!statusData) {
      return "pending";
    }
    if (statusData.order?.status === "cancelled") {
      showPaymentPopup(
        "failure",
        "This purchase order was cancelled. Please check the payment status and refund details.",
      );
      return "failure";
    }
    const isPaid = statusData.payments?.some(
      (payment) => payment.status === "paid",
    );
    if (isPaid) {
      showPaymentPopup(
        "success",
        statusData.order?.status === "issued"
          ? "Your advance payment has been confirmed, and your purchase order has been issued."
          : "Your advance payment has been confirmed successfully. Your purchase order status may still be updating.",
      );

      return "success";
    }
    const isFailed = statusData.payments?.some(
      (payment) => payment.status === "failed",
    );
    if (isFailed) {
      showPaymentPopup(
        "failure",
        "Your payment could not be completed. Please check the order status before trying again.",
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
    let poId = null;
    try {
      let purchaseOrder;
      const existingOrder = await findPurchaseOrderByQuotationId(
        accessToken,
        quotationId,
      );
      if (existingOrder) {
        poId = existingOrder.id;
        const statusData = await refreshStatus(poId);
        purchaseOrder = statusData.order;
      } else {
        try {
          const acceptResponse = await acceptQuotation(
            accessToken,
            quotationId,
          );
          purchaseOrder = acceptResponse?.data ?? acceptResponse;
          if (!purchaseOrder?.id) {
            throw new Error(
              "The server did not return the purchase order ID. Check All Orders before trying again.",
            );
          }
          poId = purchaseOrder.id;
          setOrderStatus(purchaseOrder.status);
        } catch (acceptError) {
          if (acceptError.code !== "RFQ_ALREADY_AWARDED") {
            throw acceptError;
          }
          const recoveredOrder = await findPurchaseOrderByQuotationId(
            accessToken,
            quotationId,
          );
          if (!recoveredOrder) {
            throw new Error(
              "This quotation has already been accepted, but its purchase order could not be found. Please open All Orders and try again.",
            );
          }
          poId = recoveredOrder.id;
          const statusData = await refreshStatus(poId);
          purchaseOrder = statusData.order;
        }
      }
      if (
        purchaseOrder.status === "issued" ||
        purchaseOrder.status === "dispatched" ||
        purchaseOrder.status === "partially_received" ||
        purchaseOrder.status === "received"
      ) {
        setOrderStatus(purchaseOrder.status);
        toast.success("Purchase order is already confirmed.");
        return;
      }
      if (purchaseOrder.status === "cancelled") {
        setOrderStatus("cancelled");
        toast.error("This purchase order has been cancelled.");
        return;
      }
      if (Number(purchaseOrder.advance_amount) === 0) {
        toast.success("Purchase order confirmed.");
        return;
      }
      if (purchaseOrder.status !== "awaiting_advance") {
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
            const statusData = await refreshStatus(poId);
            if (statusData.order.status === "cancelled") {
              showConfirmedStatus(statusData);
              return;
            }
            const isPaid = statusData.payments?.some(
              (payment) => payment.status === "paid",
            );
            if (isPaid) {
              showPaymentPopup(
                "success",
                result.message ||
                  "Your advance payment has been confirmed successfully.",
              );

              return;
            }
            toast(
              "Payment verification was submitted. Your payment status is still being updated. Please check again shortly.",
            );
          } catch (error) {
            console.error("Payment verification error:", error);
            try {
              const statusData = await refreshStatus(poId);
              const status = showConfirmedStatus(statusData);
              if (status === "pending") {
                toast(
                  "Payment status is not confirmed yet. Please check again shortly.",
                );
              }
            } catch (statusError) {
              console.error("Payment status check failed:", statusError);
              toast(
                "We couldn't confirm your payment status. Please check your order before retrying.",
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
            } catch (error) {
              console.error(
                "Failed to check status after checkout closed:",
                error,
              );

              toast(
                "Checkout closed. Check your order status before retrying.",
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
                "Your payment could not be completed. Please check your order status before retrying.",
            );
          }
        } catch (error) {
          console.error("Payment failure status check failed:", error);

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
        poId &&
        [
          "ADVANCE_EXPIRED",
          "ADVANCE_ALREADY_PAID",
          "NO_ADVANCE_DUE",
          "ORDER_CANCELLED",
        ].includes(error.code)
      ) {
        try {
          await refreshStatus(poId);
        } catch (statusError) {
          console.error(
            "Failed to refresh purchase order status:",
            statusError,
          );
        }
      }

      toast.error(error.message || "Unable to start payment.");

      setBusy(false);
      setCheckoutOpen(false);
    }
  };

  return (
    <>
      {advancePaid ? (
        <div className="flex items-center gap-2 text-sm font-medium text-green-500">
          <FiCheckCircle size={17} />
          Advance Payment Completed
        </div>
      ) : orderStatus === "issued" ||
        orderStatus === "dispatched" ||
        orderStatus === "partially_received" ||
        orderStatus === "received" ? (
        <div className="flex items-center gap-2 text-sm font-medium text-(--secondary-text-color)">
          <FiCheckCircle size={17} />
          Order placed
        </div>
      ) : orderStatus === "cancelled" ? (
        <div className="flex items-center gap-2 text-sm font-medium text-(--error-color)">
          <FiXCircle size={17} />
          Order Cancelled
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAcceptAndPay}
          disabled={busy || checkoutOpen}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--accent-color) px-4 py-2.5 text-sm font-semibold text-(--page-background) transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
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
                className="mt-7 h-10 w-full max-w-xs rounded-md bg-(--accent-color) text-sm font-semibold text-(--page-background) transition hover:opacity-90"
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
