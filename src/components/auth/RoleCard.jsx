import { BsPersonFill, BsPeopleFill, BsPersonLinesFill } from "react-icons/bs";

function RoleCard({ title, active, onSelect }) {
  const isEmployee = title === "Employee";
  const isSupplier = title === "Supplier";

  return (
    <label
      className={`relative flex h-[58px] w-full cursor-pointer items-center gap-3 rounded-lg border px-4 transition-all duration-200 sm:h-[58px] sm:px-4 ${
        active
          ? "border-(--accent-color) shadow-[0_0_20px_rgba(180,190,221,0.12)]"
          : "border-(--border-color) hover:border-(--icon-border-color)"
      }`}
    >
      <input
        type="radio"
        name="role"
        checked={active}
        onChange={onSelect}
        className="sr-only"
      />

      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-(--icon-border-color) text-(--icon-accent-color)">
        {isSupplier ? (
          <BsPersonLinesFill size={17} />
        ) : isEmployee ? (
          <BsPeopleFill size={17} />
        ) : (
          <BsPersonFill size={17} />
        )}
      </div>

      <p className="min-w-0 flex-1 text-l font-medium text-(--text-color) sm:text-[13px]">
        I am {isEmployee ? "an" : "a"}{" "}
        <span className="font-bold text-(--accent-color)">{title}</span>
      </p>

      <span
        className={`flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full border ${
          active ? "border-(--accent-color)" : "border-transparent"
        }`}
      >
        {active && (
          <span className="h-1 w-1 rounded-full bg-(--accent-color)" />
        )}
      </span>
    </label>
  );
}

export default RoleCard;
