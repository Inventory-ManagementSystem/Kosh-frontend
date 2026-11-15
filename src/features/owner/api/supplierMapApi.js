const BASE_URL = import.meta.env.VITE_BASE_URL;

const getErrorMessage = (data, fallback) => {
  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat();
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }
  return data?.message || fallback;
};

const parseResponse = async (response, fallback) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(getErrorMessage(data, fallback));
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }
  return data.data;
};

export const getNearbySuppliers = async (
  accessToken,
  { radius = 10, category = "", source = "all" } = {},
) => {
  const params = new URLSearchParams({
    radius: String(radius),
    source,
  });
  if (category) {
    params.set("category", String(category));
  }
  const response = await fetch(
    `${BASE_URL}suppliers/nearby/?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return parseResponse(response, "Failed to fetch nearby suppliers.");
};

export const sendDirectRfq = async (accessToken, payload) => {
  const response = await fetch(`${BASE_URL}procurement/rfqs/direct/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to send RFQ.");
};
