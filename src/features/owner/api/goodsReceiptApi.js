
const BASE_URL = import.meta.env.VITE_BASE_URL;

async function apiRequest(url, accessToken, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result.data;
}

export function getDispatchedOrders(accessToken, page = 1) {
  return apiRequest(
    `procurement/orders/?page=${page}&page_size=8&status=dispatched`,
    accessToken
  );
}

export function getOrderDetails(accessToken, orderId) {
  return apiRequest(
    `procurement/orders/${orderId}/`,
    accessToken
  );
}

export function createGRN(accessToken, orderId, grnData) {
  return apiRequest(
    `procurement/orders/${orderId}/receive/`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(grnData),
    }
  );
}
