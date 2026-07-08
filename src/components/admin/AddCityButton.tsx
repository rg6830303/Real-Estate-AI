"use client";

import { useRouter } from "next/navigation";
import { MapPinPlus } from "lucide-react";

/**
 * Create a new city by adding its first property. Cities are derived from the
 * listings, so this routes to the new-property form pre-filled with the city.
 */
export default function AddCityButton() {
  const router = useRouter();
  function addCity() {
    const city = window.prompt("New city name (e.g. Goa, Noida, Mumbai):")?.trim();
    if (!city) return;
    router.push(`/admin/new?city=${encodeURIComponent(city)}`);
  }
  return (
    <button
      onClick={addCity}
      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-950/15 px-3 py-2 text-sm font-medium text-ink-950 transition hover:border-gold-500"
    >
      <MapPinPlus className="h-4 w-4" strokeWidth={1.75} />
      Add new city
    </button>
  );
}
