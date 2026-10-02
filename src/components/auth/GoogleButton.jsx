import { FcGoogle } from "react-icons/fc";

function GoogleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-[#2b2c4066] py-3 px-2 text-xs text-[#e6e6e8]"
    >
      <FcGoogle size={22} />
      Continue with Google
    </button>
  );
}

export default GoogleButton;
