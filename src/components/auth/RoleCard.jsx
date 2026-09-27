import { BsPersonFill } from "react-icons/bs";

function RoleCard({ title, description, active, onSignup }) {
  return (
    <div
      className={`flex min-h-74 w-full max-w-80 flex-col items-center justify-between rounded-lg border bg-[#000112] px-6 py-7 text-center transition ${
        active
          ? "border-[#b4bedd] shadow-lg"
          : "border-[#2b2c40] hover:border-[#6b6c7a] hover:shadow-[0_0_25px_rgba(180,190,221,0.1)]"
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="mb-5 h-20 w-20 flex items-center justify-center text-[#b4bedd] rounded-full bg-[#2b2c40]">
          <BsPersonFill size={70} />
        </div>
        <h2 className="text-2xl font-semibold text-[#e6e6e8]">{title}</h2>
        <p className="mt-1 max-w-44 text-xs text-[#9697a1]">{description}</p>
      </div>

      <button
        type="button"
        onClick={onSignup}
        className={`mt-6 rounded-md px-5 py-2 text-xs font-semibold transition ${
          active
            ? "bg-[#2b2c40] text-[#9697a1] hover:bg-[#9697a1] hover:text-[#2b2c40]"
            : "bg-[#2b2c40] text-[#9697a1] hover:bg-[#b4bedd] hover:text-[#000119]"
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}

export default RoleCard;
