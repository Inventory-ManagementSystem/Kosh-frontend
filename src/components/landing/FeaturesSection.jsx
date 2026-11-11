import { Link } from "react-router-dom";

import SectionBadge from "./SectionBadge";
import Reveal from "../common/Reveal";
import Parallax from "../common/Parallax";

import firstScreen from "../../assets/auth/first-screen.svg";
import warehouses from "../../assets/auth/Warehouses.svg";

const FEATURE_ROWS = [
  {
    id: "roles",
    head: "Different Roles ?",
    title: "Access as Supplier, Owner or Employee",
    description:
      "Every role gets its own workspace. Owners manage warehouses, people and payments, employees handle stock and GRNs, and suppliers respond to RFQs and track payouts — all on the same platform.",
    image: firstScreen,
    alt: "Choose your workplace",
    cta: { label: "Create Account", to: "/signup" },
  },
  {
    id: "features",
    head: "Manual Inventory Management?",
    title: "Automated Inventory Management",
    description:
      "Track warehouse stock in real time, get alerts when levels run low and raise an RFQ in a few clicks. No more spreadsheets, no more guesswork.",
    image: warehouses,
    alt: "Warehouse inventory dashboard",
  },
];

function FeaturesSection() {
  return (
    <section className="relative px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionBadge>Features</SectionBadge>

        <div className="mt-10 flex flex-col gap-20 sm:gap-28">
          {FEATURE_ROWS.map((row, index) => (
            <div
              key={row.id}
              id={row.id}
              className="grid scroll-mt-20 grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div
                className={`text-left ${index % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <Reveal
                  as="p"
                  className="font-['Google_Sans_Flex'] text-sm font-medium text-(--accent-color) sm:text-base"
                >
                  {row.head}
                </Reveal>
                <Reveal
                  as="h3"
                  delay={100}
                  className="mt-2 font-['Google_Sans_Flex'] text-3xl font-bold leading-tight text-(--text-color) sm:text-4xl"
                >
                  {row.title}
                </Reveal>
                <Reveal
                  as="p"
                  delay={200}
                  className="mt-5 max-w-md text-xs leading-relaxed text-(--secondary-text-color) sm:text-sm"
                >
                  {row.description}
                </Reveal>

                {row.cta && (
                  <Reveal delay={300}>
                    <Link
                      to={row.cta.to}
                      className="mt-6 inline-block rounded-md bg-(--accent-color) px-6 py-2 text-xs font-semibold text-(--page-background) transition hover:bg-(--accent-hover-color)"
                    >
                      {row.cta.label}
                    </Link>
                  </Reveal>
                )}
              </div>
              <Parallax
                speed={0.06}
                className={index % 2 === 1 ? "lg:order-1" : ""}
              >
                <Reveal variant={index % 2 === 1 ? "left" : "right"}>
                  <img
                    src={row.image}
                    alt={row.alt}
                    className="w-full rounded-lg shadow-[0_0_80px_4px_color-mix(in_srgb,var(--chat-ai-user-background)_55%,transparent)] ring-1 ring-(--border-color)"
                  />
                </Reveal>
              </Parallax>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
