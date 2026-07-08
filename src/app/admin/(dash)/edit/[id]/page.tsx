import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";
import { isMongoConfigured } from "@/lib/mongodb";
import { distinctCities, getProperty } from "@/lib/properties";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  if (!isMongoConfigured()) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-ink-950/70">
        Connect MongoDB (set <code>MONGODB_URI</code>) to edit properties.
      </p>
    );
  }
  const id = decodeURIComponent(params.id);
  const [property, cities] = await Promise.all([getProperty(id), distinctCities()]);
  if (!property) notFound();

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-ink-950/60 transition hover:text-ink-950"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-950">
        Edit: {property.title}
      </h1>
      <p className="mb-6 mt-1 text-sm text-ink-950/60">
        Changes save to the database and update the website and AI immediately.
      </p>
      <PropertyForm initial={property} cities={cities} />
    </>
  );
}
