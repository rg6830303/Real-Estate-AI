import Link from "next/link";
import { Building2, Facebook, Globe, MapPin } from "lucide-react";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-gold-500/20 bg-ink-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-500/40 bg-ink-900 text-gold-400">
              <Building2 className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="text-base font-semibold tracking-wide">
              {AGENCY_NAME.toUpperCase()}
            </p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Premium residences and smart investments, guided with trust,
            integrity and excellence — from luxury floors in Gurugram to
            holiday homes in Goa.
          </p>
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
          <Link
            href="/consultant"
            className="mt-5 inline-block rounded-lg border border-gold-500/50 px-4 py-2 text-sm font-medium text-gold-300 transition hover:bg-gold-500 hover:text-ink-950"
          >
            Chat with {ADVISOR_NAME}
          </Link>
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
