function NavigationButton({
  children,
  onClick,
  type = "button",
  isFormFilled,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`h-9 w-24 cursor-pointer rounded-md text-xs font-bold transition sm:h-10 sm:w-28 ${
        isFormFilled
          ? "bg-(--accent-color) text-(--page-background) hover:bg-(--accent-hover-color)"
          : "bg-(--border-color) text-(--secondary-text-color)"
      }`}
    >
      {children}
    </button>
  );
}

export default NavigationButton;
