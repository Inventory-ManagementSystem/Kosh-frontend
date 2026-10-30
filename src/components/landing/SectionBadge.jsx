import tag from "../../assets/auth/tag.svg";

function SectionBadge({ children }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-widest text-(--accent-color)">
      <img src={tag} alt="" className="h-3.5 w-auto" />
      <span>{children}</span>
    </div>
  );
}

export default SectionBadge;
