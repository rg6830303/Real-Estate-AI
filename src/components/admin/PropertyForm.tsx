"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import type { PropertyListing } from "@/lib/types";

const TYPES = ["Apartment", "Builder Floor", "Villa", "Penthouse", "Plot", "Commercial"];
const INTENTS: { key: "buy" | "rent" | "invest"; label: string }[] = [
  { key: "buy", label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "invest", label: "Invest" },
];

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/media", { method: "POST", body: fd });
  const d = await res.json().catch(() => null);
  if (!res.ok) throw new Error(d?.error ?? "Upload failed.");
  return d.url as string;
}

const input =
  "w-full rounded-lg border border-ink-950/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500";
const label = "mb-1 block text-xs font-medium text-ink-950/60";

export default function PropertyForm({
  initial,
  cities,
  defaultCity,
}: {
  initial?: PropertyListing | null;
  cities: string[];
  defaultCity?: string;
}) {
  const router = useRouter();
  const editing = !!initial;

  const [f, setF] = useState({
    title: initial?.title ?? "",
    developer: initial?.developer ?? "",
    city: initial?.city ?? defaultCity ?? "",
    locality: initial?.locality ?? "",
    propertyType: initial?.propertyType ?? "Apartment",
    bhk: initial?.bhk ?? "",
    priceCr: initial?.priceCr?.toString() ?? "",
    areaSqft: initial?.areaSqft?.toString() ?? "",
    possession: initial?.possession ?? "Ready to move",
    possessionDate: initial?.possessionDate ?? "",
    reraId: initial?.reraId ?? "",
    highlights: initial?.highlights ?? "",
    amenities: (initial?.amenities ?? []).join(", "),
  });
  const [intentFit, setIntentFit] = useState<string[]>(initial?.intentFit ?? ["buy"]);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [active, setActive] = useState(initial?.active ?? true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  function toggleIntent(key: string) {
    setIntentFit((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initial?.id ?? null,
          title: f.title,
          developer: f.developer,
          city: f.city,
          locality: f.locality,
          propertyType: f.propertyType,
          bhk: f.bhk,
          priceCr: Number(f.priceCr),
          areaSqft: Number(f.areaSqft),
          possession: f.possession,
          possessionDate: f.possessionDate,
          reraId: f.reraId,
          highlights: f.highlights,
          amenities: f.amenities.split(",").map((a) => a.trim()).filter(Boolean),
          intentFit,
          imageUrl,
          videoUrl,
          gallery,
          active,
        }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok) throw new Error(d?.error ?? "Could not save.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      {/* Core details */}
      <section className="rounded-2xl border border-ink-950/10 bg-white p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-ink-950">Property details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={label}>Project title *</span>
            <input required value={f.title} onChange={set("title")} className={input} placeholder="e.g. Central Park Aqua Front Towers" />
          </label>
          <label className="block">
            <span className={label}>Developer</span>
            <input value={f.developer} onChange={set("developer")} className={input} placeholder="e.g. Central Park" />
          </label>
          <label className="block">
            <span className={label}>City *</span>
            <input required list="city-list" value={f.city} onChange={set("city")} className={input} placeholder="e.g. Gurugram / Goa / Delhi" />
            <datalist id="city-list">
              {cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Locality / address</span>
            <input value={f.locality} onChange={set("locality")} className={input} placeholder="e.g. Sector 32-33, Sohna (Flower Valley)" />
          </label>
          <label className="block">
            <span className={label}>Type</span>
            <select value={f.propertyType} onChange={set("propertyType")} className={input}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>Configuration (BHK)</span>
            <input value={f.bhk} onChange={set("bhk")} className={input} placeholder="e.g. 3 BHK (blank for plot/commercial)" />
          </label>
          <label className="block">
            <span className={label}>Price (₹ Cr) *</span>
            <input required type="number" step="0.01" min="0" value={f.priceCr} onChange={set("priceCr")} className={input} placeholder="e.g. 2.65" />
          </label>
          <label className="block">
            <span className={label}>Area (sq ft)</span>
            <input type="number" min="0" value={f.areaSqft} onChange={set("areaSqft")} className={input} placeholder="e.g. 1590" />
          </label>
          <label className="block">
            <span className={label}>Possession</span>
            <select value={f.possession} onChange={set("possession")} className={input}>
              <option>Ready to move</option>
              <option>Under construction</option>
            </select>
          </label>
          <label className="block">
            <span className={label}>Possession date (if under construction)</span>
            <input value={f.possessionDate} onChange={set("possessionDate")} className={input} placeholder="e.g. Dec 2027" />
          </label>
          <label className="block">
            <span className={label}>RERA ID</span>
            <input value={f.reraId} onChange={set("reraId")} className={input} placeholder="Official HRERA no." />
          </label>
          <div className="block">
            <span className={label}>Good for</span>
            <div className="flex gap-2">
              {INTENTS.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => toggleIntent(it.key)}
                  className={
                    "rounded-lg border px-3 py-2 text-xs font-medium transition " +
                    (intentFit.includes(it.key)
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-ink-950/15 text-ink-950/60")
                  }
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block sm:col-span-2">
            <span className={label}>Amenities (comma separated)</span>
            <input value={f.amenities} onChange={set("amenities")} className={input} placeholder="Clubhouse, Swimming pool, Gated community" />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Consultant note / highlights</span>
            <textarea rows={3} value={f.highlights} onChange={set("highlights")} className={input} placeholder="One or two lines the AI can use to explain why this stands out." />
          </label>
        </div>
      </section>

      {/* Media */}
      <section className="rounded-2xl border border-ink-950/10 bg-white p-5 shadow-card">
        <h2 className="mb-1 text-sm font-semibold text-ink-950">Photos & video</h2>
        <p className="mb-4 text-xs text-ink-950/50">
          Uploads are stored in your database and served to the website and AI instantly. For large
          videos, paste a hosted URL (YouTube/Vimeo/CDN) instead.
        </p>

        <MediaField
          kind="image"
          label="Primary photo"
          value={imageUrl}
          onChange={setImageUrl}
          onError={setError}
        />
        <div className="mt-5">
          <MediaField
            kind="video"
            label="Walkthrough video"
            value={videoUrl}
            onChange={setVideoUrl}
            onError={setError}
          />
        </div>
        <div className="mt-5">
          <GalleryField value={gallery} onChange={setGallery} onError={setError} />
        </div>
      </section>

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-ink-950/70">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Active (visible on site &amp; to AI)
        </label>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {editing ? "Save changes" : "Create property"}
        </button>
      </div>
    </form>
  );
}

function MediaField({
  kind,
  label: lbl,
  value,
  onChange,
  onError,
}: {
  kind: "image" | "video";
  label: string;
  value: string;
  onChange: (v: string) => void;
  onError: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    onError("");
    try {
      onChange(await uploadFile(file));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }
  return (
    <div>
      <span className={label}>{lbl}</span>
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-20 w-28 rounded-lg border border-ink-950/10 object-cover" />
          ) : (
            <video src={value} className="h-20 w-28 rounded-lg border border-ink-950/10 object-cover" muted />
          )
        ) : (
          <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-ink-950/20 text-ink-950/30">
            {kind === "image" ? <ImagePlus className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-ink-950/15 px-3 py-2 text-xs font-medium text-ink-950 transition hover:border-gold-500">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload {kind}
            <input type="file" accept={`${kind}/*`} onChange={onPick} className="hidden" />
          </label>
          <div className="flex items-center gap-2">
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="…or paste a URL"
              className="flex-1 rounded-lg border border-ink-950/15 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-500"
            />
            {value ? (
              <button type="button" onClick={() => onChange("")} className="text-ink-950/40 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryField({
  value,
  onChange,
  onError,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  onError: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    onError("");
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await uploadFile(file));
      onChange([...value, ...urls]);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }
  return (
    <div>
      <span className={label}>Gallery photos</span>
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-20 w-28 rounded-lg border border-ink-950/10 object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
              aria-label="Remove photo"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex h-20 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-ink-950/20 text-ink-950/40 transition hover:border-gold-500">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <input type="file" accept="image/*" multiple onChange={onPick} className="hidden" />
        </label>
      </div>
    </div>
  );
}
