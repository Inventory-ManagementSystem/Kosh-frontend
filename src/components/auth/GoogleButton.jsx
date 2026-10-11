import { FcGoogle } from "react-icons/fc";

function GoogleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-(--card-background) py-3 px-2 text-xs text-(--text-color)"
    >
      <FcGoogle size={22} />
      Continue with Google
    </button>
  );
}

export default GoogleButton;
