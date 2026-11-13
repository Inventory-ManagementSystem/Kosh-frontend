import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getHomeRoute } from "../utils/onboarding";

import page404 from "../assets/auth/page404.svg";

const fourClass =
  "pointer-events-none hidden select-none text-[length:clamp(10rem,26vw,30rem)] font-extrabold text-(--accent-color) md:block";

function NotFound() {
  const { isAuthenticated, loading, role } = useAuth();
  const btnLink = isAuthenticated ? getHomeRoute(role) : "/login";
  const btnText = isAuthenticated ? "Back to Dashboard" : "Log in";
  const helpText = isAuthenticated
    ? "Click button below to go back to dashboard."
    : "Click button below to log in.";
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-(--page-background) text-(--text-color)">
      <section className="relative z-10 flex flex-1 items-center justify-center px-4 pb-28 md:pb-24">
        <div className="flex w-full max-w-5xl items-center justify-center gap-6 md:justify-between md:px-[3vw]">
          <span className={fourClass}>4</span>

          <div className="w-full max-w-xs rounded-3xl border border-(--border-color) bg-(--sidebar-active-background)/80 px-5 py-8 text-center shadow-[0_0_40px_rgba(68,100,200,0.25)] backdrop-blur-md">
            <h1 className="font-['Google_Sans_Flex'] text-xl font-medium text-(--accent-color) sm:text-2xl">
              Oh No! Error 404
              <br />
              Sorry, page not found
            </h1>
            <p className="font-['Google_Sans_Flex'] mt-5 text-xs text-(--text-color)">
              The page you are looking for doesn't exist. {helpText}
            </p>
            <div className="mt-6 flex h-8 justify-center">
              {!loading && (
                <Link
                  to={btnLink}
                  className="font-['Google_Sans_Flex'] inline-flex items-center rounded-md bg-(--accent-color) px-4 text-xs font-semibold text-(--page-background) transition hover:bg-(--accent-hover-color)"
                >
                  {btnText}
                </Link>
              )}
            </div>
          </div>
          <span className={`${fourClass} -scale-x-100`}>4</span>
        </div>
      </section>
      <img
        src={page404}
        alt="boxes"
        className="pointer-events-none absolute bottom-0 left-1/2 w-[160%] max-w-none -translate-x-1/2 select-none md:w-full md:max-w-4xl"
      />
    </main>
  );
}

export default NotFound;
