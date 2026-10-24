
const BASE_URL = import.meta.env.VITE_BASE_URL;

async function getResponse(url, accessToken) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || "Unable to fetch data. Please try again.",
    );
  }

  return result;
}

export async function getReportOrders(accessToken) {
  return getResponse(
    "procurement/orders/?page=1&page_size=50",
    accessToken,
  );
}

export async function getReportOrderDetails(accessToken, orderId) {
  return getResponse(
    `procurement/orders/${orderId}/`,
    accessToken,
  );
}

export async function getReportInvoice(accessToken, invoiceId) {
  return getResponse(
    `procurement/invoices/${invoiceId}/`,
    accessToken,
  );
}

export async function getReportGRN(accessToken, grnId) {
  return getResponse(
    `procurement/goods-receipts/${grnId}/`,
    accessToken,
  );
}
