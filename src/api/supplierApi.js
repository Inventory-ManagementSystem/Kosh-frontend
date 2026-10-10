const SUPPLIER_CATEGORIES_API_URL = import.meta.env
  .VITE_SUPPLIER_CATEGORIES_API_URL;
const SUPPLIER_REGISTER_API_URL = import.meta.env
  .VITE_SUPPLIER_REGISTER_API_URL;

export const getSupplierCategories = async (accessToken) => {
  const response = await fetch(SUPPLIER_CATEGORIES_API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch supplier categories");
  }
  return data;
};

export const registerSupplier = async (supplierData, accessToken) => {
  const response = await fetch(SUPPLIER_REGISTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify(supplierData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Supplier registration failed");
  }
  return data;
};
