import Link from "next/link";
import Image from "next/image";
import { AGENCY_NAME } from "@/lib/config";

/**
 * Radiance Realtors brand lockup — the real gold "R" emblem + wordmark,
 * self-hosted from /public/radiance/logo.png. `showText` adds the agency
 * name beside the mark for tight header layouts.
 */
export default function Logo({
  className = "",
  height = 44,
  href = "/",
}: {
  className?: string;
  height?: number;
  href?: string | null;
}) {
  const img = (
    <Image
      src="/radiance/logo.png"
      alt={`${AGENCY_NAME} logo`}
      width={Math.round(height * 1.1)}
      height={height}
      priority
      className="h-auto w-auto object-contain"
      style={{ height, width: "auto" }}
    />
  );

  if (href === null) return <span className={className}>{img}</span>;

  return (
    <Link href={href} className={`inline-flex items-center ${className}`} aria-label={AGENCY_NAME}>
      {img}
    </Link>
  );
}
