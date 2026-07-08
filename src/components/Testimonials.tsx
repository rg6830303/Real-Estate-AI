import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/site";
import Reveal from "./Reveal";

/** "What Our Clients Say" — testimonial cards with staggered reveal. */
export default function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
        Testimonials
      </p>
      <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
        What our clients say
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 120}>
            <figure className="flex h-full flex-col rounded-2xl border border-ink-950/10 bg-white p-6 shadow-card">
              <Quote className="h-7 w-7 text-gold-400" strokeWidth={1.5} />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-950/75">
                “{t.quote}”
              </blockquote>
              <div className="mt-4 flex items-center gap-0.5 text-gold-500">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-current" strokeWidth={0} />
                ))}
              </div>
              <figcaption className="mt-3 border-t border-ink-950/10 pt-3">
                <p className="text-sm font-semibold text-ink-950">{t.name}</p>
                <p className="text-xs text-ink-950/55">{t.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
