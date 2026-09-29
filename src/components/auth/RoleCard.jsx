import { BsPersonFill, BsPeopleFill } from "react-icons/bs";

function RoleCard({ title, active, onSelect }) {
  const isEmployee = title === "Employee";

  return (
    <label
      className={`relative flex h-36 w-full cursor-pointer flex-col rounded-lg border p-5 transition sm:h-40 sm:w-[190px] sm:p-5 lg:h-[165px] lg:w-[190px] xl:h-[180px] xl:w-[205px] ${
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

      <div className="absolute right-4 top-4 flex h-2.5 w-2.5 items-center justify-center rounded-full border border-[#b4bedd]">
        {active && <span className="h-1 w-1 rounded-full bg-[#b4bedd]" />}
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#6b6c7a] text-[#b4bedd]">
        {isEmployee ? <BsPeopleFill size={20} /> : <BsPersonFill size={20} />}
      </div>

      <div className="mt-auto">
        <p className="text-[10px] font-semibold text-[#e6e6e8] sm:text-xs">
          I am {isEmployee ? "an" : "a"}
        </p>

        <p className="mt-1 text-sm font-bold  text-[#b4bedd] sm:text-base">
          {title}
        </p>
      </div>
    </label>
  );
}

export default RoleCard;
