import { Suspense } from "react";
import ChatWidget from "@/components/ChatWidget";
import PageHero from "@/components/PageHero";
import PropertyFilters from "@/components/PropertyFilters";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { AGENCY_NAME } from "@/lib/config";
import { fetchActiveProperties } from "@/lib/properties";

export const metadata = {
  title: `Properties — ${AGENCY_NAME}`,
  description:
    "Browse verified residential and commercial properties across Gurugram, Dwarka Expressway and Goa. Filter by type, builder, location and budget.",
};

export const revalidate = 300;

export default async function PropertiesPage() {
  const listings = await fetchActiveProperties();

  return (
    <>
      <SiteHeader />
      <PageHero
        title="Properties"
        crumb="Properties"
        subtitle="Verified residential and commercial inventory across Gurugram, Dwarka Expressway and Goa — filter to find your fit, or ask Ashirvad for a tailored shortlist."
      />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Suspense fallback={<p className="text-sm text-ink-950/50">Loading filters…</p>}>
          <PropertyFilters listings={listings} />
        </Suspense>
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
