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
    const errorMessage =
      data.errors?.email?.[0] ||
      data.errors?.name?.[0] ||
      data.errors?.password?.[0] ||
      data.message ||
      "Registration failed";
    throw new Error(errorMessage);
  }

  return data;
};
