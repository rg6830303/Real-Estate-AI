"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { AGENCY_NAME } from "@/lib/config";

/**
 * Brand logo with a drop-in slot for the client's real artwork:
 * place the official file at `public/logo.png` (unchanged, any size —
 * it renders at 40px height) and it appears everywhere automatically.
 *
 * The file is probed via a JS Image() in an effect rather than an inline
 * <img onError>: a static 404 resolves before React hydrates, which would
 * swallow the error event and leave broken-image alt text on screen.
 */
export default function BrandLogo({ subtitle }: { subtitle?: string }) {
  const [hasLogoFile, setHasLogoFile] = useState(false);

  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setHasLogoFile(true);
    probe.src = "/logo.png";
  }, []);

  return (
    <span className="flex items-center gap-3">
      {hasLogoFile ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.png" alt={`${AGENCY_NAME} logo`} className="h-10 w-auto" />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-500/40 bg-ink-900 text-gold-400">
          <Building2 className="h-5 w-5" strokeWidth={1.75} />
        </span>
      )}
      <span>
        <span className="block text-base font-semibold tracking-wide text-white">
          {AGENCY_NAME.toUpperCase()}
        </span>
        {subtitle ? (
          <span className="block text-[10px] uppercase tracking-[0.2em] text-gold-300/80">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
