const BASE_URL = import.meta.env.VITE_BASE_URL;

export const selectRole = async (role, accessToken) => {
  const response = await fetch(`${BASE_URL}accounts/select-role/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify({
      selected_role: role === "business_owner" ? "owner" : role,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || "Failed to save role");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
};
