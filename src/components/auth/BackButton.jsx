function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 w-24 cursor-pointer rounded-md border border-[#2b2c40] text-xs font-medium text-[#e6e6e8] transition hover:border-[#b4bedd] hover:text-[#b4bedd] sm:h-10 sm:w-28"
    >
      Back
    </button>
  );
}

export default BackButton;
