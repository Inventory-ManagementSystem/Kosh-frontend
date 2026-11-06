import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiInfo } from "react-icons/fi";
const POINTED_CORNER = {
  "top-right": "rounded-bl-none",
  "top-left": "rounded-br-none",
  "bottom-right": "rounded-tl-none",
  "bottom-left": "rounded-tr-none",
};

const ICON_GAP = 2;
const VIEWPORT_GAP = 8;
const DASHBOARD_TOP_LIMIT = 10;
const MAX_WIDTH = 288;
const MIN_WIDTH = 140;

function Info({ text, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [container, setContainer] = useState(null);
  const [pos, setPos] = useState({ top: 0, left: 0, x: "right", y: "top" });
  const iconRef = useRef(null);
  const bubbleRef = useRef(null);

  useLayoutEffect(() => {
    setContainer(iconRef.current?.closest(".dashboard") ?? document.body);
  }, []);

  const updatePosition = useCallback(() => {
    const icon = iconRef.current;
    const bubble = bubbleRef.current;
    if (!icon || !bubble) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const box = icon.getBoundingClientRect();
    const topLimit = icon.closest(".dashboard")
      ? DASHBOARD_TOP_LIMIT
      : VIEWPORT_GAP;

    bubble.style.maxWidth = `${Math.min(MAX_WIDTH, vw - VIEWPORT_GAP * 2)}px`;
    const naturalWidth = bubble.offsetWidth;
    const spaceRight = vw - box.right - VIEWPORT_GAP;
    const spaceLeft = box.left - VIEWPORT_GAP;
    const x =
      naturalWidth <= spaceRight || spaceRight >= spaceLeft ? "right" : "left";
    const available = x === "right" ? spaceRight : spaceLeft;
    if (naturalWidth > available) {
      bubble.style.maxWidth = `${Math.max(available, MIN_WIDTH)}px`;
    }
    const width = bubble.offsetWidth;
    const height = bubble.offsetHeight;
    let left =
      x === "right" ? box.right + ICON_GAP : box.left - width - ICON_GAP;
    left = Math.min(Math.max(left, VIEWPORT_GAP), vw - VIEWPORT_GAP - width);
    const spaceAbove = box.top - topLimit;
    const spaceBelow = vh - box.bottom - VIEWPORT_GAP;
    const y =
      height <= spaceAbove || spaceAbove >= spaceBelow ? "top" : "bottom";
    const top =
      y === "top" ? box.top - height - ICON_GAP : box.bottom + ICON_GAP;

    setPos((current) =>
      current.top === top &&
      current.left === left &&
      current.x === x &&
      current.y === y
        ? current
        : { top, left, x, y },
    );
  }, []);
  useLayoutEffect(() => {
    if (!isOpen || !container) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, container, updatePosition]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const handlePointerEnter = (event) => {
    if (event.pointerType === "mouse") open();
  };
  const handlePointerLeave = (event) => {
    if (event.pointerType === "mouse") close();
  };

  return (
    <span
      className={`ml-2 inline-flex align-middle ${className}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button
        ref={iconRef}
        type="button"
        onClick={open}
        onFocus={open}
        onBlur={close}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
        className="inline-flex cursor-pointer items-center justify-center rounded-full text-(--icon-border-color) transition-colors duration-200 hover:text-(--accent-color) focus-visible:text-(--accent-color) focus-visible:outline focus-visible:outline-(--accent-color)"
      >
        <FiInfo className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {container &&
        createPortal(
          <span
            ref={bubbleRef}
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
            className={`pointer-events-none fixed z-60 w-max rounded-2xl border border-(--border-color) bg-(--sidebar-active-background) px-4 py-2.5 text-center text-xs font-normal normal-case leading-relaxed tracking-normal text-(--text-color) shadow-xl transition-opacity duration-200 motion-reduce:transition-none sm:px-5 sm:py-3 sm:text-sm ${
              POINTED_CORNER[`${pos.y}-${pos.x}`]
            } ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}
          >
            {text}
          </span>,
          container,
        )}
    </span>
  );
}

export default Info;
