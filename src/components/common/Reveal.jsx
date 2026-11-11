import useReveal from "../../hooks/useReveal";

const ANIMATIONS = {
  up: "animate-reveal-up",
  left: "animate-reveal-left",
  right: "animate-reveal-right",
  scale: "animate-reveal-scale",
};

function Reveal({
  variant = "up",
  delay = 0,
  as: Tag = "div",
  className = "",
  children,
  ref: forwardedRef,
  style = {},
  ...rest
}) {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={(element) => {
        ref.current = element;
        if (forwardedRef) forwardedRef.current = element;
      }}
      style={{ ...style, animationDelay: `${delay}ms` }}
      className={`${visible ? ANIMATIONS[variant] : "opacity-0"} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
