"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { contactConfig } from "@/lib/contact";
import { footerNav } from "@/lib/navigation";

export function Footer() {
  return (
    <footer className="relative mt-8 border-t border-gold/15 bg-[#080808]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="container-premium grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-1">
          <Image
            src="/images/logo.png"
            alt="GRVIP OTT"
            width={180}
            height={56}
            className="h-12 w-auto"
          />
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            Το GRVIP OTT σας προσφέρει μία premium εμπειρία ψυχαγωγίας με υψηλή
            ποιότητα και εύκολη πρόσβαση.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              {
                href: contactConfig.facebook,
                icon: FacebookIcon,
                label: "Facebook",
              },
              { href: contactConfig.telegram, icon: Send, label: "Telegram" },
              {
                href: contactConfig.whatsapp,
                icon: MessageCircle,
                label: "WhatsApp",
              },
              {
                href: contactConfig.instagram,
                icon: InstagramIcon,
                label: "Instagram",
              },
              {
                href: contactConfig.youtube,
                icon: YoutubeIcon,
                label: "YouTube",
              },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-text-muted transition hover:border-gold/40 hover:text-gold"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Πλοήγηση" links={footerNav.navigation} />
        <FooterColumn title="Πληροφορίες" links={footerNav.info} />
        <FooterColumn title="Υποστήριξη" links={footerNav.support} />

        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.18em] text-gold uppercase">
            Τρόποι Πληρωμής
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Card", "Bank", "Crypto", "E-Wallet"].map((method) => (
              <span
                key={method}
                className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-text-dim"
              >
                {method}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-dim">
            Generic placeholders — ενημερώστε με τις πραγματικές μεθόδους σας.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-premium flex flex-col items-center justify-between gap-3 py-6 text-center text-sm text-text-dim md:flex-row md:text-left">
          <p>© 2026 GRVIP OTT. Με επιφύλαξη παντός δικαιώματος.</p>
          <p>Κατασκευασμένο με ❤️ για την καλύτερη εμπειρία streaming.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold tracking-[0.18em] text-gold uppercase">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={`${title}-${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm text-text-muted transition hover:text-gold"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
