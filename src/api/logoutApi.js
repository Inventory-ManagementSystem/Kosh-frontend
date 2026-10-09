const LOGOUT_API_URL = import.meta.env.VITE_LOGOUT_API_URL;

export const logoutUser = async () => {
  const response = await fetch(LOGOUT_API_URL, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
};
