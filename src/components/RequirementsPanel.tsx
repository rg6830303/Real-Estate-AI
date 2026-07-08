import {
  Banknote,
  CalendarClock,
  ClipboardList,
  Flame,
  Heart,
  Home,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import type { ClientRequirements } from "@/lib/types";
import clsx from "clsx";

/**
 * Live "what the consultant has understood" panel — the client-visible proof
 * that the AI is actually listening, and the agency-visible qualification
 * card for every lead.
 */
export default function RequirementsPanel({
  requirements: r,
}: {
  requirements: ClientRequirements;
}) {
  const rows: { icon: React.ReactNode; label: string; value: string | null }[] = [
    {
      icon: <Target className="h-3.5 w-3.5" strokeWidth={1.75} />,
      label: "Looking to",
      value:
        r.intent === "unknown"
          ? null
          : r.intent === "buy"
            ? "Buy"
            : r.intent === "rent"
              ? "Rent"
              : "Invest",
    },
    {
      icon: <Banknote className="h-3.5 w-3.5" strokeWidth={1.75} />,
      label: "Budget",
      value: r.budgetLabel,
    },
    {
      icon: <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />,
      label: "Location",
      value:
        r.localities.length > 0
          ? r.localities.join(", ") + (r.city ? ` (${r.city})` : "")
          : r.city,
    },
    {
      icon: <Home className="h-3.5 w-3.5" strokeWidth={1.75} />,
      label: "Configuration",
      value: [r.bhk, r.propertyType].filter(Boolean).join(" · ") || null,
    },
    {
      icon: <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.75} />,
      label: "Timeline",
      value: r.timeline,
    },
    {
      icon: <Banknote className="h-3.5 w-3.5" strokeWidth={1.75} />,
      label: "Financing",
      value: r.financing,
    },
    {
      icon: <Users className="h-3.5 w-3.5" strokeWidth={1.75} />,
      label: "Family",
      value: r.familyContext,
    },
    {
      icon: <Heart className="h-3.5 w-3.5" strokeWidth={1.75} />,
      label: "Must-haves",
      value: r.mustHaves.length ? r.mustHaves.join(", ") : null,
    },
  ];

  const filled = rows.filter((row) => row.value);
  const progress = Math.round((filled.length / rows.length) * 100);

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-ink-950/10 bg-white shadow-panel">
      <div className="flex items-center justify-between border-b border-ink-950/10 px-4 py-3">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-950">
          <ClipboardList className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
          Your requirements
        </p>
        <TemperatureBadge temperature={r.temperature} score={r.score} />
      </div>

      <div className="px-4 pt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-950/10">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-ink-950/50">
          {filled.length === 0
            ? "As we chat, I'll note down what matters to you here."
            : `Understanding your needs — ${filled.length} of ${rows.length} captured`}
        </p>
      </div>

      <div className="chat-scroll flex-1 space-y-1 overflow-y-auto px-4 py-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className={clsx(
              "flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-xs",
              row.value ? "text-ink-950" : "text-ink-950/35",
            )}
          >
            <span
              className={clsx(
                "mt-0.5 shrink-0",
                row.value ? "text-brand-600" : "text-ink-950/30",
              )}
            >
              {row.icon}
            </span>
            <span className="w-24 shrink-0 font-medium">{row.label}</span>
            <span className="min-w-0 break-words">
              {row.value ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function TemperatureBadge({
  temperature,
  score,
}: {
  temperature: ClientRequirements["temperature"];
  score: number;
}) {
  if (temperature === "new") return null;
  const styles: Record<string, string> = {
    hot: "bg-red-50 text-red-600",
    warm: "bg-amber-50 text-amber-600",
    cold: "bg-sky-50 text-sky-600",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
        styles[temperature],
      )}
      title={`Qualification score: ${score}/100`}
    >
      <Flame className="h-3 w-3" strokeWidth={2} />
      {temperature}
    </span>
  );
}
