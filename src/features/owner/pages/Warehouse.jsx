import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { FaCirclePlus } from "react-icons/fa6";
import { MdModeEditOutline } from "react-icons/md";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import Pagination from "../components/Pagination";
import {
  getWarehouse,
  getProducts,
  deleteProducts,
  updateProduct,
  editWarehouse,
} from "../api/warehouseApi";
import WarehouseTable from "../components/WarehouseTable";
import WarehouseTableSkeleton from "../components/WarehouseTableSkeleton";
import toast from "react-hot-toast";
import Dropdown from "../../../components/common/Dropdown";

const PAGE_SIZE = 10;

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
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("true");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [isEditingWarehouse, setIsEditingWarehouse] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({
    name: "",
    address: "",
  });
  const [warehouseErrors, setWarehouseErrors] = useState({});
  const [warehouseLoading, setWarehouseLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setWarehouse(null);
      return;
    }

    const fetchWarehouseData = async () => {
      try {
        const warehouseRes = await getWarehouse(accessToken);
        setWarehouse(warehouseRes.data);
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
        selectedStatus,
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
  }, [accessToken, currentPage, search, selectedStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product) => {
    try {
      setDeletingId(product.id);
      const response = await deleteProducts(accessToken, product.id);
      const archived = response.data?.archived;
      if (archived === true) {
        toast.success("Product deactivated successfully.");
      } else if (archived === false) {
        toast.success("Product deleted permanently.");
      } else {
        toast.success(response.message || "Product updated successfully.");
      }
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

  const handleReactivate = async (product) => {
    try {
      setDeletingId(product.id);
      await updateProduct(accessToken, product.id, {
        is_active: true,
      });
      toast.success("Product reactivated successfully.");
      await fetchProducts();
    } catch (error) {
      toast.error(error.message || "Failed to reactivate product.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditWarehouse = () => {
    setWarehouseForm({
      name: warehouse?.name || "",
      address: warehouse?.address || "",
    });

    setWarehouseErrors({});
    setIsEditingWarehouse(true);
  };

  const handleWarehouseChange = (e) => {
    const { name, value } = e.target;

    setWarehouseForm((prev) => ({
      ...prev,
      [name]: removeEmojis(value),
    }));

    setWarehouseErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    if (warehouseLoading) return;
    const newErrors = {};
    if (!warehouseForm.name.trim()) {
      newErrors.name = "Warehouse name is required";
    }
    if (!warehouseForm.address.trim()) {
      newErrors.address = "Address is required";
    }
    setWarehouseErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (!accessToken) {
      toast.error("Please log in again to continue.");
      return;
    }
    const updatedData = {};
    if (warehouseForm.name.trim() !== warehouse?.name) {
      updatedData.name = warehouseForm.name.trim();
    }
    if (warehouseForm.address.trim() !== warehouse?.address) {
      updatedData.address = warehouseForm.address.trim();
    }
    if (Object.keys(updatedData).length === 0) {
      setIsEditingWarehouse(false);
      return;
    }
    setWarehouseLoading(true);
    try {
      const response = await editWarehouse(accessToken, updatedData);
      setWarehouse(response.data);
      setIsEditingWarehouse(false);
      toast.success("Warehouse details updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to update warehouse.");
    } finally {
      setWarehouseLoading(false);
    }
  };
  return (
    <div className="p-5 text-(--accent-color)">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-['Google_Sans_Flex'] text-3xl font-semibold">
          Warehouse
        </h1>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <div className="text-left text-xs sm:text-right">
            <p className="text-base">{warehouse?.name}</p>
            <p>{warehouse?.address}</p>
          </div>
          <button
            type="button"
            onClick={handleEditWarehouse}
            disabled={!warehouse}
            title="Edit warehouse details"
            className="cursor-pointer rounded-md p-2 text-(--secondary-text-color) transition hover:bg-(--input-background) hover:text-(--accent-color) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdModeEditOutline size={20} />
          </button>
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

          <Dropdown
            value={selectedStatus}
            onChange={(event) => {
              setSelectedStatus(event.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "true", label: "Activated" },
              { value: "false", label: "Deactivated" },
            ]}
            className="w-full sm:max-w-52"
          />
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
              onReactivate={handleReactivate}
              deletingId={deletingId}
              onEdit={(product) => navigate(`/edit-product/${product.id}`)}
              deleteDescription="NOTE: If this product has transaction history, it will be deactivated instead of permanently deleted."
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
      {isEditingWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-(--page-background)/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-(--border-color) bg-(--sidebar-active-background) p-6">
            <h2 className="mb-5 text-lg font-semibold text-(--text-color)">
              Edit Warehouse
            </h2>
            <form onSubmit={handleSaveWarehouse}>
              <div className="mb-5">
                <label
                  htmlFor="warehouseName"
                  className="mb-2 block text-sm font-medium text-(--text-color)"
                >
                  Warehouse Name
                </label>
                <input
                  id="warehouseName"
                  name="name"
                  type="text"
                  maxLength={50}
                  value={warehouseForm.name}
                  onChange={handleWarehouseChange}
                  placeholder="Enter warehouse name"
                  className={`w-full rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color) ${
                    warehouseErrors.name
                      ? "border-(--error-color)"
                      : "border-(--border-color) focus:border-(--accent-color)"
                  }`}
                />

                {warehouseErrors.name && (
                  <p className="mt-2 text-xs text-(--error-color)">
                    {warehouseErrors.name}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="warehouseAddress"
                  className="mb-2 block text-sm font-medium text-(--text-color)"
                >
                  Address
                </label>
                <textarea
                  id="warehouseAddress"
                  name="address"
                  rows={3}
                  maxLength={250}
                  value={warehouseForm.address}
                  onChange={handleWarehouseChange}
                  placeholder="Enter warehouse address"
                  className={`w-full resize-none rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color) ${
                    warehouseErrors.address
                      ? "border-(--error-color)"
                      : "border-(--border-color) focus:border-(--accent-color)"
                  }`}
                />

                {warehouseErrors.address && (
                  <p className="mt-2 text-xs text-(--error-color)">
                    {warehouseErrors.address}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={warehouseLoading}
                  onClick={() => setIsEditingWarehouse(false)}
                  className="rounded-md border border-(--border-color) px-4 py-2 text-sm text-(--text-color) transition hover:bg-(--input-background) disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={warehouseLoading}
                  className="rounded-md bg-(--accent-color) px-4 py-2 text-sm font-semibold text-(--page-background) transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {warehouseLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Warehouse;
