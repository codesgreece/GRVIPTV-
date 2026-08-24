import { AppsSection } from "@/components/AppsSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { DevicesSection } from "@/components/DevicesSection";
import { FAQSection } from "@/components/FAQSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Hero } from "@/components/Hero";
import { LogosCarousel } from "@/components/LogosCarousel";
import { BecomeResellerSection } from "@/components/BecomeResellerSection";
import { GuaranteeStrip } from "@/components/GuaranteeStrip";
import { LiveOrderLineSection, LivePricingSection } from "@/components/LiveCatalogSections";
import { ReferralSection } from "@/components/ReferralSection";
import { ResellersSection } from "@/components/ResellersSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { SetupPreview } from "@/components/SetupPreview";
import { StatsSection } from "@/components/StatsSection";
import { WhoIsItForSection } from "@/components/WhoIsItForSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />
      <LogosCarousel />
      <FeaturesSection />
      <WhoIsItForSection />
      <ReviewsSection />
      <LivePricingSection />
      <LiveOrderLineSection />
      <ResellersSection />
      <BecomeResellerSection />
      <ReferralSection />
      <GuaranteeStrip />
      <SetupPreview />
      <AppsSection />
      <DevicesSection />
      <BenefitsSection />
      <FAQSection />
    </>
  );
}
