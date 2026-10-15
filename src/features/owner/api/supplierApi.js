const getErrorMessage = (data, fallback) => {
  if (data.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat();
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }
  return data.message || fallback;
};

const SUPPLIERS_API_URL = import.meta.env.VITE_SUPPLIERS_API_URL;
const SUPPLIER_CATEGORIES_API_URL = import.meta.env
  .VITE_SUPPLIER_CATEGORIES_API_URL;

export const getSuppliers = async (accessToken) => {
  const response = await fetch(SUPPLIERS_API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch suppliers."));
  }
  return data;
};

export const addSuppliers = async (accessToken, formData) => {
  const response = await fetch(SUPPLIERS_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to add supplier."));
  }
  return data;
};

export const deleteSuppliers = async (accessToken, id) => {
  const response = await fetch(`${SUPPLIERS_API_URL}${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to delete supplier."));
  }
  return data;
};

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
