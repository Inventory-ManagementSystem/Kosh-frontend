const BASE_URL = import.meta.env.VITE_BASE_URL;

export const sendContactMessage = async ({ email, message, website = "" }) => {
  const response = await fetch(`${BASE_URL}contact/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, message, website }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Failed to send your message");
    error.status = response.status;
    error.fieldErrors = data.errors || null;
    throw error;
  }
  return data;
};
