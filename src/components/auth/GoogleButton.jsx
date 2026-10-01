import { FcGoogle } from "react-icons/fc";

function GoogleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-[#2b2c40] py-3 px-2 text-sm text-[#e6e6e8]"
    >
      <FcGoogle size={18} />
      Continue with Google
    </button>
  );
}

export default GoogleButton;
