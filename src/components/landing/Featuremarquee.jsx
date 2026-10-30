const MARQUEE_ITEMS = [
  "Inventory",
  "Supplier",
  "Employee",
  "Owner",
  "Invoices",
];

function MarqueeGroup({ hidden = false }) {
  return (
    <ul
      aria-hidden={hidden}
      className="flex shrink-0 items-center text-sm font-medium text-(--text-color) sm:text-base"
    >
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-center">
          <span className="px-6 sm:px-10">{item}</span>
          <span className="text-(--icon-color)">·</span>
        </li>
      ))}
    </ul>
  );
}

function FeatureMarquee() {
  return (
    <div className="kosh-marquee relative z-10 mx-auto w-full max-w-5xl overflow-hidden py-10">
      <div className="kosh-marquee-track">
        <MarqueeGroup />
        <MarqueeGroup hidden />
      </div>
    </div>
  );
}

export default FeatureMarquee;
