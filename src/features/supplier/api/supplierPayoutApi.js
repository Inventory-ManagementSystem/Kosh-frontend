const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getPayoutDetails = async (accessToken) => {
  const response = await fetch(`${BASE_URL}suppliers/payout-account/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(data.message || "Failed to fetch payout details.");
    error.errors = data.errors;
    throw error;
  }
  return data.data;
};

export const savePayoutDetails = async (accessToken, payoutDetails) => {
  const response = await fetch(`${BASE_URL}suppliers/payout-account/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payoutDetails),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(data.message || "Failed to save payout details.");
    error.errors = data.errors;
    throw error;
  }
  return data.data;
};
