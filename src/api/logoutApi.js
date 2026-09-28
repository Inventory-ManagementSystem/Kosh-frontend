const LOGOUT_API_URL = import.meta.env.VITE_LOGOUT_API_URL;

export const logoutUser = async (refreshToken) => {
  const response = await fetch(LOGOUT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
};
