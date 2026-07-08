import { Inbox, Mail, Phone } from "lucide-react";
import { isMongoConfigured } from "@/lib/mongodb";
import { listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";
export const metadata = { title: "Form submissions — Radiance Admin" };

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const MODE_LABEL: Record<string, { label: string; cls: string }> = {
  enquiry: { label: "Enquiry", cls: "bg-brand-50 text-brand-700" },
  "site-visit": { label: "Site visit", cls: "bg-amber-50 text-amber-700" },
  visit: { label: "Site visit", cls: "bg-amber-50 text-amber-700" },
  "ai-consultation": { label: "AI consultation", cls: "bg-emerald-50 text-emerald-700" },
};

export default async function LeadsPage() {
  if (!isMongoConfigured()) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-sm text-ink-950/70">
          Connect MongoDB (<code>MONGODB_URI</code>) to see form submissions.
        </p>
      </div>
    );
  }
  const leads = await listLeads();

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Form submissions</h1>
          <p className="mt-1 text-sm text-ink-950/60">
            Every contact-form and AI-consultant enquiry, newest first.
          </p>
        </div>
        <span className="rounded-full bg-ink-950/5 px-3 py-1 text-sm font-medium text-ink-950/70">
          {leads.length} total
        </span>
      </div>

      {leads.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-950/15 bg-white p-10 text-center">
          <Inbox className="mx-auto h-9 w-9 text-ink-950/30" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-ink-950">No submissions yet.</p>
          <p className="mt-1 text-sm text-ink-950/55">
            New contact-form and chat enquiries will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {leads.map((l, i) => {
            const m = MODE_LABEL[l.mode] ?? MODE_LABEL.enquiry;
            return (
              <div
                key={`${l.phone}-${l.createdAt}-${i}`}
                className="rounded-2xl border border-ink-950/10 bg-white p-4 shadow-card sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-950">{l.name || "—"}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.cls}`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs text-ink-950/50">{fmt(l.createdAt)}</p>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-950/75">
                  {l.phone ? (
                    <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                      <Phone className="h-3.5 w-3.5" /> {l.phone}
                    </a>
                  ) : null}
                  {l.email ? (
                    <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                      <Mail className="h-3.5 w-3.5" /> {l.email}
                    </a>
                  ) : null}
                  {l.interest ? <span className="text-ink-950/55">Interest: {l.interest}</span> : null}
                  {l.date ? <span className="text-ink-950/55">Preferred: {l.date}</span> : null}
                </div>

                {l.requirements ? (
                  <p className="mt-2 whitespace-pre-wrap border-l-2 border-brand-500/40 pl-3 text-xs leading-relaxed text-ink-950/70">
                    {l.requirements}
                  </p>
                ) : null}
                {l.shortlist.length ? (
                  <p className="mt-2 text-xs text-ink-950/60">
                    <span className="font-medium text-ink-950/80">Shortlisted:</span>{" "}
                    {l.shortlist.join(", ")}
                  </p>
                ) : null}
                {l.message ? (
                  <p className="mt-2 text-sm text-ink-950/70">{l.message}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
