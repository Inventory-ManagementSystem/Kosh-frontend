import FeatureMarquee from "./Featuremarquee";

import wave from "../../assets/auth/wave.svg";
import firstScreen from "../../assets/auth/first-screen.svg";
import warehouses from "../../assets/auth/Warehouses.svg";
import Report from "../../assets/auth/Report.svg";

const SQUARES = [
  "left-[8%] top-[22%] h-4 w-4 opacity-10",
  "left-[18%] top-[48%] h-3 w-3 opacity-10",
  "right-[10%] top-[18%] h-5 w-5 opacity-10",
  "right-[6%] top-[42%] h-3 w-3 opacity-10",
  "left-[3%] top-[70%] h-6 w-6 opacity-5",
  "right-[22%] top-[12%] h-3 w-3 opacity-10",
  "right-[3%] top-[62%] h-5 w-5 opacity-5",
];

const GLOW_BACKGROUND = [
  "radial-gradient(ellipse 70% 45% at 50% 62%, var(--chat-ai-user-background), transparent 30%)",
].join(", ");

function HeroSection() {
  return (
    <section
      id="home"
      className="relative scroll-mt-16 overflow-hidden"
      style={{ backgroundImage: GLOW_BACKGROUND }}
    >
      {SQUARES.map((position, index) => (
        <span
          key={index}
          className={`pointer-events-none absolute hidden rounded-sm bg-(--text-color) sm:block ${position}`}
        />
      ))}
      <div
        className="pointer-events-none absolute left-1/2 top-[60%] z-0 h-[520px] w-[900px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--chat-ai-user-background) 80%, transparent), color-mix(in srgb, var(--dashboard-glow) 25%, transparent) 60%, transparent 80%)",
        }}
      />
      <img
        src={wave}
        alt="wave"
        className="pointer-events-none absolute left-0 top-[52%] z-0 h-auto w-full min-w-[1200px] max-w-none select-none"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-6 pt-14 text-center sm:px-8 sm:pt-20">
        <h1 className="font-['Google_Sans_Flex'] text-4xl font-bold text-(--text-color) sm:text-5xl md:text-6xl">
          Invoices &amp; Inventory.
          <br />
          Different Roles.
          <br />
          ONE <span className="text-(--accent-color)">PLATFORM.</span>
        </h1>

        <p className="font-['Google_Sans_Flex'] mx-auto mt-6 max-w-md font-medium text-xs text-(--secondary-text-color) sm:text-[16px]">
          Kosh brings business owners, employees and suppliers onto one{" "}
          <span className="text-(--text-color) font-bold"> B2B </span>
          platform — from RFQs and quotations to purchase orders, GRNs and
          automated supplier payouts. Track warehouse stock in real time, catch
          discrepancies on delivery, and give every role exactly the access it
          needs.
        </p>

        <div className="relative mx-auto mt-14 w-full max-w-4xl sm:mt-20">
          <div className="relative aspect-17/10 w-full">
            <img
              src={warehouses}
              alt="Warehouse inventory dashboard"
              className="absolute left-[39%] top-0 z-10 w-[55%] rounded-lg ring-1 ring-(--border-color)"
            />
            <img
              src={Report}
              alt="Invoice and report page"
              className="absolute left-0 top-[10%] z-20 w-[53%] rounded-lg ring-1 ring-(--border-color)"
            />
            <img
              src={firstScreen}
              alt="Choose your workplace"
              className="absolute bottom-0 right-0 z-30 w-[49%] rounded-lg ring-1 ring-(--border-color)"
            />
          </div>
        </div>
      </div>

      <FeatureMarquee />
    </section>
  );
}

export default HeroSection;
