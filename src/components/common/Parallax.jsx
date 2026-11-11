import useParallax from "../../hooks/useParallax";

function Parallax({ speed = 0.1, className = "", children }) {
  const ref = useParallax(speed);
  return (
    <div ref={ref} className={`[--py:0px] translate-y-(--py) ${className}`}>
      {children}
    </div>
  );
}

export default Parallax;
