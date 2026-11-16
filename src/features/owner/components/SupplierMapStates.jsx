import { Link } from "react-router-dom";
import { FiMapPin, FiTarget, FiAlertCircle } from "react-icons/fi";

export function WarehouseNotFoundState() {
  return (
    <div className="mt-6 flex min-h-96 flex-col items-center justify-center rounded-xl border border-(--border-color) bg-(--card-background) px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--error-color)/15 text-(--error-color)">
        <FiMapPin size={20} />
      </span>
      <h2 className="mt-5 text-base font-bold text-(--text-color)">
        We couldn't find your warehouse on the map
      </h2>
      <p className="mt-2 max-w-sm text-xs text-(--secondary-text-color)">
        Add a full warehouse address with street, area and pincode so Kosh can
        show suppliers near you.
      </p>
      <Link
        to="/warehouse"
        className="mt-5 rounded-lg bg-(--accent-color) px-4 py-2 text-xs font-semibold text-(--page-background) transition hover:opacity-90"
      >
        Edit warehouse address
      </Link>
    </div>
  );
}

export function NoSuppliersState({
  radius,
  categoryName,
  nextRadius,
  onTryRadius,
  onClearCategory,
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--sidebar-active-background) text-(--accent-color)">
        <FiTarget size={18} />
      </span>
      <h3 className="mt-4 text-sm font-bold text-(--text-color)">
        No {categoryName ? `${categoryName} ` : ""}suppliers within {radius} km
      </h3>
      <p className="mt-1 text-xs text-(--secondary-text-color)">
        Try a bigger radius or another category.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {nextRadius && (
          <button
            type="button"
            onClick={() => onTryRadius(nextRadius)}
            className="cursor-pointer rounded-full bg-(--accent-color) px-3 py-1.5 text-xs font-semibold text-(--page-background) transition hover:opacity-90"
          >
            Try {nextRadius} km
          </button>
        )}
        {categoryName && (
          <button
            type="button"
            onClick={onClearCategory}
            className="cursor-pointer rounded-full border border-(--border-color) px-3 py-1.5 text-xs font-semibold text-(--text-color) transition hover:bg-(--sidebar-hover-background)"
          >
            All categories
          </button>
        )}
      </div>
    </div>
  );
}

export function ListError({ message, onRetry }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--error-color)/15 text-(--error-color)">
        <FiAlertCircle size={18} />
      </span>
      <h3 className="mt-4 text-sm font-bold text-(--text-color)">
        Couldn't load suppliers
      </h3>
      <p className="mt-1 text-xs text-(--secondary-text-color)">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 cursor-pointer rounded-full bg-(--accent-color) px-3 py-1.5 text-xs font-semibold text-(--page-background) transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <ul className="animate-pulse">
      {[0, 1, 2, 3, 4].map((row) => (
        <li
          key={row}
          className="flex items-center justify-between border-b border-(--border-color) px-4 py-4 last:border-b-0"
        >
          <div className="space-y-2">
            <div className="h-3 w-40 rounded bg-(--border-color)" />
            <div className="h-2.5 w-24 rounded bg-(--border-color)" />
          </div>
          <div className="h-3 w-12 rounded bg-(--border-color)" />
        </li>
      ))}
    </ul>
  );
}
