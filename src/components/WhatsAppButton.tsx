"use client";

import { usePathname } from "next/navigation";
import { CONTACT } from "@/lib/config";

/** Official WhatsApp glyph. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16 .396C7.164.396.06 7.5.06 16.336c0 2.877.76 5.577 2.084 7.917L.06 32l7.94-2.05a15.87 15.87 0 0 0 8 2.146h.007c8.836 0 15.94-7.104 15.94-15.94 0-4.26-1.66-8.26-4.676-11.27A15.83 15.83 0 0 0 16 .396zm0 29.06h-.006a13.2 13.2 0 0 1-6.72-1.84l-.48-.286-4.98 1.287 1.33-4.85-.313-.498A13.16 13.16 0 0 1 2.86 16.34C2.86 9.06 8.72 3.2 16.006 3.2c3.53 0 6.847 1.376 9.34 3.872a13.1 13.1 0 0 1 3.868 9.335c0 7.28-5.86 13.05-13.214 13.05zm7.24-9.9c-.397-.198-2.35-1.16-2.714-1.29-.363-.132-.628-.198-.893.2-.264.396-1.023 1.288-1.254 1.552-.23.264-.462.297-.858.099-.397-.198-1.676-.618-3.193-1.97-1.18-1.052-1.976-2.35-2.207-2.747-.23-.396-.024-.61.174-.807.18-.18.397-.462.595-.694.198-.23.264-.396.397-.66.132-.264.066-.495-.033-.694-.099-.198-.892-2.15-1.223-2.943-.322-.773-.65-.668-.893-.68l-.76-.014c-.264 0-.694.099-1.057.495-.363.396-1.387 1.355-1.387 3.307s1.42 3.838 1.618 4.102c.198.264 2.795 4.27 6.77 5.987.945.408 1.683.652 2.258.834.948.302 1.812.26 2.494.157.76-.113 2.35-.96 2.68-1.886.33-.926.33-1.72.23-1.886-.098-.165-.362-.264-.76-.462z" />
    </svg>
  );
}

/**
 * Floating WhatsApp button on every public page, linking to the agency number
 * with a pre-filled message. Hidden on the admin console.
 */
export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    "Hi Radiance Realtors! I'd like to know more about your properties.",
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="group fixed bottom-6 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-panel transition hover:scale-105"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/50" />
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
