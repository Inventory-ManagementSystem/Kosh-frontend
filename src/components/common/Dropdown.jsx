import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

const SIZES = {
  sm: { button: "h-8 rounded-full px-3 text-xs", option: "text-xs" },
  md: { button: "h-10 rounded-xl px-3 text-sm", option: "text-sm" },
  form: { button: "h-9 rounded px-3 text-xs", option: "text-xs" },
  lg: { button: "h-12 rounded-md px-4 text-sm", option: "text-sm" },
};

const LIST_HEIGHT = 260;

function Dropdown({
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Select",
  name,
  id,
  size = "md",
  error = false,
  disabled = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openUp, setOpenUp] = useState(false);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const currentValue = String(value ?? "");
  const selectedIndex = options.findIndex(
    (option) => String(option.value) === currentValue,
  );
  const selectedOption = options[selectedIndex];
  const sizeStyle = SIZES[size] || SIZES.md;
  const openList = () => {
    if (disabled) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUp(spaceBelow < LIST_HEIGHT && rect.top > spaceBelow);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };
  const closeList = () => setIsOpen(false);
  const chooseOption = (option) => {
    onChange?.({ target: { name, value: String(option.value) } });
    closeList();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [isOpen, activeIndex]);

  const handleKeyDown = (event) => {
    if (disabled) return;
    const lastIndex = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          openList();
        } else if (event.key === "ArrowDown") {
          setActiveIndex((index) => Math.min(index + 1, lastIndex));
        } else {
          setActiveIndex((index) => Math.max(index - 1, 0));
        }
        break;
      case "Home":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(lastIndex);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen) {
          openList();
        } else if (options[activeIndex]) {
          chooseOption(options[activeIndex]);
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          event.stopPropagation();
          closeList();
        }
        break;
      case "Tab":
        closeList();
        break;
      default:
        break;
    }
  };

  const handleBlur = (event) => {
    if (wrapperRef.current?.contains(event.relatedTarget)) return;
    closeList();
    onBlur?.({ target: { name, value: currentValue } });
  };
  const borderClass = error
    ? "border-(--error-color)"
    : isOpen
      ? "border-(--accent-color)"
      : "border-(--border-color) focus-visible:border-(--accent-color)";
  return (
    <div
      ref={wrapperRef}
      onBlur={handleBlur}
      className={`relative ${className}`}
    >
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeList() : openList())}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-2 border bg-(--dropdown-background) text-left outline-none transition ${sizeStyle.button} ${borderClass} ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        <span
          className={`truncate ${
            selectedOption
              ? "text-(--text-color)"
              : "text-(--secondary-text-color)"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <FiChevronDown
          size={size === "sm" ? 14 : 16}
          className={`shrink-0 text-(--secondary-text-color) transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          onMouseDown={(event) => event.preventDefault()}
          className={`absolute left-0 z-50 max-h-60 w-max max-w-xs min-w-full overflow-y-auto rounded-xl border border-(--border-color) bg-(--dropdown-background) p-1 shadow-xl ${
            openUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-xs text-(--secondary-text-color)">
              No options available
            </li>
          )}
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => chooseOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${sizeStyle.option} ${
                  index === activeIndex ? "bg-(--sidebar-hover-background)" : ""
                } ${
                  isSelected
                    ? "font-medium text-(--accent-color)"
                    : "text-(--text-color)"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <FiCheck size={14} className="shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
