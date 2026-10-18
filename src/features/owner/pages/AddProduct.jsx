import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProducts, getCategories } from "../api/warehouseApi";
import toast from "react-hot-toast";
import { FaCloudUploadAlt } from "react-icons/fa";
import BackButton from "../../../components/auth/BackButton";
import { useAuth } from "../../../context/AuthContext";
import NavigationButton from "../../../components/auth/NavigationButton";

function AddProduct() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    image: null,
    selling_price: "",
    cost_price: "",
    opening_stock: "",
    low_stock_alert_at: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories(accessToken);
        setCategories(response.data || []);
      } catch (error) {
        toast.error(error.message || "Failed to load categories.");
      }
    };

    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken]);

  const validateField = (name, value) => {
    if (name === "name" && !value.trim()) {
      return "Product name is required.";
    }

    if (name === "sku" && !value.trim()) {
      return "SKU is required.";
    }

    if (name === "selling_price" || name === "cost_price") {
      if (value === "") return "This field is required.";
      if (!Number.isFinite(Number(value)) || Number(value) < 0) {
        return "Value cannot be negative.";
      }
    }

    if (name === "opening_stock" || name === "low_stock_alert_at") {
      if (value === "") return "This field is required.";
      if (!Number.isInteger(Number(value)) || Number(value) < 0) {
        return "Enter a non-negative whole number.";
      }
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const image = files?.[0];

      if (image && !image.type.startsWith("image/")) {
        setErrors((previous) => ({
          ...previous,
          image: "Please select a valid image.",
        }));
        e.target.value = "";
        return;
      }

      setFormData((previous) => ({
        ...previous,
        image: image || null,
      }));

      setErrors((previous) => ({
        ...previous,
        image: "",
      }));

      return;
    }

    if (
      ["selling_price", "cost_price", "opening_stock", "low_stock_alert_at"].includes(name) &&
      value !== "" &&
      Number(value) < 0
    ) {
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

  const isFormFilled =
    formData.name.trim() !== "" &&
    formData.sku.trim() !== "" &&
    formData.selling_price !== "" &&
    formData.cost_price !== "" &&
    formData.opening_stock !== "" &&
    formData.low_stock_alert_at !== "" &&
    Object.values(errors).every((error) => !error);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const newErrors = {};

    Object.entries(formData).forEach(([name, value]) => {
      if (name !== "category" && name !== "image") {
        newErrors[name] = validateField(name, value);
      }
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);

    const productData = new FormData();

    productData.append("name", formData.name.trim());
    productData.append("sku", formData.sku.trim().toUpperCase());
    productData.append("price", String(Number(formData.selling_price)));
    productData.append("cost_price", String(Number(formData.cost_price)));
    productData.append(
      "opening_quantity",
      String(Number(formData.opening_stock)),
    );
    productData.append(
      "low_stock_threshold",
      String(Number(formData.low_stock_alert_at)),
    );

    if (formData.category !== "") {
      productData.append("category", formData.category);
    }

    if (formData.image) {
      productData.append("image", formData.image);
    }

    try {
      await addProducts(accessToken, productData);

      toast.success("Product added successfully!");
      navigate("/warehouse");
    } catch (error) {
      toast.error(error.message || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  const handleWheel = (e) => {
    e.currentTarget.blur();
  };

  const inputClass =
    "mt-2 h-9 w-full rounded border border-(--border-color) bg-(--dropdown-background) px-3 text-xs text-(--text-color) outline-none focus:border-(--accent-color)";

  const labelClass =
    "text-[10px] font-medium uppercase text-(--text-color)";

  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <div className="min-h-full p-4 text-(--text-color) sm:p-6">
      <h1 className="text-3xl font-semibold">Add Product</h1>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-5 rounded-xl bg-(--card-background) p-5 sm:p-6"
      >
        <h2 className="mb-7 text-sm font-medium text-(--accent-color)">
          Enter product details
        </h2>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <div>
            <label htmlFor="product-name" className={labelClass}>
              Product Name
            </label>
            <input
              id="product-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter product name"
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="product-sku" className={labelClass}>
              SKU
            </label>
            <input
              id="product-sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter SKU"
            />
            {errors.sku && <p className={errorClass}>{errors.sku}</p>}
          </div>

          <div>
            <label htmlFor="product-category" className={labelClass}>
              Category
            </label>
            <select
              id="product-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-image" className={labelClass}>
              Product Image
            </label>
            <label
              htmlFor="product-image"
              className="mt-2 flex h-9 cursor-pointer items-center gap-2 rounded border border-(--border-color) px-3 transition hover:border-(--accent-color)"
            >
              <FaCloudUploadAlt
                size={20}
                className="shrink-0 text-(--accent-color)"
              />
              <span className="min-w-0 truncate text-xs text-(--secondary-text-color)">
                {formData.image
                  ? formData.image.name
                  : "Click to upload image"}
              </span>
              <input
                id="product-image"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {errors.image && <p className={errorClass}>{errors.image}</p>}
          </div>

          <div>
            <label htmlFor="selling-price" className={labelClass}>
              Selling Price
            </label>
            <input
              id="selling-price"
              type="number"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
            />
            {errors.selling_price && (
              <p className={errorClass}>{errors.selling_price}</p>
            )}
          </div>

          <div>
            <label htmlFor="cost-price" className={labelClass}>
              Cost Price
            </label>
            <input
              id="cost-price"
              type="number"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
            />
            {errors.cost_price && (
              <p className={errorClass}>{errors.cost_price}</p>
            )}
          </div>

          <div>
            <label htmlFor="opening-stock" className={labelClass}>
              Opening Stock
            </label>
            <input
              id="opening-stock"
              type="number"
              name="opening_stock"
              value={formData.opening_stock}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="1"
              className={inputClass}
              placeholder="Enter opening stock"
            />
            {errors.opening_stock && (
              <p className={errorClass}>{errors.opening_stock}</p>
            )}
          </div>

          <div>
            <label htmlFor="low-stock-alert" className={labelClass}>
              Low Stock Alert At
            </label>
            <input
              id="low-stock-alert"
              type="number"
              name="low_stock_alert_at"
              value={formData.low_stock_alert_at}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="1"
              className={inputClass}
              placeholder="Enter stock threshold"
            />
            {errors.low_stock_alert_at && (
              <p className={errorClass}>{errors.low_stock_alert_at}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <BackButton onClick={() => navigate(-1)} />
          <NavigationButton
            type="submit"
            isFormFilled={isFormFilled && !loading}
          >
            Add Product
          </NavigationButton>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
