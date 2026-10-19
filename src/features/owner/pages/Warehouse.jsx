import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { FaCirclePlus } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getWarehouse,
  getProducts,
  getCategories,
  deleteProducts,
} from "../api/warehouseApi";
import WarehouseTable from "../components/WarehouseTable";
import WarehouseTableSkeleton from "../components/WarehouseTableSkeleton";
import toast from "react-hot-toast";

function Warehouse() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  
const [deletingId, setDeletingId] = useState(null);


  useEffect(() => {
    const fetchWarehouseData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const warehouseRes = await getWarehouse(accessToken);
        setWarehouse(warehouseRes.data);

        const productsRes = await getProducts(accessToken);
        setProducts(productsRes.data.results || []);

        const categoriesRes = await getCategories(accessToken);
        setCategories(categoriesRes.data|| []);
      } catch (error) {
        console.error("Failed to fetch warehouse inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, [accessToken]);

  const filteredProducts = products.filter((product) => {
    const searchValue = search.trim().toLowerCase();
    const productName = String(product.name || "").toLowerCase();
    const productSku = String(product.sku || "").toLowerCase();
    const matchesSearch =
      productName.includes(searchValue) || productSku.includes(searchValue);

    const categoryId = product.category ?? product.supply_category;
    const matchesCategory =selectedCategory === "all" || String(categoryId) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  
const handleDelete = async (product) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${product.name}"?`
  );

  if (!confirmed) return;

  try {
    setDeletingId(product.id);
    await deleteProducts(accessToken, product.id);
    setProducts((prevProducts) =>
      prevProducts.filter((item) => item.id !== product.id)
    );
    toast.success("Product deleted successfully");
  } catch (error) {
    console.error("Failed to delete product:", error);
    toast.error(
      error.response?.data?.message || "Failed to delete product"
    );
  } finally {
    setDeletingId(null);
  }
};


  return (
    <div className="p-5 text-(--accent-color)">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-['Google_Sans_Flex'] text-3xl font-semibold">Warehouse</h1>

        <div className="text-left text-xs sm:text-right">
          <p className="text-base">{warehouse?.name}</p>
          <p>{warehouse?.address}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <div className="flex h-10 w-full items-center gap-2 rounded-xl bg-(--input-background) px-3 sm:max-w-80">
            <FiSearch size={16} className="shrink-0 text-(--text-color)" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Product name or SKU"
              className="w-full bg-transparent text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color)"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="h-10 w-full rounded-xl border border-(--border-color) bg-(--dropdown-background) px-3 text-sm text-(--text-color) outline-none sm:max-w-52"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => navigate("/add-products")}
          className="flex h-10 w-50 items-center justify-center gap-2 rounded-xl bg-(--accent-color) px-4 text-sm font-semibold text-[#00010f] transition hover:opacity-90"
        >
          Add Product
          <FaCirclePlus size={16} />
        </button>
      </div>

      <section className="rounded-lg border border-(--border-color) bg-(--card-background)">
        <h2 className="p-4 text-sm">Inventory</h2>

        {loading ? (
          <WarehouseTableSkeleton />
        ) : (
          <WarehouseTable items={filteredProducts}  onDelete={handleDelete} deletingId={deletingId}/>
        )}
      </section>
    </div>
  );
}


export default Warehouse;
