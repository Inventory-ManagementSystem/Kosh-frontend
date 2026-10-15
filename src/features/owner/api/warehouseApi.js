const getErrorMessage = (data, fallback) => {
  if (data.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat();
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }
  return data.message || fallback;
};

const WAREHOUSE_API_URL = import.meta.env.VITE_WAREHOUSE_API_URL;
const PRODUCTS_API_URL = import.meta.env.VITE_PRODUCTS_API_URL;
const CATEGORIES_API_URL = import.meta.env.VITE_CATEGORIES_API_URL;

export const getWarehouse = async (accessToken) => {
  const response = await fetch(WAREHOUSE_API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Failed to fetch warehouse details."),
    );
  }
  return data;
};

export const getProducts = async (accessToken) => {
  const response = await fetch(PRODUCTS_API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch products."));
  }
  return data;
};

export const addProducts = async (accessToken, formData) => {
  const response = await fetch(PRODUCTS_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to add product."));
  }
  return data;
};

export const deleteProducts = async (accessToken, id) => {
  const response = await fetch(`${PRODUCTS_API_URL}${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to delete product."));
  }
  return data;
};

export const updateWarehouse = async (accessToken, warehouseData) => {
  const response = await fetch(WAREHOUSE_API_URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warehouseData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Failed to update warehouse details."),
    );
  }
  return data;
};

export const getCategories = async (accessToken) => {
  const response = await fetch(CATEGORIES_API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch categories."));
  }
  return data;
};

export const createCategory = async (accessToken, name) => {
  const response = await fetch(import.meta.env.VITE_CATEGORIES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.errors?.name?.[0] || data.message || "Failed to create category.",
    );
  }
  return data;
};
