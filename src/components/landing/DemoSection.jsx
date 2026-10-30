import { useRef, useState } from "react";

import SectionBadge from "./SectionBadge";
import { FaPlay } from "react-icons/fa";

const DEMO_VIDEO_FILES = import.meta.glob("../../assets/auth/Kosh_final.mp4", {
  eager: true,
  import: "default",
});
const DEMO_VIDEO = Object.values(DEMO_VIDEO_FILES)[0];

function DemoSection() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    videoRef.current?.play();
  };

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
          {DEMO_VIDEO ? (
            <video
              ref={videoRef}
              src={DEMO_VIDEO}
              controls={isPlaying}
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-end justify-center pb-6 text-xs text-(--secondary-text-color)">
              Demo video coming soon
            </div>
          )}

          <div className="kosh-video-glow-inset pointer-events-none absolute inset-0 rounded-xl" />

          {!isPlaying && (
            <button
              type="button"
              onClick={handlePlay}
              disabled={!DEMO_VIDEO}
              className="absolute left-1/2 top-1/2 z-1 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-(--card-background) text-(--accent-color) ring-1 ring-(--icon-border-color) backdrop-blur-md transition hover:scale-105 hover:bg-(--sidebar-active-background) disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:h-20 sm:w-20"
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
