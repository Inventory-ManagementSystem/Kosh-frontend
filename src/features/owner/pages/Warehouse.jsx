import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import { FaCirclePlus } from "react-icons/fa6";
import { useState, useEffect, useCallback } from "react";
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

const PAGE_SIZE = 10;
function Pagination({ page, totalPages, onChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-(--border-color) px-4 py-3">
      <button
        type="button"
        onClick={() => onChange(1)}
        disabled={page === 1}
        aria-label="First page"
        className="rounded-lg border border-(--border-color) p-2 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronsLeft size={16} />
      </button>

      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="rounded-lg border border-(--border-color) p-2 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronLeft size={16} />
      </button>

      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onChange(pageNumber)}
          aria-current={page === pageNumber ? "page" : undefined}
          className={`min-w-9 rounded-lg border px-3 py-2 text-sm transition ${
            page === pageNumber
              ? "border-(--accent-color) bg-(--accent-color) text-(--page-background)"
              : "border-(--border-color) text-(--text-color) hover:bg-(--input-background)"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="rounded-lg border border-(--border-color) p-2 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronRight size={16} />
      </button>

      <button
        type="button"
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
        aria-label="Last page"
        className="rounded-lg border border-(--border-color) p-2 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronsRight size={16} />
      </button>
    </div>
  );
}

const removeEmojis = (value) => {
  return value.replace(
    /[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\u20E3]/gu,
    "",
  );
};

function Warehouse() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setWarehouse(null);
      setCategories([]);
      return;
    }

    const fetchWarehouseData = async () => {
      try {
        const warehouseRes = await getWarehouse(accessToken);
        setWarehouse(warehouseRes.data);

        const categoriesRes = await getCategories(accessToken);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error("Failed to fetch warehouse details:", error);
        toast.error(error.message || "Failed to load warehouse details");
      }
    };

    fetchWarehouseData();
  }, [accessToken]);

  const fetchProducts = useCallback(async () => {
    if (!accessToken) {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const productsRes = await getProducts(
        accessToken,
        currentPage,
        PAGE_SIZE,
        search,
        selectedCategory,
      );

      const results = productsRes.data.results || [];
      const count = productsRes.data.count || 0;
      const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));

      setProducts(results);
      setTotalProducts(count);
      setTotalPages(pages);

      if (currentPage > pages) {
        setCurrentPage(pages);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error(error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [accessToken, currentPage, search, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product) => {
    try {
      setDeletingId(product.id);

      await deleteProducts(accessToken, product.id);

      toast.success("Product deleted successfully");

      const remainingProducts = totalProducts - 1;
      const updatedTotalPages = Math.max(
        1,
        Math.ceil(remainingProducts / PAGE_SIZE),
      );

      setTotalProducts(remainingProducts);
      setTotalPages(updatedTotalPages);

      if (products.length === 1 && currentPage > updatedTotalPages) {
        setCurrentPage(updatedTotalPages);
      } else {
        await fetchProducts();
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-5 text-(--accent-color)">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-['Google_Sans_Flex'] text-3xl font-semibold">
          Warehouse
        </h1>

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
              maxLength={100}
              onChange={(event) => {
                setSearch(removeEmojis(event.target.value));
                setCurrentPage(1);
              }}
              placeholder="Product name or SKU"
              className="w-full bg-transparent text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color)"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) => {
              setSelectedCategory(event.target.value);
              setCurrentPage(1);
            }}
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
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--accent-color) px-4 text-sm font-semibold text-(--page-background) transition hover:opacity-90 sm:w-50"
        >
          Add Product
          <FaCirclePlus size={16} />
        </button>
      </div>

      <section className="rounded-lg border border-(--border-color) bg-(--card-background)">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm">Inventory</h2>
          <p className="text-xs text-(--secondary-text-color)">
            {totalProducts} products
          </p>
        </div>

        {loading ? (
          <WarehouseTableSkeleton />
        ) : (
          <>
            <WarehouseTable
              items={products}
              onDelete={handleDelete}
              deletingId={deletingId}
              onEdit={(product) => navigate(`/edit-product/${product.id}`)}
            />
            {totalProducts > 0 && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={setCurrentPage}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Warehouse;
