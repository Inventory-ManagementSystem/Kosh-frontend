function Toggle({ options, value, onChange, disabled = false }) {
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-full bg-(--input-background) border border-b border-(--border-color) p-1"
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            disabled={disabled}
            onClick={() => !active && onChange(option.value)}
            className={`min-w-12 rounded-full px-5 py-1.5 text-sm font-semibold transition-colors disabled:cursor-default disabled:opacity-60 ${
              active
                ? "bg-(--accent-color) text-(--page-background)"
                : "cursor-pointer text-(--text-color) enabled:hover:text-(--accent-color)"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default Toggle;
