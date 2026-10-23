const EMPLOYEES_API_URL = import.meta.env.VITE_EMPLOYEES_API_URL;

export const getEmployees = async (accessToken) => {
  const response = await fetch(EMPLOYEES_API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch employees");
  }
  return data;
};
