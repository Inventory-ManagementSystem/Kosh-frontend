import { BsPersonFill, BsPeopleFill, BsPersonLinesFill } from "react-icons/bs";

function RoleCard({ title, active, onSelect }) {
  const isEmployee = title === "Employee";
  const isSupplier = title === "Supplier";

  return (
    <label
      className={`relative flex h-[58px] w-full cursor-pointer items-center gap-3 rounded-lg border px-4 transition-all duration-200 sm:h-[58px] sm:px-4 ${
        active
          ? "border-[#b4bedd] shadow-[0_0_20px_rgba(180,190,221,0.12)]"
          : "border-[#2b2c40] hover:border-[#6b6c7a]"
      }`}
    >
      <input
        type="radio"
        name="role"
        checked={active}
        onChange={onSelect}
        className="sr-only"
      />

      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-[#6b6c7a] text-[#b4bedd]">
        {isSupplier ? (
          <BsPersonLinesFill size={17} />
        ) : isEmployee ? (
          <BsPeopleFill size={17} />
        ) : (
          <BsPersonFill size={17} />
        )}
      </div>

      <p className="min-w-0 flex-1 text-l font-medium text-[#e6e6e8] sm:text-[13px]">
        I am {isEmployee ? "an" : "a"}{" "}
        <span className="font-bold text-[#b4bedd]">{title}</span>
      </p>

      <span
        className={`flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full border ${
          active ? "border-[#b4bedd]" : "border-transparent"
        }`}
      >
        {active && <span className="h-1 w-1 rounded-full bg-[#b4bedd]" />}
      </span>
    </label>
  );
}

export default RoleCard;
