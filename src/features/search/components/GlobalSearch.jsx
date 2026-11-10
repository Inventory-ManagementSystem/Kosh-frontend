import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUser } from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";
import {
  FaClipboardList,
  FaFileInvoice,
  FaClipboardCheck,
} from "react-icons/fa";
import { RiFileList3Fill } from "react-icons/ri";
import { IoCloseCircle } from "react-icons/io5";
import { useAuth } from "../../../context/AuthContext";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import { MAX_SEARCH_LENGTH } from "../api/searchApi";

const GROUPS = [
  { key: "products", label: "Products", icon: BsBoxSeamFill },
  { key: "suppliers", label: "Suppliers", icon: FaUser },
  { key: "rfqs", label: "RFQs", icon: RiFileList3Fill },
  { key: "purchase_orders", label: "Purchase Orders", icon: FaClipboardList },
  { key: "invoices", label: "Invoices", icon: FaFileInvoice },
];

const ROUTES = {
  owner: {
    product: (id) => `/edit-product/${id}`,
    supplier: () => "/suppliers",
    rfq: (id) => `/manage-quotation/${id}`,
    purchase_order: (id) => `/owner/orders/${id}`,
    invoice: (id) => `/owner/invoices/${id}`,
  },
};

function GlobalSearch({
  role = "owner",
  className = "",
  autoFocus = false,
  onNavigate,
}) {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const itemRefs = useRef([]);
  const keyboardNav = useRef(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const { data, loading, error, tooShort } = useGlobalSearch(
    accessToken,
    query,
  );

  const { groups, flat } = useMemo(() => {
    const filled = GROUPS.map((group) => ({
      ...group,
      items: data?.[group.key] ?? [],
    })).filter((group) => group.items.length > 0);
    return { groups: filled, flat: filled.flatMap((group) => group.items) };
  }, [data]);

  useEffect(() => {
    setActiveIndex(0);
    panelRef.current?.scrollTo({ top: 0 });
  }, [data]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  useEffect(() => {
    if (!keyboardNav.current) return;
    keyboardNav.current = false;
    if (activeIndex === 0) {
      panelRef.current?.scrollTo({ top: 0 });
    } else {
      itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const close = () => {
    setOpen(false);
    inputRef.current?.blur();
  };

  const clear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const openResult = (item) => {
    const path = (ROUTES[role] ?? ROUTES.owner)[item.type]?.(item.id);
    if (!path) return;
    navigate(path);
    setOpen(false);
    setQuery("");
    onNavigate?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (!flat.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (activeIndex < flat.length - 1) {
        keyboardNav.current = true;
        setActiveIndex(activeIndex + 1);
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (activeIndex > 0) {
        keyboardNav.current = true;
        setActiveIndex(activeIndex - 1);
      }
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      openResult(flat[activeIndex]);
    }
  };
  const hasQuery = query.trim().length > 0;
  const showPanel = open && hasQuery;

  let message = "";
  if (tooShort) message = "Type at least 3 characters to search.";
  else if (loading && !data) message = "Searching…";
  else if (error) message = error;
  else if (!loading && data && flat.length === 0)
    message = `No results for “${query.trim()}”.`;

  let runningIndex = -1;

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div
        className={`flex h-10 items-center gap-2 rounded-full border bg-(--input-background) px-3 transition-colors ${
          open
            ? "border-(--accent-color)"
            : "border-(--border-color) hover:border-(--icon-border-color)"
        }`}
      >
        <FaSearch
          size={14}
          className="shrink-0 text-(--secondary-text-color)"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          maxLength={MAX_SEARCH_LENGTH}
          placeholder="Search"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color)"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 text-(--secondary-text-color) hover:text-(--text-color)"
          >
            <IoCloseCircle size={18} />
          </button>
        )}
      </div>

      {showPanel && (
        <div
          ref={panelRef}
          className="kosh-chat-scrollbar absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] scroll-py-2 overflow-y-auto rounded-xl border border-(--border-color) bg-(--dropdown-background) p-2 shadow-xl"
        >
          {message && (
            <p
              className={`px-3 py-3 text-sm ${
                error ? "text-(--error-color)" : "text-(--secondary-text-color)"
              }`}
            >
              {message}
            </p>
          )}

          {groups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.key} className="mb-1">
                <p className="font-['Google_Sans_Flex'] px-3 pb-1 pt-2 text-[13px] font-semibold uppercase text-(--text-color)">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  const active = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => (itemRefs.current[index] = el)}
                      type="button"
                      onMouseMove={() => {
                        if (activeIndex !== index) setActiveIndex(index);
                      }}
                      onClick={() => openResult(item)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        active ? "bg-(--searchbar-background)" : ""
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--input-background) text-(--text-color)">
                        <GroupIcon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="font-['Google_Sans_Flex'] block truncate text-sm font-medium text-(--text-color)">
                          {item.title}
                        </span>
                        <span className="font-['Google_Sans_Flex'] block truncate text-xs text-(--secondary-text-color)">
                          {item.subtitle}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
