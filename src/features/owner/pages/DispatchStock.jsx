import { useEffect, useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { FaCirclePlus } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import {
  getProducts,
  getCategories,
  getOutlets,
  createOutlet,
  createDispatch,
} from "../api/warehouseApi";

import WarehouseTable from "../components/WarehouseTable";
import WarehouseTableSkeleton from "../components/WarehouseTableSkeleton";
import Pagination from "../components/Pagination";

const removeEmojis = (value) => {
  return value.replace(
    /[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\u20E3]/gu,
    "",
  );
};

function DispatchStock() {
  const { accessToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showDispatchPopup, setShowDispatchPopup] = useState(false);
  const [showOutletPopup, setShowOutletPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [dispatchQuantity, setDispatchQuantity] = useState("");
  const [outletName, setOutletName] = useState("");
  const [outletAddress, setOutletAddress] = useState("");
  const [dispatching, setDispatching] = useState(false);
  const [creatingOutlet, setCreatingOutlet] = useState(false);
  const [outletNameError, setOutletNameError] = useState("");
  const [outletAddressError, setOutletAddressError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const inputClass =
    "h-11 w-full rounded-md border border-(--icon-border-color) bg-(--dropdown-background) px-3 text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color) focus:border-(--accent-color)";

  const closeButtonClass =
    "absolute right-3 top-3 rounded-md p-1 text-(--text-color) transition hover:bg-(--input-background)";

  const fetchProducts = async () => {
    const response = await getProducts(accessToken);
    setProducts(response.data.results || []);
  };

  const fetchOutlets = async () => {
    const response = await getOutlets(accessToken);
    setOutlets(response.data || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const productsResponse = await getProducts(accessToken);
        setProducts(productsResponse.data.results || []);
        const categoriesResponse = await getCategories(accessToken);
        setCategories(categoriesResponse.data || []);
        const outletsResponse = await getOutlets(accessToken);
        setOutlets(outletsResponse.data || []);
      } catch (error) {
        console.error("Failed to load dispatch data:", error);
        toast.error(error.message || "Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken]);

  const filteredProducts = products.filter((product) => {
    const searchValue = search.trim().toLowerCase();
    const productName = String(product.name || "").toLowerCase();
    const productSku = String(product.sku || "").toLowerCase();
    const matchesSearch =
      productName.includes(searchValue) || productSku.includes(searchValue);
    const categoryId =
      typeof product.category === "object"
        ? product.category?.id
        : product.category;
    const matchesCategory =
      selectedCategory === "all" || String(categoryId) === selectedCategory;
    const matchesStockStatus =
      product.status === "In Stock" || product.status === "Low Stock";
    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const handleDispatch = (product) => {
    setSelectedProduct(product);
    setSelectedOutlet("");
    setDispatchQuantity("");
    setQuantityError("");
    setShowDispatchPopup(true);
  };

  const closeDispatchPopup = () => {
    if (dispatching) return;
    setShowDispatchPopup(false);
    setSelectedProduct(null);
    setSelectedOutlet("");
    setDispatchQuantity("");
    setQuantityError("");
  };

  const handleDispatchSubmit = async (event) => {
    event.preventDefault();
    const quantityValue = dispatchQuantity.trim();
    const quantity = Number(quantityValue);
    const availableQuantity = Number(selectedProduct?.quantity ?? 0);
    if (!selectedProduct || !selectedOutlet || !quantityValue) {
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setQuantityError("Enter a valid whole number greater than zero.");
      return;
    }
    if (quantity > availableQuantity) {
      setQuantityError("Quantity exceeds available stock.");
      return;
    }
    try {
      setDispatching(true);
      const response = await createDispatch(accessToken, {
        outlet: selectedOutlet,
        items: [
          {
            product: selectedProduct.id,
            quantity,
          },
        ],
      });
      toast.success(
        response.message ||
          `Dispatch ${response.data?.number || ""} recorded successfully.`,
      );
      setShowDispatchPopup(false);
      setSelectedProduct(null);
      setSelectedOutlet("");
      setDispatchQuantity("");
      setQuantityError("");
      await fetchProducts();
    } catch (error) {
      console.error("Failed to dispatch stock:", error);
      toast.error(error.message || "Failed to dispatch stock.");
    } finally {
      setDispatching(false);
    }
  };

  const handleOutletSubmit = async (event) => {
    event.preventDefault();
    const name = outletName.trim();
    const address = outletAddress.trim();
    if (!name || !address || outletNameError || outletAddressError) {
      return;
    }
    try {
      setCreatingOutlet(true);
      const response = await createOutlet(accessToken, {
        name,
        address,
      });
      const newOutlet = response.data;
      if (newOutlet?.is_active) {
        setOutlets((previousOutlets) => [
          ...previousOutlets.filter((outlet) => outlet.id !== newOutlet.id),
          newOutlet,
        ]);
        setSelectedOutlet(String(newOutlet.id));
      }
      toast.success(response.message || "Outlet created successfully.");
      setShowOutletPopup(false);
      setOutletName("");
      setOutletAddress("");
      setOutletNameError("");
      setOutletAddressError("");
    } catch (error) {
      console.error("Failed to create outlet:", error);
      toast.error(error.message || "Failed to create outlet.");
    } finally {
      setCreatingOutlet(false);
    }
  };

  return (
    <div className="p-5 text-(--accent-color)">
      <h1 className="mb-5 font-['Google_Sans_Flex'] text-3xl font-semibold">
        Dispatch Stock
      </h1>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <div className="flex h-10 w-full items-center gap-2 rounded-xl bg-(--input-background) px-3 sm:max-w-80">
            <FiSearch size={16} className="shrink-0 text-(--text-color)" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(removeEmojis(event.target.value))}
              placeholder="Product name or SKU"
              className="w-full bg-transparent text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color)"
            />
          </div>
          <div className="relative w-full sm:max-w-52">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-(--border-color) bg-(--dropdown-background) px-3 pr-9 text-sm text-(--text-color) outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <FiChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--secondary-text-color)"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setOutletName("");
            setOutletAddress("");
            setOutletNameError("");
            setOutletAddressError("");
            setShowOutletPopup(true);
          }}
          className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-(--accent-color) px-4 text-sm font-semibold text-(--page-background) transition hover:opacity-90 sm:w-50"
        >
          Add Outlet
          <FaCirclePlus size={16} />
        </button>
      </div>

      <section className="rounded-lg border border-(--border-color) bg-(--card-background)">
        <h2 className="p-4 text-sm">Inventory</h2>

        {loading ? (
          <WarehouseTableSkeleton />
        ) : (
          <WarehouseTable
            items={paginatedProducts}
            variant="dispatch"
            showDelete={false}
            onDispatch={handleDispatch}
          />
        )}
        {totalPages > 1 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        )}
      </section>

      {showDispatchPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-(--page-background)/70 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDispatchPopup();
            }
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-(--icon-border-color) bg-(--card-background) px-6 pb-9 pt-12 shadow-2xl">
            <button
              type="button"
              onClick={closeDispatchPopup}
              disabled={dispatching}
              className={closeButtonClass}
            >
              <RxCross2 size={20} />
            </button>

            <h2 className="mb-5 text-center text-lg font-semibold text-(--text-color)">
              Dispatch Stock
            </h2>

            <form
              onSubmit={handleDispatchSubmit}
              className="mx-auto max-w-xs space-y-5"
              noValidate
            >
              <div className="relative">
                <select
                  value={selectedOutlet}
                  onChange={(event) => setSelectedOutlet(event.target.value)}
                  className="h-10 w-full appearance-none rounded-md border border-(--icon-border-color) bg-(--dropdown-background) px-3 pr-9 text-sm text-(--text-color) outline-none focus:border-(--accent-color)"
                >
                  <option value="">Select Outlet</option>

                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>

                <FiChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--secondary-text-color)"
                />
              </div>

              {outlets.length === 0 && (
                <p className="text-xs text-(--secondary-text-color)">
                  No active outlets found. Create an outlet first.
                </p>
              )}

              <div>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.quantity ?? undefined}
                  step="1"
                  value={dispatchQuantity}
                  onWheel={(event) => event.currentTarget.blur()}
                  onChange={(event) => {
                    const value = event.target.value;
                    setDispatchQuantity(value);

                    if (!value.trim()) {
                      setQuantityError("Quantity is required.");
                    } else if (
                      !Number.isInteger(Number(value)) ||
                      Number(value) < 1
                    ) {
                      setQuantityError("Enter a number greater than zero.");
                    } else if (
                      Number(value) > Number(selectedProduct?.quantity ?? 0)
                    ) {
                      setQuantityError("Quantity exceeds available stock.");
                    } else {
                      setQuantityError("");
                    }
                  }}
                  placeholder="Enter Quantity"
                  className={inputClass}
                />

                {quantityError && (
                  <p className="mt-1 text-xs text-(--error-color)">
                    {quantityError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  dispatching ||
                  outlets.length === 0 ||
                  !selectedOutlet ||
                  !dispatchQuantity.trim() ||
                  !!quantityError
                }
                className="h-10 w-full rounded-md bg-(--accent-color) text-sm font-semibold text-(--page-background) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {dispatching ? "Dispatching..." : "Dispatch"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showOutletPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-(--page-background)/70 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !creatingOutlet) {
              setShowOutletPopup(false);
            }
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-(--icon-border-color) bg-(--card-background) px-6 pb-9 pt-12 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                if (creatingOutlet) return;
                setShowOutletPopup(false);
              }}
              disabled={creatingOutlet}
              className={closeButtonClass}
            >
              <RxCross2 size={20} />
            </button>

            <h2 className="mb-6 text-center text-lg font-semibold text-(--text-color)">
              Add Outlet
            </h2>

            <form
              onSubmit={handleOutletSubmit}
              className="mx-auto max-w-xs space-y-5"
              noValidate
            >
              <div>
                <input
                  type="text"
                  value={outletName}
                  onChange={(event) => {
                    const value = removeEmojis(event.target.value);
                    setOutletName(value);

                    setOutletNameError(
                      !value.trim() ? "Outlet name is required." : "",
                    );
                  }}
                  maxLength={100}
                  placeholder="Outlet Name"
                  className={inputClass}
                />

                {outletNameError && (
                  <p className="mt-1 text-xs text-(--error-color)">
                    {outletNameError}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={outletAddress}
                  onChange={(event) => {
                    const value = removeEmojis(event.target.value);
                    setOutletAddress(value);

                    setOutletAddressError(
                      !value.trim() ? "Outlet address is required." : "",
                    );
                  }}
                  maxLength={250}
                  placeholder="Outlet Address"
                  className={inputClass}
                />

                {outletAddressError && (
                  <p className="mt-1 text-xs text-(--error-color)">
                    {outletAddressError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  creatingOutlet ||
                  !outletName.trim() ||
                  !outletAddress.trim() ||
                  !!outletNameError ||
                  !!outletAddressError
                }
                className="h-10 w-full rounded-md bg-(--accent-color) text-sm font-semibold text-(--page-background) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingOutlet ? "Adding Outlet..." : "Add Outlet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DispatchStock;
