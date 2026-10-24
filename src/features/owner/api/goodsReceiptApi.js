
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

export async function downloadGoodsReceiptPdf(accessToken, grnId) {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}procurement/goods-receipts/${grnId}/pdf/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/pdf",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message || "Unable to download GRN PDF."
    );
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = "Goods-Receipt.pdf";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (match) {
      fileName = match[1];
    }
  }
  const fileUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(fileUrl);
}