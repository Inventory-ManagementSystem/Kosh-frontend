function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 w-24 cursor-pointer rounded-md border border-(--border-color) text-xs font-medium text-(--text-color) transition hover:border-(--accent-color) hover:text-(--accent-color) sm:h-10 sm:w-28"
    >
      Back
    </button>
  );
}

export default BackButton;
