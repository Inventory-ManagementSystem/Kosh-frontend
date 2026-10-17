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
    const error = new Error(
      response.status === 429
        ? "Too many registration attempts. Please try again later."
        : data.errors?.email?.[0] ||
            data.errors?.name?.[0] ||
            data.errors?.password?.[0] ||
            data.message ||
            "Registration failed",
    );
    error.status = response.status;
    throw error;
  }
  return data;
};
