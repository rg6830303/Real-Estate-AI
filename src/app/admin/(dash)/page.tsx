import Link from "next/link";
import { Building2, Database, MapPin, Pencil, PlayCircle } from "lucide-react";
import AddCityButton from "@/components/admin/AddCityButton";
import DbStats from "@/components/admin/DbStats";
import DeleteButton from "@/components/admin/DeleteButton";
import { isMongoConfigured } from "@/lib/mongodb";
import { listAllProperties } from "@/lib/properties";
import { formatArea, formatPriceCr } from "@/lib/format";
import type { PropertyListing } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!isMongoConfigured()) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <Database className="mx-auto h-10 w-10 text-amber-500" strokeWidth={1.5} />
        <h1 className="mt-3 text-lg font-semibold text-ink-950">Connect your database</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-950/70">
          Set <code className="rounded bg-white px-1.5 py-0.5 text-xs">MONGODB_URI</code> in your
          Vercel project&apos;s Environment Variables, then redeploy. The admin console reads and
          writes that database directly.
        </p>
      </div>
    );
  }

  const listings = await listAllProperties();
  const byCity = new Map<string, PropertyListing[]>();
  for (const p of listings) {
    const arr = byCity.get(p.city) ?? [];
    arr.push(p);
    byCity.set(p.city, arr);
  }
  const cities = [...byCity.keys()].sort();
  const activeCount = listings.filter((p) => p.active).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Properties</h1>
          <p className="mt-1 text-sm text-ink-950/60">
            Manage inventory city-wise. Changes reach the website and AI consultant immediately.
          </p>
        </div>
        <AddCityButton />
      </div>

      {/* Stats + live storage */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1.4fr]">
        {[
          { label: "Total listings", value: listings.length },
          { label: "Cities", value: cities.length },
          { label: "Active", value: activeCount },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col justify-center rounded-2xl border border-ink-950/10 bg-white p-5 shadow-card"
          >
            <p className="text-3xl font-semibold text-ink-950">{s.value}</p>
            <p className="text-xs text-ink-950/55">{s.label}</p>
          </div>
        ))}
        <DbStats />
      </div>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-950/15 bg-white p-10 text-center">
          <Building2 className="mx-auto h-9 w-9 text-ink-950/30" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-ink-950">No properties yet.</p>
          <Link
            href="/admin/new"
            className="mt-4 inline-block rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Add your first property
          </Link>
        </div>
      ) : null}

      {/* City-wise groups */}
      <div className="mt-8 space-y-8">
        {cities.map((city) => {
          const items = byCity.get(city)!;
          return (
            <section key={city}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-ink-950">
                  <MapPin className="h-4 w-4 text-brand-600" strokeWidth={2} />
                  {city}
                  <span className="rounded-full bg-ink-950/5 px-2 py-0.5 text-xs font-medium text-ink-950/60">
                    {items.length}
                  </span>
                </h2>
                <Link
                  href={`/admin/new?city=${encodeURIComponent(city)}`}
                  className="text-sm font-medium text-brand-700 hover:text-brand-600"
                >
                  + Add in {city}
                </Link>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-ink-950/10 bg-white shadow-card">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-ink-950/10 text-[11px] uppercase tracking-wide text-ink-950/45">
                    <tr>
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Area</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-950/5">
                    {items.map((p) => (
                      <tr key={p.id} className={p.active ? "" : "opacity-55"}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-950/5">
                              {p.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 truncate font-medium text-ink-950">
                                {p.title}
                                {p.videoUrl ? (
                                  <PlayCircle className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                                ) : null}
                              </p>
                              <p className="truncate text-xs text-ink-950/50">
                                {p.developer ? `${p.developer} · ` : ""}
                                {p.locality}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-950/70">
                          {p.bhk ? `${p.bhk} ` : ""}
                          {p.propertyType}
                        </td>
                        <td className="px-4 py-3 font-medium text-ink-950">
                          {formatPriceCr(p.priceCr)}
                        </td>
                        <td className="px-4 py-3 text-ink-950/70">
                          {p.areaSqft ? formatArea(p.areaSqft) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              p.possession === "Ready to move"
                                ? "rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
                                : "rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                            }
                          >
                            {p.possession}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/edit/${encodeURIComponent(p.id)}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-ink-950/15 px-2.5 py-1.5 text-xs font-medium text-ink-950 transition hover:border-gold-500"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </Link>
                            <DeleteButton id={p.id} title={p.title} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
