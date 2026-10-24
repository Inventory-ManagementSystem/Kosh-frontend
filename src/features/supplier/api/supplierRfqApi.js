const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getSupplierRFQs = async (accessToken, page = 1, pageSize = 5) => {
  const response = await fetch(
    `${BASE_URL}procurement/supplier/rfqs/?page=${page}&page_size=${pageSize}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Failed to fetch supplier RFQs.");
  }
  return data.data;
};

export const getSupplierRFQDetails = async (accessToken, invitationId) => {
  const response = await fetch(
    `${BASE_URL}procurement/supplier/rfqs/${invitationId}/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Failed to fetch RFQ details.");
  }
  return data.data;
};

export const declineSupplierRFQ = async (accessToken, invitationId) => {
  const response = await fetch(
    `${BASE_URL}procurement/supplier/rfqs/${invitationId}/decline/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    },
  );
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Failed to decline RFQ.");
  }
  return data;
};

export const getSupplierQuotation = async (accessToken, invitationId) => {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}procurement/supplier/rfqs/${invitationId}/quotation/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(data.message || "Failed to fetch quotation.");
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }
  return data.data;
};

export const saveSupplierQuotation = async (
  accessToken,
  invitationId,
  quotation,
) => {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}procurement/supplier/rfqs/${invitationId}/quotation/`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(quotation),
    },
  );
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(data.message || "Failed to save quotation.");
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }
  return data.data;
};
