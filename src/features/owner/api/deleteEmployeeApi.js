export async function deleteEmployee(employeeId, accessToken) {
  const response = await fetch(
    `${import.meta.env.VITE_EMPLOYEES_API_URL}${employeeId}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    },
  );
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to remove employee");
  }
  return result;
}
