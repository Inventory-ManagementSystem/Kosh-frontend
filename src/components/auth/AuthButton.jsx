function AuthButton({ children, isFormFilled }) {
  return (
    <button
      type="submit"
      className={`w-full cursor-pointer rounded-md py-3 text-sm font-semibold transition ${
        isFormFilled
          ? "bg-(--accent-color) text-(--page-background) hover:bg-(--accent-hover-color)"
          : "bg-(--border-color) text-(--secondary-text-color)"
      }`}
    >
      {children}
    </button>
  );
}

export default AuthButton;
