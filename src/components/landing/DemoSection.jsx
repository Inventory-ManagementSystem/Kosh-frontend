import { useState } from "react";

import SectionBadge from "./SectionBadge";
import { FaPlay } from "react-icons/fa";
import thumbnail from "../../assets/auth/thumbnail.jpeg";

const DEMO_VIDEO_FILES = import.meta.glob("../../assets/auth/Kosh_final.mp4", {
  eager: true,
  import: "default",
});
const DEMO_VIDEO = Object.values(DEMO_VIDEO_FILES)[0];

function DemoSection() {
  const [isActive, setIsActive] = useState(false);
  return (
    <section
      id="demo"
      className="relative scroll-mt-16 px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-5xl text-center">
        <SectionBadge>Demo</SectionBadge>
        <h2 className="font-['Google_Sans_Flex'] text-3xl font-bold leading-tight text-(--text-color) sm:text-5xl">
          See how KOSH makes Business
          <span className="block text-(--accent-color)">simple.</span>
        </h2>

        <div className="kosh-video-glow relative mx-auto mt-12 aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-(--border-color) bg-(--card-background) sm:mt-16">
          {!DEMO_VIDEO ? (
            <div className="flex h-full w-full items-end justify-center pb-6 text-xs text-(--secondary-text-color)">
              Demo video coming soon
            </div>
          ) : isActive ? (
            <video
              src={DEMO_VIDEO}
              poster={thumbnail}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={thumbnail}
              alt="KOSH demo preview"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
          <div className="kosh-video-glow-inset pointer-events-none absolute inset-0 rounded-xl" />
          {DEMO_VIDEO && !isActive && (
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className="absolute left-1/2 top-1/2 z-1 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-(--card-background) text-(--accent-color) ring-1 ring-(--icon-border-color) backdrop-blur-md transition hover:scale-105 hover:bg-(--sidebar-active-background) sm:h-20 sm:w-20"
            >
              <FaPlay size={24} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default DemoSection;
