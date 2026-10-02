import { IoLogoGithub } from "react-icons/io";

function GithubButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-[#2b2c4066] py-3 px-2 text-xs text-[#e6e6e8] ${className}`}
    >
      <IoLogoGithub size={22} />
      Continue with GitHub
    </button>
  );
}

export default GithubButton;
