const ADD_EMPLOYEE_API_URL = import.meta.env.VITE_ADD_EMPLOYEE_API_URL;

export const addEmployee = async (employeeData, accessToken) => {
  const response = await fetch(ADD_EMPLOYEE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(employeeData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create employee invite");
  }
  return data;
};
