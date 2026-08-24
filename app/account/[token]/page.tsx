import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountPortal } from "@/components/AccountPortal";
import { getCustomerByToken } from "@/lib/customers/store";
import { isValidMagicToken } from "@/lib/customers/token";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AccountPageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Ο λογαριασμός μου",
  robots: { index: false, follow: false },
};

export default async function AccountPage({ params }: AccountPageProps) {
  const { token } = await params;

  if (!isValidMagicToken(token)) notFound();

  const customer = await getCustomerByToken(token);
  if (!customer) notFound();

  return <AccountPortal customer={customer} />;
}
