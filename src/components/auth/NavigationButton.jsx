function NavigationButton({
  children,
  onClick,
  type = "button",
  isFormFilled,
  isLoading = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`h-9 w-24 cursor-pointer rounded-md text-xs font-bold sm:h-10 sm:w-28 transition disabled:cursor-default disabled:opacity-70 ${
        isFormFilled
          ? "bg-(--accent-color) text-(--page-background) hover:bg-(--accent-hover-color)"
          : "bg-(--border-color) text-(--secondary-text-color)"
      }`}
    >
      {isLoading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {isLoading ? "" : children}
    </button>
  );
}

export default NavigationButton;
