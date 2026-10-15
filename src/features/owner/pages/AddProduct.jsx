import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addProducts,
  getCategories,
  createCategory,
} from "../api/warehouseApi";
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
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories(accessToken);
        setCategories(response.data || []);
      } catch (error) {
        toast.error("Failed to load categories.");
        console.error("Failed to load categories:", error);
      }
    };

    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();

    if (!name) {
      toast.error("Enter a category name.");
      return;
    }

    const duplicate = categories.some(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      toast.error("This category already exists.");
      return;
    }

    setCategoryLoading(true);

    try {
      const response = await createCategory(accessToken, name);
      const category = response.data;

      setCategories((previous) => [...previous, category]);

      setFormData((previous) => ({
        ...previous,
        category: category.id,
      }));

      setNewCategory("");
      setShowAddCategory(false);

      toast.success("Category added successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to create category.");
      console.error("Failed to create category:", error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const isFormFilled =
    formData.name.trim() !== "" &&
    formData.sku.trim() !== "" &&
    formData.selling_price !== "" &&
    formData.cost_price !== "" &&
    formData.opening_stock !== "" &&
    formData.low_stock_alert_at !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormFilled || loading) return;

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
      console.error("Failed to add product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWheel = (e) => {
    e.currentTarget.blur();
  };

  const inputClass =
    "mt-2 h-9 w-full rounded border border-(--border-color) bg-transparent px-3 text-xs text-(--text-color) outline-none focus:border-(--accent-color)";

  const labelClass = "text-[10px] font-medium uppercase text-(--text-color)";

  return (
    <div className="min-h-full p-4 text-(--text-color) sm:p-6">
      <h1 className="text-3xl font-semibold">Add Product</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-5 rounded-xl bg-(--card-background) p-5 sm:p-6"
      >
        <h2 className="mb-7 text-sm font-medium text-(--accent-color)">
          Enter product details
        </h2>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Product Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className={labelClass}>SKU</label>
            <input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter SKU"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={(e) => {
                if (e.target.value === "add_new") {
                  setShowAddCategory(true);
                  return;
                }
                setShowAddCategory(false);
                setFormData((previous) => ({
                  ...previous,
                  category: e.target.value,
                }));
              }}
              className={inputClass}
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}

              <option value="add_new">+ Add Category</option>
            </select>

            {showAddCategory && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={inputClass}
                  placeholder="Enter category name"
                  disabled={categoryLoading}
                />

                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={categoryLoading}
                  className="mt-2 shrink-0 rounded border border-(--border-color) px-3 py-2 text-xs transition hover:border-(--accent-color) disabled:opacity-50"
                >
                  {categoryLoading ? "Adding..." : "Add"}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Product Image</label>

            <label
              htmlFor="product-image"
              className="mt-2 flex h-24 cursor-pointer flex-col items-center justify-center rounded border border-(--border-color) transition hover:border-(--accent-color)"
            >
              <FaCloudUploadAlt size={26} className="text-(--accent-color)" />

              <span className="mt-1 text-xs text-(--secondary-text-color)">
                {formData.image ? formData.image.name : "Click to upload image"}
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
          </div>

          <div>
            <label className={labelClass}>Selling Price</label>
            <input
              type="number"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Cost Price</label>
            <input
              type="number"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Opening Stock</label>
            <input
              type="number"
              name="opening_stock"
              value={formData.opening_stock}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="1"
              className={inputClass}
              placeholder="Enter opening stock"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Low Stock Alert At</label>
            <input
              type="number"
              name="low_stock_alert_at"
              value={formData.low_stock_alert_at}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="1"
              className={inputClass}
              placeholder="Enter stock threshold"
              required
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <BackButton onClick={() => navigate(-1)} />

          <NavigationButton
            type="submit"
            isFormFilled={isFormFilled && !loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </NavigationButton>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
