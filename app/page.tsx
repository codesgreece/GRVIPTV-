import { AppsSection } from "@/components/AppsSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { DevicesSection } from "@/components/DevicesSection";
import { FAQSection } from "@/components/FAQSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Hero } from "@/components/Hero";
import { LogosCarousel } from "@/components/LogosCarousel";
import { PricingSection } from "@/components/PricingSection";
import { SetupPreview } from "@/components/SetupPreview";
import { StatsSection } from "@/components/StatsSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />
      <LogosCarousel />
      <FeaturesSection />
      <PricingSection />
      <SetupPreview />
      <AppsSection />
      <DevicesSection />
      <BenefitsSection />
      <FAQSection />
    </>
  );
}
