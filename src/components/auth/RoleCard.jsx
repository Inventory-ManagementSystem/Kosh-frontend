import { BsPersonFill, BsPeopleFill } from "react-icons/bs";

function RoleCard({ title, active, onSelect }) {
  const isEmployee = title === "Employee";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-16 w-full items-center rounded-lg border px-3 text-left transition ${
        active
          ? "border-[#b4bedd] shadow-[0_0_20px_rgba(180,190,221,0.12)]"
          : "border-[#2b2c40] hover:border-[#6b6c7a]"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#6b6c7a] bg-[#000112] text-[#b4bedd]">
        {isEmployee ? <BsPeopleFill size={16} /> : <BsPersonFill size={17} />}
      </div>
      <div className="ml-4 flex-1">
        <p className="text-xs font-medium text-[#e6e6e8]">
          {isEmployee ? "I am an" : "I am a"}
        </p>
        <p className="text-sm font-bold text-[#b4bedd]">{title}</p>
      </div>
      <span
        className={`flex h-3 w-3 items-center justify-center rounded-full border ${
          active ? "border-[#b4bedd]" : "border-[#6b6c7a]"
        }`}
      >
        {active && <span className="h-1.5 w-1.5 rounded-full bg-[#b4bedd]" />}
      </span>
    </button>
  );
}

export default RoleCard;
