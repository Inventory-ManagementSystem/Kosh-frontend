const LOGIN_API_URL = import.meta.env.VITE_LOGIN_API_URL;

export const loginUser = async (credentials) => {
  const response = await fetch(LOGIN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Invalid email or password");
  }

  return data;
};
