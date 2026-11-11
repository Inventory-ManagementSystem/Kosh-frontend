import { useEffect, useRef } from "react";

export default function useParallax(speed = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = el.closest("section") || el.parentElement;
    const update = () => {
      const top = section.getBoundingClientRect().top;
      let offset = -top * speed;
      offset = Math.max(-100, Math.min(100, offset));
      el.style.setProperty("--py", `${offset}px`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [speed]);
  return ref;
}
