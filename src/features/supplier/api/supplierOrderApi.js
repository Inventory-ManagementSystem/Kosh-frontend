const BASE_URL = import.meta.env.VITE_BASE_URL;

const getErrorMessage = (data, fallback) => data?.message || fallback;

export const getSupplierOrders = async (
  accessToken,
  page = 1,
  pageSize = 5,
) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  const response = await fetch(
    `${BASE_URL}procurement/supplier/orders/?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      credentials: "include",
    },
  );
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(getErrorMessage(data, "Failed to fetch orders."));
    error.status = response.status;
    throw error;
  }
  return data.data;
};

export const getSupplierOrderDetails = async (accessToken, orderId) => {
  const response = await fetch(
    `${BASE_URL}procurement/supplier/orders/${orderId}/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      credentials: "include",
    },
  );
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(
      getErrorMessage(data, "Failed to fetch order details."),
    );
    error.status = response.status;
    throw error;
  }
  return data.data;
};

export const getSupplierInvoiceDetails = async (accessToken, invoiceId) => {
  const response = await fetch(
    `${BASE_URL}procurement/supplier/invoices/${invoiceId}/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      credentials: "include",
    },
  );
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(
      getErrorMessage(data, "Failed to fetch invoice details."),
    );
    error.status = response.status;
    throw error;
  }
  return data.data;
};

export async function downloadSupplierInvoicePdf(accessToken, invoiceId) {
  const response = await fetch(
    `${BASE_URL}procurement/supplier/invoices/${invoiceId}/pdf/`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/pdf",
      },
    },
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Unable to download invoice.");
  }
  return response.blob();
}

export const dispatchSupplierOrder = async (
  accessToken,
  orderId,
  body = {},
) => {
  const response = await fetch(
    `${BASE_URL}procurement/supplier/orders/${orderId}/dispatch/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    },
  );
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(getErrorMessage(data, "Failed to dispatch order."));
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data.data;
};
