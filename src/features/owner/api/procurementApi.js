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

export const getActiveAlerts = async (accessToken, page = 1, pageSize = 5) => {
  const response = await fetch(
    `${PROCUREMENT_URL}/alerts/?page=${page}&page_size=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch active alerts."));
  }

  return data;
};

export const getRFQs = async (accessToken, page = 1, pageSize = 5) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  const response = await fetch(
    `${PROCUREMENT_URL}/rfqs/?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch RFQs."));
  }
  return data;
};

export const getRFQSummary = async (accessToken) => {
  const response = await fetch(`${PROCUREMENT_URL}/rfqs/summary/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch RFQ summary."));
  }
  return data;
};

export const getRFQDetails = async (accessToken, id) => {
  const response = await fetch(`${PROCUREMENT_URL}/rfqs/${id}/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch RFQ details."));
  }
  return data;
};

export const cancelRFQ = async (accessToken, id) => {
  const response = await fetch(`${PROCUREMENT_URL}/rfqs/${id}/cancel/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to cancel RFQ."));
  }
  return data;
};


export const refreshAlerts = async (accessToken) => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const response = await fetch(
    `${baseURL}procurement/alerts/refresh/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to refresh alerts.");
  }
  return data;
};