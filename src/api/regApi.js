const REG_API_URL = import.meta.env.VITE_REG_API_URL;

export const regUser = async (userData) => {
  const response = await fetch(REG_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};
