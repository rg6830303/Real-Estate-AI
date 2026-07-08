"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import clsx from "clsx";
import Logo from "./Logo";
import { WhatsAppIcon } from "./WhatsAppButton";
import { ADVISOR_NAME, CONTACT } from "@/lib/config";
import { NAV_LINKS } from "@/lib/site";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-ink-950/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo height={44} />

        <nav className="hidden items-center gap-6 text-sm text-white/80 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-gold-300">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${CONTACT.phoneHref}`}
            className="hidden items-center gap-1.5 text-sm text-white/80 transition hover:text-gold-300 xl:flex"
          >
            <Phone className="h-4 w-4" strokeWidth={1.75} />
            {CONTACT.phone}
          </a>
          <a
            href={`https://wa.me/${CONTACT.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp us"
            className="hidden items-center gap-1.5 rounded-lg border border-[#25D366]/40 px-2.5 py-1.5 text-sm font-medium text-[#25D366] transition hover:bg-[#25D366] hover:text-white sm:flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="hidden lg:inline">WhatsApp</span>
          </a>
          <Link
            href="/consultant"
            className="hidden rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 shadow-card transition hover:bg-gold-400 sm:block"
          >
            Talk to {ADVISOR_NAME}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-lg border border-white/15 p-2 text-white lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "overflow-hidden border-t border-white/10 bg-ink-950 transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-gold-300"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/consultant"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-lg bg-gold-500 px-3 py-2 text-center text-sm font-semibold text-ink-950"
          >
            Talk to {ADVISOR_NAME}
          </Link>
        </nav>
      </div>
    </header>
  );
}
