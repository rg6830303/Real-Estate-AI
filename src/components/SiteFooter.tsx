import Link from "next/link";
import { Facebook, Globe, Mail, MapPin, Phone } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-gold-500/20 bg-ink-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <BrandLogo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Premium residences and smart investments, guided with trust,
            integrity and excellence — from luxury floors in Gurugram to
            holiday homes in Goa.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-300">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {[
              ["Properties", "/properties"],
              ["About Us", "/about-us"],
              ["Mission & Vision", "/mission-vission"],
              ["Contact", "/contact"],
              [`Chat with ${ADVISOR_NAME}`, "/consultant"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-gold-300">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-300">
            Markets we serve
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {["Gurugram (Gurgaon)", "Delhi", "Goa"].map((m) => (
              <li key={m} className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.75} />
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-300">
            Reach us
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-400" strokeWidth={1.75} />
              Plot #11, Sector 41, Gurugram, Haryana
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.75} />
              <a href="tel:+919818099292" className="transition hover:text-gold-300">
                +91 98180 99292
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.75} />
              <a href="tel:+919899196999" className="transition hover:text-gold-300">
                +91 98991 96999
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.75} />
              <a
                href="mailto:info@radiancerealtors.in"
                className="transition hover:text-gold-300"
              >
                info@radiancerealtors.in
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.75} />
              <a
                href="https://www.radiancerealtors.com"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-gold-300"
              >
                radiancerealtors.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Facebook className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.75} />
              <a
                href="https://www.facebook.com/Radiancerealtors"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-gold-300"
              >
                @Radiancerealtors
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-[11px] text-white/40">
        © {new Date().getFullYear()} {AGENCY_NAME}. {ADVISOR_NAME} is our digital
        consultant — recommendations come only from verified listings; final
        pricing and availability are confirmed by our human team.
      </div>
    </footer>
  );
}
