const BASE_URL = import.meta.env.VITE_BASE_URL;
const PROCUREMENT_URL = `${BASE_URL}procurement`;

const getErrorMessage = (data, fallback) => {
  if (data.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat();
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }
  return data.message || fallback;
};

export const getQuotations = async (accessToken, rfqId, options = {}) => {
  const params = new URLSearchParams();
  if (options.sort) {
    params.set("sort", options.sort);
  }
  if (options.weightPrice !== undefined) {
    params.set("weight_price", String(options.weightPrice));
  }
  if (options.weightDelivery !== undefined) {
    params.set("weight_delivery", String(options.weightDelivery));
  }
  if (options.weightPayment !== undefined) {
    params.set("weight_payment", String(options.weightPayment));
  }
  const query = params.toString();
  const url = `${PROCUREMENT_URL}/rfqs/${rfqId}/quotations/${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch quotations."));
  }
  return data;
};

const sendRequest = async (url, accessToken, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(getErrorMessage(data, "Something went wrong."));
    error.code = data.code;
    error.status = response.status;
    throw error;
  }
  return data;
};

export const acceptQuotation = async (accessToken, quotationId) => {
  const data = await sendRequest(
    `${PROCUREMENT_URL}/quotations/${quotationId}/accept/`,
    accessToken,
    {
      method: "POST",
    },
  );
  return data.data;
};
