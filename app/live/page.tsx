import type { Metadata } from "next";
import { LivePageClient } from "@/components/live/LivePageClient";

export const metadata: Metadata = {
  title: "Live TV",
  description:
    "Watch live TV channels on GRVIP OTT — browse by category, search instantly, and stream premium live content.",
  openGraph: {
    title: "Live TV | GRVIP OTT",
    description:
      "Watch live TV channels organized by category with instant search and favorites.",
  },
};

export default function LivePage() {
  return <LivePageClient />;
}
