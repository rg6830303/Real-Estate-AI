import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Logo from "./Logo";
import { ADVISOR_NAME, AGENCY_NAME, CONTACT } from "@/lib/config";
import { BUILDERS, LOCATIONS, NAV_LINKS } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-gold-500/20 bg-ink-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        {/* Brand */}
        <div>
          <Logo height={52} href={null} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Premium residences and smart investments, guided with trust,
            integrity and excellence — from luxury floors and sky villas in
            Gurugram to holiday homes in Goa.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[
              { Icon: Facebook, href: CONTACT.facebook, label: "Facebook" },
              { Icon: Instagram, href: CONTACT.instagram, label: "Instagram" },
              { Icon: Linkedin, href: CONTACT.linkedin, label: "LinkedIn" },
              { Icon: MessageCircle, href: `https://wa.me/${CONTACT.whatsapp}`, label: "WhatsApp" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/70 transition hover:border-gold-400 hover:text-gold-300"
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-300">
            Quick links
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/career" className="transition hover:text-gold-300">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        {/* Builders + locations */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-300">
            Top builders
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {BUILDERS.slice(0, 5).map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/properties?builder=${b.slug}`}
                  className="transition hover:text-gold-300"
                >
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.15em] text-gold-300">
            Locations
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {LOCATIONS.map((l) => (
              <li key={l.slug} className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.75} />
                {l.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Reach us */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-300">
            Connect with us
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold-400" strokeWidth={1.75} />
              <a href={`tel:${CONTACT.phoneHref}`} className="transition hover:text-gold-300">
                {CONTACT.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold-400" strokeWidth={1.75} />
              <a href={`mailto:${CONTACT.email}`} className="transition hover:text-gold-300">
                {CONTACT.email}
              </a>
            </li>
          </ul>
          <Link
            href="/consultant"
            className="mt-5 inline-block rounded-lg border border-gold-500/50 px-4 py-2 text-sm font-medium text-gold-300 transition hover:bg-gold-500 hover:text-ink-950"
          >
            Chat with {ADVISOR_NAME}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-[11px] text-white/40">
        © {new Date().getFullYear()} {AGENCY_NAME}. All rights reserved. ·{" "}
        <Link href="/page/privacy-policy" className="hover:text-gold-300">
          Privacy Policy
        </Link>{" "}
        ·{" "}
        <span>
          {ADVISOR_NAME} is our AI consultant — recommendations come only from
          verified listings; final pricing and availability are confirmed by our
          team.
        </span>
      </div>
    </footer>
  );
}
