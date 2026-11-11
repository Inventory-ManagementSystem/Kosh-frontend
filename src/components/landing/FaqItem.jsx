import { FiPlus } from "react-icons/fi";
import useReveal from "../../hooks/useReveal";

function FaqItem({ question, answer, isOpen, onToggle, index = 0 }) {
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${index * 80}ms` }}
      className={`${visible ? "animate-reveal-up" : "opacity-0"} relative rounded-xl border transition-[box-shadow,border-color,background-color] duration-500 motion-reduce:transition-none ${
        isOpen
          ? "z-0 border-[#231D4D] bg-(--card-background) shadow-[0_0_40px_1px_color-mix(in_srgb,var(--chat-ai-user-background)_55%,transparent)]"
          : "z-10 border-[#231D4D] bg-(--card-background) shadow-[0_0_40px_1px_transparent]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-xs font-medium text-(--text-color) sm:text-sm">
          {question}
        </span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 motion-reduce:transition-none ${
            isOpen
              ? "rotate-45 border-transparent bg-[#7F9BF3] text-(--page-background)"
              : "rotate-0 border-(--icon-border-color) bg-[#7F9BF333] text-(--accent-color)"
          }`}
        >
          <FiPlus className="h-3.5 w-3.5" />
        </span>
      </button>
      <div
        role="region"
        className={`font-['Google_Sans_Flex'] grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <div className="rounded-lg bg-[#2B2C40] px-4 py-4 text-xs font-['Google_Sans_Flex'] text-(--secondary-text-color) sm:text-[13px]">
              {answer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaqItem;
