import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logo from "../../assets/auth/logo.svg";

const NAV_LINKS = [
  { label: "Home", id: "home" },
  { label: "Demo", id: "demo" },
  { label: "Roles", id: "roles" },
  { label: "Features", id: "features" },
];

function LandingNavbar() {
  const location = useLocation();
  const [activeId, setActiveId] = useState("home");
  useEffect(() => {
    if (!location.hash) return;
    document
      .getElementById(location.hash.slice(1))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location]);
  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) =>
      document.getElementById(id),
    ).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-(--border-color)/40 bg-(--page-background)/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="shrink-0">
          <img src={logo} alt="KOSH" className="h-6 w-auto sm:h-7" />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map(({ label, id }) => (
            <Link
              key={id}
              to={{ pathname: "/", hash: `#${id}` }}
              className={`border-b pb-1 text-xs font-semibold transition ${
                activeId === id
                  ? "border-(--text-color) text-(--text-color)"
                  : "border-transparent text-(--secondary-text-color) hover:text-(--text-color)"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-md border border-(--icon-border-color) px-5 py-1.5 text-xs font-medium text-(--text-color) transition hover:bg-(--sidebar-hover-background)"
          >
            Login
          </Link>

          <Link
            to="/role"
            className="rounded-md bg-(--accent-color) px-5 py-1.5 text-xs font-semibold text-(--page-background) transition hover:bg-(--accent-hover-color)"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}

export default LandingNavbar;
