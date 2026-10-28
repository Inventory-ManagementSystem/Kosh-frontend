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
const OUTLETS_API_URL = `${import.meta.env.VITE_BASE_URL}inventory/outlets/`;
const DISPATCHES_API_URL = `${import.meta.env.VITE_BASE_URL}inventory/dispatches/`;
const SUPPLIER_CATEGORIES_API_URL = import.meta.env
  .VITE_SUPPLIER_CATEGORIES_API_URL;

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

export const getProducts = async (
  accessToken,
  page = 1,
  pageSize = 10,
  search = "",
  isActive = "true",
) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search.trim()) {
    params.append("search", search.trim());
  }
  if (isActive !== "all") {
    params.append("is_active", String(isActive));
  }
  const response = await fetch(`${PRODUCTS_API_URL}?${params.toString()}`, {
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

export const getProductById = async (accessToken, productId) => {
  const response = await fetch(`${PRODUCTS_API_URL}${productId}/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch product details."));
  }
  return data;
};

export const updateProduct = async (accessToken, productId, productData) => {
  const isFormData = productData instanceof FormData;
  const response = await fetch(`${PRODUCTS_API_URL}${productId}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? productData : JSON.stringify(productData),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(getErrorMessage(data, "Failed to update product."));
    error.data = data;
    throw error;
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
  const response = await fetch(SUPPLIER_CATEGORIES_API_URL, {
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

export const getOutlets = async (accessToken) => {
  const response = await fetch(`${OUTLETS_API_URL}?is_active=true`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to load outlets.");
  }

  return data;
};

export const createOutlet = async (accessToken, outletData) => {
  const response = await fetch(OUTLETS_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(outletData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        Object.values(data.errors || {})
          .flat()
          .join(" ") ||
        "Failed to create outlet.",
    );
  }

  return data;
};

export const createDispatch = async (accessToken, dispatchData) => {
  const response = await fetch(DISPATCHES_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dispatchData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        Object.values(data.errors || {})
          .flat()
          .join(" ") ||
        "Failed to dispatch stock.",
    );
  }

  return data;
};
