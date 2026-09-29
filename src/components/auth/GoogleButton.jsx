import { FcGoogle } from "react-icons/fc";

function GoogleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-[#000119] py-3 text-sm font-semibold text-[#e6e6e8]"
    >
      <FcGoogle size={18} />
      Continue with Google
    </button>
  );
}

export default GoogleButton;
