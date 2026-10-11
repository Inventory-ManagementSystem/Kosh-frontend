import { apiFetch } from "../../../api/apiFetch";
const EMPLOYEES_API_URL = import.meta.env.VITE_EMPLOYEES_API_URL;

export const getEmployees = async () => {
  const response = await apiFetch(EMPLOYEES_API_URL);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch employees");
  }
  return data;
};
