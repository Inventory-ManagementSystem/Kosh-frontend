import LandingNavbar from "../../components/landing/LandingNavbar";
import HeroSection from "../../components/landing/HeroSection";
import DemoSection from "../../components/landing/DemoSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import ReportsSection from "../../components/landing/ReportsSection";
import ContactSection from "../../components/landing/ContactSection";
import FaqSection from "../../components/landing/FaqSection";
import useSmoothScroll from "../../hooks/useSmoothScroll";

function LandingPage() {
  useSmoothScroll();
  return (
    <div className="relative min-h-screen overflow-x-clip bg-(--page-background) text-(--text-color)">
      <LandingNavbar />
      <main>
        <HeroSection />
        <DemoSection />
        <FeaturesSection />
        <ReportsSection />
        <FaqSection />
        <ContactSection />
      </main>
    </div>
  );
}

export default LandingPage;
