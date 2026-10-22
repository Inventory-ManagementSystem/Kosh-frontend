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

export const startAdvancePayment = async (accessToken, poId) => {
  const result = await sendRequest(
    `${PROCUREMENT_URL}/purchase-orders/${poId}/advance/`,
    accessToken,
    {
      method: "POST",
    },
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
    {
      method: "GET",
    },
  );
  return result.data;
};
