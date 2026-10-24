import { Link } from "react-router-dom";

import logo from "../../assets/auth/logo.svg";
import wave from "../../assets/auth/wave.svg";
import firstScreen from "../../assets/auth/first-screen.svg";
import warehouses from "../../assets/auth/Warehouses.svg";
import invoice from "../../assets/auth/Invoice.svg";

const FEATURES = ["Inventory", "Supplier", "Employee", "Owner", "Invoices"];
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

function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[var(--page-background)] text-[var(--text-color)]"
      style={{ backgroundImage: GLOW_BACKGROUND }}
    >
      {SQUARES.map((position, index) => (
        <span
          key={index}
          className={`pointer-events-none absolute hidden rounded-sm bg-[var(--text-color)] sm:block ${position}`}
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

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-2 py-5 sm:px-8">
        <Link to="/" >
          <img src={logo} alt="KOSH" className="h-7 w-auto" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-md border border-[var(--icon-border-color)] px-5 py-1.5 text-xs font-medium text-[var(--text-color)] transition hover:bg-[var(--sidebar-hover-background)]"
          >
            Login
          </Link>

          <Link
            to="/role"
            className="rounded-md bg-[var(--accent-color)] px-5 py-1.5 text-xs font-semibold text-[var(--page-background)] transition hover:bg-[var(--accent-hover-color)]"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-8 text-center sm:px-8 sm:pt-12">
        <div className="relative mx-auto inline-block">
          <h1 className="font-['Google_Sans_Flex'] text-4xl font-bold leading-[1.15] text-[var(--text-color)] sm:text-5xl md:text-6xl">
            Invoices &amp; Inventory.
            <br />
            Different Roles.
            <br />
            ONE <span className="text-[var(--accent-color)]">PLATFORM.</span>
          </h1>
        </div>

        <p className="font-['Google_Sans_Flex'] mx-auto mt-6 max-w-md text-[11px] text-[var(--secondary-text-color)] sm:text-xs">
          Kosh brings business owners, employees and suppliers onto one B2B
          platform — from RFQs and quotations to purchase orders, GRNs and
          automated supplier payouts. Track warehouse stock in real time, catch
          discrepancies on delivery, and give every role exactly the access it
          needs.
        </p>

        <div className="relative mx-auto mt-14 w-full max-w-4xl sm:mt-20">
          <div className="relative aspect-[17/10] w-full">
            <img
              src={warehouses}
              alt="Warehouse inventory dashboard"
              className="absolute left-[39%] top-0 z-10 w-[55%] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.7)] ring-1 ring-[var(--border-color)]"
            />
            <img
              src={invoice}
              alt="Invoice and report page"
              className="absolute left-0 top-[10%] z-20 w-[53%] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.7)] ring-1 ring-[var(--border-color)]"
            />
            <img
              src={firstScreen}
              alt="Choose your workplace"
              className="absolute bottom-0 right-0 z-30 w-[49%] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.7)] ring-1 ring-[var(--border-color)]"
            />
          </div>
        </div>
      </main>

      <footer className="relative z-10 mx-auto max-w-4xl px-5 pb-12 pt-16 sm:pt-24">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm font-medium sm:gap-x-8 sm:text-base">
          {FEATURES.map((feature, index) => (
            <li key={feature} className="flex items-center gap-4 sm:gap-8">
              {index > 0 && <span className="text-[var(--icon-color)]">·</span>}
              <span
                className={
                  index === 0
                    ? "text-[var(--secondary-text-color)]"
                    : "text-[var(--text-color)]"
                }
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}

export default LandingPage;