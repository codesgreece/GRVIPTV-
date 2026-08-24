"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LiveChat } from "@/components/LiveChat";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SpinWheelPopup } from "@/components/SpinWheelPopup";
import { StickyTelegramBar } from "@/components/StickyTelegramBar";

function isPortalRoute(pathname: string) {
  return pathname === "/admingr" || pathname.startsWith("/admingr/") || pathname.startsWith("/account/");
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const portal = isPortalRoute(pathname);

  if (portal) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyTelegramBar />
      <SpinWheelPopup />
      <LiveChat />
      <ScrollToTop />
    </>
  );
}
