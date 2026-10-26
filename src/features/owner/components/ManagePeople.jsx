import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { FaCirclePlus } from "react-icons/fa6";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import PeopleTable from "./PeopleTable";
import ConfirmDelete from "./ConfirmDelete";

function ManagePeople({
  title,
  description,
  searchPlaceholder,
  addButtonLabel,
  addRoute,
  detailsTitle,
  columns,
  loadItems,
  removeItem,
  Skeleton,
  getStatusClass,
  emptyMessage,
  searchEmptyMessage,
}) {
  const navigate = useNavigate();
  const { accessToken, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    const fetchItems = async () => {
      if (!accessToken) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await loadItems(accessToken);
        setItems(data);
      } catch (error) {
        setError(error.message || `Unable to load ${title.toLowerCase()}`);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [accessToken, authLoading, loadItems, title]);

  const handleDeleteClick = (item) => {
    setConfirmDeleteItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteItem) return;
    const item = confirmDeleteItem;
    const isPending = item.rowType === "invite";
    setDeletingId(item.id);
    try {
      await removeItem(item, accessToken);

      setItems((current) =>
        current.filter(
          (currentItem) =>
            !(
              currentItem.rowType === item.rowType && currentItem.id === item.id
            ),
        ),
      );
      toast.success(
        isPending ? "Invitation cancelled." : "Record removed successfully.",
      );
      setConfirmDeleteItem(null);
    } catch (error) {
      toast.error(error.message || "Unable to complete the action.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const searchableValues = columns
      .map((column) => item[column.key] ?? "")
      .join(" ");

    return searchableValues.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-['Google_Sans_Flex'] text-2xl font-semibold text-(--text-color) sm:text-3xl">
          {title}
        </h1>

        <p className="mt-2 text-sm text-(--secondary-text-color)">
          {description}
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-xl bg-(--input-background) px-3">
          <FiSearch
            size={16}
            className="shrink-0 text-(--secondary-text-color)"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color)"
          />
        </div>

        <button
          type="button"
          onClick={() => navigate(addRoute)}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-(--accent-color) px-4 text-sm font-semibold text-(--page-background) transition hover:opacity-90"
        >
          {addButtonLabel}
          <FaCirclePlus size={16} />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-(--border-color) bg-(--card-background)">
        <div className="border-b border-(--border-color) px-4 py-3 sm:px-5">
          <h2 className="text-base font-medium text-(--text-color)">
            {detailsTitle}
          </h2>
        </div>

        {loading && <Skeleton />}

        {!loading && error && (
          <div className="px-5 py-8 text-sm text-(--error-color)">{error}</div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-(--secondary-text-color)">
            {search ? searchEmptyMessage : emptyMessage}
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <PeopleTable
            items={filteredItems}
            columns={columns}
            onDelete={handleDeleteClick}
            deletingId={deletingId}
            getStatusClass={getStatusClass}
          />
        )}
      </div>
      <ConfirmDelete
        isOpen={Boolean(confirmDeleteItem)}
        itemType={
          confirmDeleteItem?.rowType === "invite"
            ? "invitation"
            : title.toLowerCase().replace("manage ", "").replace(/s$/, "")
        }
        description={
          confirmDeleteItem?.rowType === "invite"
            ? "Are you sure you want to cancel this invitation?"
            : `Are you sure you want to remove this ${title
                .toLowerCase()
                .replace("manage ", "")
                .replace(/s$/, "")}?`
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteItem(null)}
        loading={deletingId !== null}
      />
    </div>
  );
}

export default ManagePeople;
