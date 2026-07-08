import { ShieldCheck, Sparkles } from "lucide-react";
import ChatShell from "@/components/ChatShell";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";

export const metadata = {
  title: `${ADVISOR_NAME} — Your Property Consultant | ${AGENCY_NAME}`,
};

export default function ConsultantPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink-950">
              Meet {ADVISOR_NAME}
            </h1>
            <p className="text-sm text-ink-950/60">
              Your personal property consultant — tell him what you need, he
              will shortlist verified options that truly fit.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-950/60">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
              Verified inventory only
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-gold-500" strokeWidth={1.75} />
              Honest deal analysis
            </span>
          </div>
        </div>

        <ChatShell />
      </main>
      <SiteFooter />
    </>
  );
}
