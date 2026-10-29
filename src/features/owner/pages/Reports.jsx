import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiLoader,
  FiChevronDown,
  FiFileText,
  FiCreditCard,
  FiChevronUp,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import logo from "../../../assets/auth/logo.svg";
import {
  startBalancePayment,
  verifyBalancePayment,
} from "../api/paymentApi";

import {
  getReportOrders,
  getReportOrderDetails,
  getReportInvoice,
  getReportGRN,
} from "../api/reportsApi";

import { sendAssistantMessage } from "../api/assistantApi";
import formatAssistantMessage from "../components/formatAssistantMessage";

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const REPORT_CACHE_PREFIX = "kosh-report-";

function getCachedReport(orderId) {
  try {
    return sessionStorage.getItem(REPORT_CACHE_PREFIX + orderId) || "";
  } catch (error) {
    console.error("Could not read cached report:", error);
    return "";
  }
}

function saveCachedReport(orderId, report) {
  try {
    sessionStorage.setItem(REPORT_CACHE_PREFIX + orderId, report);
  } catch (error) {
    console.error("Could not save cached report:", error);
  }
}

function formatMoney(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DetailRow({ label, value, bold = false }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--border-color)] py-2 last:border-b-0">
      <span className="text-xs text-[var(--secondary-text-color)]">
        {label}
      </span>

      <span
        className={`max-w-[65%] break-words text-right text-xs text-[var(--text-color)] ${
          bold ? "font-semibold" : ""
        }`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--card-background)] p-3 sm:p-4 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({ title, number }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-color)]">
          {title}
        </h2>

        {number && (
          <p className="mt-0.5 text-xs text-[var(--secondary-text-color)]">
            {number}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <img src={logo} alt="KOSH" className="h-5 w-auto" />
      </div>
    </div>
  );
}


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


function Reports() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showOrders, setShowOrders] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [grn, setGrn] = useState(null);
  const [report, setReport] = useState("");

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const [pageError, setPageError] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [grnError, setGrnError] = useState("");
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!accessToken) {
        setLoadingOrders(false);
        return;
      }

      setLoadingOrders(true);
      setPageError("");

      try {
        const response = await getReportOrders(accessToken);
        setOrders(response?.data?.results || []);
      } catch (error) {
        setPageError(error.message || "Unable to load purchase orders.");
      } finally {
        setLoadingOrders(false);
      }
    }

    loadOrders();
  }, [accessToken]);

  
const filteredOrders = orders.filter((order) => {
  if (!order.grn_id) {
    return false;
  }

  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return (
    order.number?.toLowerCase().includes(query) ||
    order.company_name?.toLowerCase().includes(query) ||
    order.id?.toLowerCase().includes(query)
  );
});


  async function handleSelectOrder(order) {
    setSearch(order.number || "");
    setShowOrders(false);

    setSelectedOrder(null);
    setInvoice(null);
    setGrn(null);
    setReport("");

    setPageError("");
    setInvoiceError("");
    setGrnError("");
    setReportError("");

    setLoadingDetails(true);

    try {
      const orderResponse = await getReportOrderDetails(
        accessToken,
        order.id,
      );

      const orderDetails = orderResponse?.data;

      if (!orderDetails) {
        throw new Error("Purchase order details were not returned.");
      }

      setSelectedOrder(orderDetails);
      if (orderDetails.invoice_id) {
        try {
          const invoiceResponse = await getReportInvoice(
            accessToken,
            orderDetails.invoice_id,
          );

          setInvoice(invoiceResponse?.data || null);

          if (!invoiceResponse?.data) {
            setInvoiceError("Invoice details are not available.");
          }
        } catch (error) {
          setInvoiceError(
            error.message || "Unable to load invoice details.",
          );
        }
      } else {
        setInvoiceError("An invoice has not been generated yet.");
      }

      if (orderDetails.grn_id) {
        try {
          const grnResponse = await getReportGRN(
            accessToken,
            orderDetails.grn_id,
          );

          setGrn(grnResponse?.data || null);

          if (!grnResponse?.data) {
            setGrnError("GRN details are not available.");
          }
        } catch (error) {
          setGrnError(
            error.message || "Unable to load GRN details.",
          );
        }
      } else {
        setGrnError("A goods receipt has not been created yet.");
      }

      const cachedReport = getCachedReport(order.id);

      if (cachedReport) {
        setReport(cachedReport);
      } else {
      setLoadingReport(true);
      const prompt = `Draft a bulleted report for ${orderDetails.number || order.number}. Don't include a heading or any introductory lines. Write concise sentences for each bullet, with about 5-8 bullets. Don't use "field: value" format.`;
      try {
        const assistantResponse = await sendAssistantMessage(
          prompt,
          accessToken,
          null,
        );

        const reply = assistantResponse?.data?.reply;

        if (!reply) {
          throw new Error("The assistant returned an empty report.");
        }
        setReport(reply);
        saveCachedReport(order.id, reply);
      } catch (error) {
        setReportError(
          error.message || "Unable to generate the report.",
        );
      } finally {
        setLoadingReport(false);
      }
      }
    } catch (error) {
      setPageError(
        error.message || "Unable to load the selected purchase order.",
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  const isPaid =
    grn?.settlement?.status?.toLowerCase() === "paid";

  const invoiceItems = invoice?.items || [];
  const grnItems = grn?.items || [];

  
async function handlePayBalance() {
  if (paymentBusy || checkoutOpen) return;

  if (!accessToken) {
    toast.error("Your session has expired. Please log in again.");
    return;
  }

  if (!invoice?.id) {
    toast.error("Invoice details are not available.");
    return;
  }

  if (Number(invoice.balance_due) <= 0) {
    toast.error("There is no balance due on this invoice.");
    return;
  }

  if (grn?.settlement?.status?.toLowerCase() === "paid") {
    toast.success("This invoice is already paid.");
    return;
  }

  setPaymentBusy(true);

  try {
    const loaded = await loadRazorpay();

    if (!loaded) {
      throw new Error("Couldn't load Razorpay. Check your connection.");
    }

    const checkoutData = await startBalancePayment(
      accessToken,
      invoice.id,
    );

    const razorpay = new window.Razorpay({
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
          await verifyBalancePayment(accessToken, invoice.id, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          const invoiceResponse = await getReportInvoice(
            accessToken,
            invoice.id,
          );

          if (invoiceResponse?.data) {
            setInvoice(invoiceResponse.data);
          }

          if (selectedOrder?.grn_id) {
            const grnResponse = await getReportGRN(
              accessToken,
              selectedOrder.grn_id,
            );

            if (grnResponse?.data) {
              setGrn(grnResponse.data);
            }
          }

          toast.success("Final balance payment verified successfully.");
        } catch (error) {
          console.error("Balance payment verification failed:", error);
          toast.error(
            error.message ||
              "Payment status could not be confirmed. Refresh the report before retrying.",
          );
        } finally {
          setPaymentBusy(false);
        }
      },

      modal: {
        ondismiss: () => {
          setCheckoutOpen(false);
          setPaymentBusy(false);
        },
      },
    });

    razorpay.on("payment.failed", (response) => {
      setCheckoutOpen(false);
      setPaymentBusy(false);

      toast.error(
        response.error?.description || "The payment could not be completed.",
      );
    });

    setCheckoutOpen(true);
    razorpay.open();
  } catch (error) {
    console.error("Unable to start balance payment:", error);
    toast.error(error.message || "Unable to start final payment.");

    setPaymentBusy(false);
    setCheckoutOpen(false);
  }
}


  return (
    <div className="min-h-screen px-3 py-5 text-[var(--text-color)] sm:px-5 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-20 mb-5 max-w-md">
          <div className="flex h-10 items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--input-background)] px-4">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowOrders(true);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  filteredOrders.length > 0
                ) {
                  handleSelectOrder(filteredOrders[0]);
                }

                if (event.key === "Escape") {
                  setShowOrders(false);
                }
              }}
              placeholder="Search order number"
              className="w-full bg-transparent text-xs text-[var(--text-color)] outline-none placeholder:text-[var(--secondary-text-color)]"
            />

            <button
              type="button"
              onClick={() => {
                if (!showOrders) {
                setSearch("");
               }
              setShowOrders((previous) => !previous);
              }}
              className="flex shrink-0 items-center justify-center text-[var(--secondary-text-color)]"
              aria-label={
                showOrders ? "Close order dropdown" : "Open order dropdown"
              }
              aria-expanded={showOrders}
            >
              {showOrders ? (
                <FiChevronUp size={15} />
              ) : (
                <FiChevronDown size={15} />
              )}
            </button>
          </div>

          {showOrders && (
            <div className="absolute left-0 right-0 top-12 max-h-64 overflow-y-auto rounded-lg border border-[var(--border-color)] bg-[var(--dropdown-background)] shadow-xl">
              {loadingOrders ? (
                <p className="px-4 py-3 text-xs text-[var(--secondary-text-color)]">
                  Loading purchase orders...
                </p>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => handleSelectOrder(order)}
                    className="flex w-full items-center justify-between gap-3 border-b border-[var(--border-color)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--decoration-background)]"
                  >
                    <span>
                      <span className="block text-sm font-medium">
                        {order.number}
                      </span>

                      <span className="mt-0.5 block text-xs text-[var(--secondary-text-color)]">
                        {order.company_name || "Supplier"}
                      </span>
                    </span>

                    <FiArrowRight
                      size={14}
                      className="shrink-0 text-[var(--secondary-text-color)]"
                    />
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-xs text-[var(--secondary-text-color)]">
                  No purchase orders found.
                </p>
              )}
            </div>
          )}
        </div>

        {pageError && (
          <div className="mb-4 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] p-3 text-sm text-[var(--error-color)]">
            {pageError}
          </div>
        )}

        {loadingDetails && (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-[var(--secondary-text-color)]">
            <FiLoader className="animate-spin" size={18} />
            Loading purchase order details...
          </div>
        )}

        {!selectedOrder && !loadingDetails && (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--card-background)] p-6 text-center">
            <FiFileText
              size={28}
              className="mb-3 text-[var(--secondary-text-color)]"
            />

            <h2 className="text-sm font-semibold">
              Select a purchase order
            </h2>

            <p className="mt-1 max-w-sm text-xs text-[var(--secondary-text-color)]">
              Search for a PO number above to view its invoice,
              goods receipt, and AI-generated discrepancy report.
            </p>
          </div>
        )}

        {selectedOrder && !loadingDetails && (
          <>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
              <SectionCard>
                <SectionHeading
                  title="Invoice"
                  number={invoice?.number || selectedOrder.number}
                />

                {invoice ? (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] text-[var(--secondary-text-color)]">
                          From:
                        </p>

                        <p className="break-words text-xs font-semibold">
                          {invoice.supplier?.company_name ||
                            invoice.company_name ||
                            "—"}
                        </p>

                        <p className="mt-1 text-xs text-[var(--secondary-text-color)]">
                          {invoice.supplier?.address || ""}
                        </p>

                        <p className="text-xs text-[var(--secondary-text-color)]">
                          {invoice.supplier?.city || ""}
                        </p>

                        <p className="mt-1 break-words text-xs text-[var(--secondary-text-color)]">
                          Phone: {invoice.supplier?.phone || "—"}
                        </p>

                        <p className="break-words text-xs text-[var(--secondary-text-color)]">
                          Email: {invoice.supplier?.email || "—"}
                        </p>
                      </div>

                      <div className="min-w-0 sm:text-right">
                        <p className="mb-1 text-[10px] text-[var(--secondary-text-color)]">
                          To:
                        </p>

                        <p className="break-words text-xs font-semibold">
                          {invoice.buyer?.business_name ||
                            invoice.business_name ||
                            "—"}
                        </p>

                        <p className="mt-1 text-xs text-[var(--secondary-text-color)]">
                          {invoice.buyer?.city || ""}
                        </p>

                        <p className="mt-1 break-words text-xs text-[var(--secondary-text-color)]">
                          Owner: {invoice.buyer?.owner_name || "—"}
                        </p>

                        <p className="break-words text-xs text-[var(--secondary-text-color)]">
                          Email: {invoice.buyer?.email || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="my-4 grid grid-cols-2 gap-3 rounded-lg bg-[var(--decoration-background)] p-3">
                      <div>
                        <p className="text-[10px] text-[var(--secondary-text-color)]">
                          Invoice date
                        </p>
                        <p className="mt-1 text-xs font-medium">
                          {formatDate(invoice.issue_date)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-[var(--secondary-text-color)]">
                          Purchase order
                        </p>
                        <p className="mt-1 text-xs font-medium">
                          {invoice.po_number ||
                            selectedOrder.number}
                        </p>
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[360px] text-left text-xs">
                        <thead>
                          <tr className="bg-[var(--decoration-background)] text-[var(--secondary-text-color)]">
                            <th className="rounded-l-md px-2 py-2 font-normal">
                              Products
                            </th>
                            <th className="px-2 py-2 text-right font-normal">
                              Quantity
                            </th>
                            <th className="rounded-r-md px-2 py-2 text-right font-normal">
                              Amount
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {invoiceItems.map((item) => (
                            <tr key={item.id}>
                              <td className="max-w-40 break-words px-2 py-2 text-[var(--text-color)]">
                                {item.product_name}
                              </td>

                              <td className="px-2 py-2 text-right">
                                {item.quantity}
                              </td>

                              <td className="px-2 py-2 text-right">
                                {formatMoney(item.line_total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3 border-t border-[var(--border-color)] pt-2">
                      <DetailRow
                        label="Subtotal"
                        value={formatMoney(invoice.subtotal)}
                      />
                      <DetailRow
                        label="Tax"
                        value={formatMoney(invoice.tax_total)}
                      />
                      <DetailRow
                        label="Total"
                        value={formatMoney(invoice.grand_total)}
                        bold
                      />
                      <DetailRow
                        label="Advance applied"
                        value={formatMoney(invoice.advance_applied)}
                      />
                      <DetailRow
                        label="Discrepancy credit"
                        value={formatMoney(invoice.discrepancy_credit)}
                      />
                      <DetailRow
                        label="Balance due"
                        value={formatMoney(invoice.balance_due)}
                        bold
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-[var(--secondary-text-color)]">
                          Payment method
                        </p>
                        <p className="mt-1 text-xs font-medium">
                          Razorpay
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-[var(--secondary-text-color)]">
                          Expected delivery
                        </p>
                        <p className="mt-1 text-xs font-medium">
                          {formatDate(
                            invoice.shipment?.expected_delivery_date,
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg bg-[var(--decoration-background)] p-4">
                    <p className="text-sm font-medium">
                      Invoice not available
                    </p>
                    <p className="mt-1 text-xs text-[var(--secondary-text-color)]">
                      {invoiceError ||
                        "An invoice has not been generated for this order yet."}
                    </p>
                  </div>
                )}
              </SectionCard>

              <SectionCard>
                <SectionHeading
                  title="Goods Receipt Note"
                  number={grn?.number || selectedOrder.grn_number}
                />

                {grn ? (
                  <>
                    <div className="mb-4 text-center">
                      <h3 className="text-sm font-semibold text-[var(--accent-color)]">
                        GRN
                      </h3>

                      <p className="mt-1 text-xs text-[var(--secondary-text-color)]">
                        {grn.purchase_order_number ||
                          selectedOrder.number}
                      </p>
                    </div>

                    {grnItems.map((item) => (
                      <div
                        key={item.id}
                        className="mb-4 border-b border-[var(--border-color)] pb-3 last:mb-0"
                      >
                        <DetailRow
                          label="Item"
                          value={item.product_name}
                          bold
                        />

                        <DetailRow
                          label="SKU"
                          value={item.sku || "—"}
                        />

                        <DetailRow
                          label="Ordered"
                          value={item.ordered_quantity}
                        />

                        <DetailRow
                          label="Dispatched"
                          value={item.dispatched_quantity}
                        />

                        <DetailRow
                          label="Received"
                          value={item.received_quantity}
                        />

                        <DetailRow
                          label="Accepted units"
                          value={item.accepted_quantity}
                        />

                        <DetailRow
                          label="Damaged / rejected"
                          value={item.rejected_quantity}
                        />

                        <DetailRow
                          label="Credit amount"
                          value={formatMoney(item.credit_amount)}
                        />

                        {item.discrepancies?.length > 0 && (
                          <div className="mt-2 rounded-md bg-[var(--decoration-background)] p-2">
                            <p className="mb-1 text-[10px] font-semibold">
                              Discrepancies
                            </p>

                            {item.discrepancies.map(
                              (discrepancy, index) => (
                                <p
                                  key={`${discrepancy.kind}-${index}`}
                                  className="py-0.5 text-xs text-[var(--secondary-text-color)]"
                                >
                                  • {discrepancy.kind_label}:{" "}
                                  {discrepancy.quantity}
                                </p>
                              ),
                            )}
                          </div>
                        )}

                        {item.note && (
                          <p className="mt-2 text-xs text-[var(--secondary-text-color)]">
                            Note: {item.note}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="mt-3 border-t border-[var(--border-color)] pt-2">
                      <DetailRow
                        label="Received date"
                        value={formatDate(grn.received_at)}
                      />

                      <DetailRow
                        label="Received by"
                        value={grn.received_by}
                      />

                      <DetailRow
                        label="Discrepancies"
                        value={grn.discrepancy_count ?? 0}
                      />

                      <DetailRow
                        label="Settlement status"
                        value={grn.settlement?.status || "Unavailable"}
                        bold
                      />

                      <DetailRow
                        label="Invoice total"
                        value={formatMoney(
                          grn.settlement?.grand_total,
                        )}
                      />

                      <DetailRow
                        label="Discrepancy credit"
                        value={formatMoney(
                          grn.settlement?.discrepancy_credit,
                        )}
                      />

                      <DetailRow
                        label="Advance applied"
                        value={formatMoney(
                          grn.settlement?.advance_applied,
                        )}
                      />

                      <DetailRow
                        label="Balance due"
                        value={formatMoney(
                          grn.settlement?.balance_due,
                        )}
                        bold
                      />

                      <DetailRow
                        label="Refund due"
                        value={formatMoney(
                          grn.settlement?.refund_due,
                        )}
                      />
                    </div>

                    {grn.notes && (
                      <div className="mt-3 rounded-md bg-[var(--decoration-background)] p-3">
                        <p className="text-[10px] text-[var(--secondary-text-color)]">
                          Receipt notes
                        </p>
                        <p className="mt-1 text-xs">
                          {grn.notes}
                        </p>
                      </div>
                    )}

                    
                    <button
                    type="button"
                    disabled={isPaid || paymentBusy || checkoutOpen}
                    onClick={handlePayBalance}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent-color)] px-4 text-xs font-semibold text-[var(--page-background)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-80"
                    >
                    {isPaid ? (
                        <>
                        <FiCheckCircle size={15} />
                        Paid
                        </>
                    ) : paymentBusy || checkoutOpen ? (
                        <>
                        <FiLoader className="animate-spin" size={15} />
                        {checkoutOpen ? "Payment window open..." : "Processing..."}
                        </>
                    ) : (
                        <>
                        <FiCreditCard size={15} />
                        Pay {formatMoney(grn?.settlement?.balance_due ?? invoice?.balance_due)}
                        <FiArrowRight size={14} />
                        </>
                    )}
                    </button>

                  </>
                ) : (
                  <div className="rounded-lg bg-[var(--decoration-background)] p-4">
                    <p className="text-sm font-medium">
                      Goods receipt not available
                    </p>
                    <p className="mt-1 text-xs text-[var(--secondary-text-color)]">
                      {grnError ||
                        "A GRN has not been created for this order yet."}
                    </p>
                  </div>
                )}
              </SectionCard>
            </div>

            <SectionCard className="mt-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-(--accent-color)">
                  Final Stock Details and Discrepancy Report
                </h2>
                {loadingReport && (
                  <span className="flex items-center gap-2 text-xs text-[var(--secondary-text-color)]">
                    <FiLoader className="animate-spin" size={14} />
                    Generating report...
                  </span>
                )}
              </div>

              {loadingReport ? (
                <div className="space-y-3 py-3">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--decoration-background)]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[var(--decoration-background)]" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-[var(--decoration-background)]" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--decoration-background)]" />
                </div>
              ) : report ? (
                <div className="space-y-2 text-xs leading-6 text-[var(--text-color)]">
                  {formatAssistantMessage(report)}
                </div>
              ) : (
                <div className="rounded-lg bg-[var(--decoration-background)] p-3">
                  <p className="text-xs text-[var(--secondary-text-color)]">
                    {reportError ||
                      "The report has not been generated."}
                  </p>
                </div>
              )}
            </SectionCard>
          </>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 min-w-20 items-center justify-center gap-2 rounded-md border border-[var(--border-color)] px-4 text-xs text-[var(--text-color)] transition hover:bg-[var(--decoration-background)]"
          >
            <FiArrowLeft size={13} />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reports;
