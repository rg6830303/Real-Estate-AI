import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";
import { isMongoConfigured } from "@/lib/mongodb";
import { distinctCities } from "@/lib/properties";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: { city?: string | string[] };
}) {
  const configured = isMongoConfigured();
  const cities = configured ? await distinctCities() : [];
  const defaultCity = Array.isArray(searchParams.city) ? searchParams.city[0] : searchParams.city;

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-ink-950/60 transition hover:text-ink-950"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-950">Add a property</h1>
      <p className="mb-6 mt-1 text-sm text-ink-950/60">
        Enter a new or existing city to organise it. Uploaded photos and video reflect on the
        website and to the AI instantly.
      </p>
      {configured ? (
        <PropertyForm cities={cities} defaultCity={defaultCity} />
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-ink-950/70">
          Connect MongoDB (set <code>MONGODB_URI</code>) to add properties.
        </p>
      )}
    </>
  );
}
