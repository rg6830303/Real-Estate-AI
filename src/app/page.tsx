import { Building2, ShieldCheck, Sparkles } from "lucide-react";
import ChatShell from "@/components/ChatShell";
import { ADVISOR_NAME, AGENCY_NAME, MARKET_REGION } from "@/lib/config";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-gold-400 shadow-card">
            <Building2 className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink-950">
              {AGENCY_NAME}
            </p>
            <p className="text-xs text-ink-950/60">
              Property consulting · {MARKET_REGION}
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-4 text-xs text-ink-950/60 sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
            RERA-verified inventory
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-gold-500" strokeWidth={1.75} />
            {ADVISOR_NAME}, AI consultant
          </span>
        </div>
      </header>

      <ChatShell />

      <footer className="mt-6 text-center text-[11px] leading-relaxed text-ink-950/45">
        {ADVISOR_NAME} is {AGENCY_NAME}&apos;s digital consultant. Recommendations
        come only from verified listings; final pricing and availability are
        confirmed by our human team before any transaction.
      </footer>
    </main>
  );
}
