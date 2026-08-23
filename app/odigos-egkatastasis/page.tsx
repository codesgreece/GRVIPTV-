import type { Metadata } from "next";
import { SetupPageHero } from "@/components/SetupPageHero";
import { SetupSupportBlocks } from "@/components/SetupSupportBlocks";
import { SetupWizard } from "@/components/SetupWizard";

export const metadata: Metadata = {
  title: "Οδηγός Εγκατάστασης",
  description:
    "Ξεκινήστε το GRVIP OTT στη συσκευή σας σε λίγα λεπτά με αναλυτικό setup wizard βήμα προς βήμα.",
};

export default function OdigosPage() {
  return (
    <>
      <SetupPageHero />
      <SetupWizard />
      <SetupSupportBlocks />
    </>
  );
}
