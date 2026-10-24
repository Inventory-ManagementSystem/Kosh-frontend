const BASE_URL = import.meta.env.VITE_BASE_URL;
const PROCUREMENT_URL = `${BASE_URL}procurement`;

const sendRequest = async (url, accessToken, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    const error = new Error(data.message || "Something went wrong.");

    error.code = data.code;
    error.status = response.status;

    throw error;
  }

  return data;
};

export const findPurchaseOrderByQuotationId = async (
  accessToken,
  quotationId,
) => {
  let page = 1;

  while (true) {
    const result = await sendRequest(
      `${PROCUREMENT_URL}/orders/?page=${page}&page_size=50`,
      accessToken,
      { method: "GET" },
    );

    const orderData = result.data;
    const orders = orderData?.results ?? [];

    const existingOrder = orders.find(
      (order) => String(order.quotation_id) === String(quotationId),
    );

    if (existingOrder) {
      return existingOrder;
    }

    if (!orderData?.next || orders.length === 0) {
      return null;
    }
    page += 1;
  }
};

export const startAdvancePayment = async (accessToken, poId) => {
  const result = await sendRequest(
    `${PROCUREMENT_URL}/purchase-orders/${poId}/advance/`,
    accessToken,
    { method: "POST" },
  );

  return result.data;
};

export const verifyAdvancePayment = async (
  accessToken,
  poId,
  paymentDetails,
) => {
  return sendRequest(
    `${PROCUREMENT_URL}/purchase-orders/${poId}/advance/verify/`,
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentDetails),
    },
  );
};

export const getAdvancePaymentStatus = async (accessToken, poId) => {
  const result = await sendRequest(
    `${PROCUREMENT_URL}/purchase-orders/${poId}/advance/`,
    accessToken,
    { method: "GET" },
  );

  return result.data;
};



export const startBalancePayment = async (accessToken, invoiceId) => {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}procurement/invoices/${invoiceId}/balance/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(
      result.message || "Unable to start final payment.",
    );

    error.code = result.code;
    throw error;
  }

  return result.data;
};

export const verifyBalancePayment = async (
  accessToken,
  invoiceId,
  paymentData,
) => {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}procurement/invoices/${invoiceId}/balance/verify/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(
      result.message || "Unable to verify final payment.",
    );

    error.code = result.code;
    throw error;
  }

  return result.data;
};
