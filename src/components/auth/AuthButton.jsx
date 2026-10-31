function AuthButton({ children, isFormFilled, isLoading = false }) {
  const disabled = isLoading;
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full cursor-pointer rounded-md py-3 text-sm font-semibold transition disabled:cursor-default disabled:opacity-70 ${
        isFormFilled
          ? "bg-(--accent-color) text-(--page-background) hover:bg-(--accent-hover-color)"
          : "bg-(--border-color) text-(--secondary-text-color)"
      }`}
    >
      {isLoading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export default AuthButton;
