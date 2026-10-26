import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import toast from "react-hot-toast";

import {
  getProductById,
  getCategories,
  updateProduct,
} from "../api/warehouseApi";

import BackButton from "../../../components/auth/BackButton";
import NavigationButton from "../../../components/auth/NavigationButton";
import { useAuth } from "../../../context/AuthContext";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { accessToken } = useAuth();

  const [product, setProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    supply_category: "",
    image: null,
    price: "",
    cost_price: "",
    low_stock_threshold: "",
    safety_stock: "",
    opening_quantity: "",
    is_active: true,
  });

  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!accessToken || !id) return;

    const fetchProductData = async () => {
      try {
        setLoading(true);

        const productResponse = await getProductById(accessToken, id);
        const productData = productResponse.data ?? productResponse;
        setProduct(productData);
        setFormData({
          name: productData.name || "",
          sku: productData.sku || "",
          description: productData.description || "",
          supply_category:
            productData.supply_category != null
              ? String(
                  typeof productData.supply_category === "object"
                    ? productData.supply_category.id
                    : productData.supply_category,
                )
              : "",
          image: null,
          price: productData.price ?? "",
          cost_price: productData.cost_price ?? "",
          low_stock_threshold: String(productData.low_stock_threshold ?? 0),
          opening_quantity: String(productData.opening_quantity ?? 0),
          is_active: productData.is_active ?? true,
        });

        setImagePreview(productData.image || "");

        const categoriesResponse = await getCategories(accessToken);

        const categoryList =
          categoriesResponse.data?.results ??
          categoriesResponse.data ??
          categoriesResponse.results ??
          [];

        setCategories(Array.isArray(categoryList) ? categoryList : []);
      } catch (error) {
        console.error("Failed to load product details:", error);
        toast.error(error.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [accessToken, id]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validateField = (name, value) => {
    if (name === "name" && !value.trim()) {
      return "Product name is required.";
    }

    if (name === "sku" && !value.trim()) {
      return "SKU is required.";
    }

    if (name === "price" || name === "cost_price") {
      if (value === "") {
        return "This field is required.";
      }

      if (!Number.isFinite(Number(value)) || Number(value) < 0) {
        return "Enter a valid non-negative amount.";
      }
    }

    if (["low_stock_threshold", "reorder_quantity"].includes(name)) {
      if (value === "") {
        return "This field is required.";
      }

      if (!Number.isInteger(Number(value)) || Number(value) < 0) {
        return "Enter a non-negative whole number.";
      }
    }

    return "";
  };

  const handleChange = (event) => {
    const { name, value, files, checked, type } = event.target;

    if (name === "image") {
      const image = files?.[0];

      if (image && !image.type.startsWith("image/")) {
        setErrors((previous) => ({
          ...previous,
          image: "Please select a valid image.",
        }));

        event.target.value = "";
        return;
      }

      setFormData((previous) => ({
        ...previous,
        image: image || null,
      }));

      if (image) {
        setImagePreview(URL.createObjectURL(image));
      }

      setErrors((previous) => ({
        ...previous,
        image: "",
      }));

      return;
    }

    if (type === "checkbox") {
      setFormData((previous) => ({
        ...previous,
        [name]: checked,
      }));

      return;
    }

    const numericFields = ["price", "cost_price", "low_stock_threshold"];

    if (numericFields.includes(name) && value !== "" && Number(value) < 0) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: validateField(name, value),
    }));
  };

  const handleWheel = (event) => {
    event.currentTarget.blur();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || saving || !product) return;

    const newErrors = {};

    ["name", "sku", "price", "cost_price", "low_stock_threshold"].forEach(
      (name) => {
        newErrors[name] = validateField(name, formData[name]);
      },
    );

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    setSaving(true);

    const editableFields = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      price: String(Number(formData.price)),
      cost_price: String(Number(formData.cost_price)),
      low_stock_threshold: Number(formData.low_stock_threshold),
      is_active: formData.is_active,
    };

    if (formData.supply_category !== "") {
      editableFields.supply_category = Number(formData.supply_category);
    }

    try {
      let productData = editableFields;

      if (formData.image) {
        productData = new FormData();

        Object.entries(editableFields).forEach(([name, value]) => {
          productData.append(name, String(value));
        });

        productData.append("image", formData.image);
      }

      await updateProduct(accessToken, id, productData);

      toast.success("Product updated successfully!");
      navigate("/warehouse");
    } catch (error) {
      console.error("Failed to update product:", error);

      const responseErrors = error.data?.errors;

      if (responseErrors && typeof responseErrors === "object") {
        const fieldErrors = {};

        Object.entries(responseErrors).forEach(([name, messages]) => {
          fieldErrors[name] = Array.isArray(messages)
            ? messages.join(" ")
            : String(messages);
        });

        setErrors((previous) => ({
          ...previous,
          ...fieldErrors,
        }));
      }

      toast.error(error.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-2 h-9 w-full rounded border border-(--border-color) bg-(--dropdown-background) px-3 text-xs text-(--text-color) outline-none focus:border-(--accent-color) disabled:cursor-not-allowed disabled:opacity-60";

  const labelClass = "text-[10px] font-medium uppercase text-(--text-color)";

  const errorClass = "mt-1 text-xs text-red-500";

  const requiredFields = [
    "name",
    "sku",
    "price",
    "cost_price",
    "low_stock_threshold",
    "opening_stock",
  ];

  const isFormFilled =
    requiredFields.every(
      (name) => formData[name] !== "" && !validateField(name, formData[name]),
    ) && Object.values(errors).every((error) => !error);

  if (loading) {
    return (
      <div className="p-6 text-sm text-(--secondary-text-color)">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-(--text-color)">
        <p className="text-sm">Product details could not be loaded.</p>

        <div className="mt-4">
          <BackButton onClick={() => navigate("/warehouse")} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 text-(--text-color) sm:p-6">
      <h1 className="text-3xl font-semibold">Edit Product</h1>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-5 rounded-xl bg-(--card-background) p-5 sm:p-6"
      >
        <h2 className="mb-7 text-sm font-medium text-(--accent-color)">
          Update product details
        </h2>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-name" className={labelClass}>
              Product Name
            </label>
            <input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter product name"
              maxLength={100}
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="edit-sku" className={labelClass}>
              SKU
            </label>
            <input
              id="edit-sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter SKU"
              maxLength={100}
            />
            {errors.sku && <p className={errorClass}>{errors.sku}</p>}
          </div>

          <div>
            <label htmlFor="edit-supply-category" className={labelClass}>
              Supply Category
            </label>
            <select
              id="edit-supply-category"
              name="supply_category"
              value={formData.supply_category}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select supply category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.supply_category && (
              <p className={errorClass}>{errors.supply_category}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-image" className={labelClass}>
              Product Image
            </label>
            <label
              htmlFor="edit-image"
              className="mt-2 flex h-9 cursor-pointer items-center gap-2 rounded border border-(--border-color) px-3 transition hover:border-(--accent-color)"
            >
              <FaCloudUploadAlt
                size={20}
                className="shrink-0 text-(--accent-color)"
              />
              <span className="min-w-0 truncate text-xs text-(--secondary-text-color)">
                {formData.image
                  ? formData.image.name
                  : "Click to replace image"}
              </span>
              <input
                id="edit-image"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {errors.image && <p className={errorClass}>{errors.image}</p>}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Product preview"
                className="mt-3 h-24 w-24 rounded-lg border border-(--border-color) object-cover"
              />
            )}
          </div>

          <div>
            <label htmlFor="edit-price" className={labelClass}>
              Selling Price
            </label>
            <input
              id="edit-price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="1"
              className={inputClass}
              placeholder="0.00"
            />
            {errors.price && <p className={errorClass}>{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="edit-cost-price" className={labelClass}>
              Cost Price
            </label>
            <input
              id="edit-cost-price"
              type="number"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="1"
              className={inputClass}
              placeholder="0.00"
            />
            {errors.cost_price && (
              <p className={errorClass}>{errors.cost_price}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-is-active" className={labelClass}>
              Product Status
            </label>

            <select
              id="edit-is-active"
              name="is_active"
              value={String(formData.is_active)}
              onChange={(event) => {
                setFormData((previous) => ({
                  ...previous,
                  is_active: event.target.value === "true",
                }));
              }}
              className={inputClass}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-low-stock" className={labelClass}>
              Low Stock Alert At
            </label>
            <input
              id="edit-low-stock"
              type="number"
              name="low_stock_threshold"
              value={formData.low_stock_threshold}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="1"
              className={inputClass}
            />
            {errors.low_stock_threshold && (
              <p className={errorClass}>{errors.low_stock_threshold}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <BackButton onClick={() => navigate(-1)} />

          <NavigationButton
            type="submit"
            isFormFilled={isFormFilled && !saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </NavigationButton>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;
