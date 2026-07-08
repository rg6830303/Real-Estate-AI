import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import ContactForm from "@/components/ContactForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";
import Link from "next/link";

export const metadata = {
  title: `Contact Us | Get in Touch with ${AGENCY_NAME}`,
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh]">
        <section className="bg-ink-950 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
              Contact us
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Let's find what you're looking for
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Call, write, or drop your details below — our team responds
              quickly. Prefer instant answers? {ADVISOR_NAME} is online right
              now.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              {[
                {
                  icon: MapPin,
                  title: "Visit us",
                  lines: ["Plot #11, Sector 41", "Gurugram, Haryana, India"],
                },
                {
                  icon: Phone,
                  title: "Call us",
                  lines: ["+91 98180 99292", "+91 98991 96999"],
                },
                {
                  icon: Mail,
                  title: "Write to us",
                  lines: ["info@radiancerealtors.in"],
                },
                {
                  icon: Clock,
                  title: "Office hours",
                  lines: ["Mon – Sun, 10:00 AM – 7:00 PM IST"],
                },
              ].map(({ icon: Icon, title, lines }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-xl border border-ink-950/10 bg-white p-5 shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-950 text-gold-400">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-950">{title}</p>
                    {lines.map((l) => (
                      <p key={l} className="text-sm text-ink-950/65">
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-ink-950 p-5 text-white">
                <p className="text-sm font-semibold">Want answers right now?</p>
                <p className="mt-1 text-sm text-white/65">
                  {ADVISOR_NAME} can understand your requirement and shortlist
                  verified options in minutes.
                </p>
                <Link
                  href="/consultant"
                  className="mt-4 inline-block rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                  Chat with {ADVISOR_NAME}
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-ink-950/10 bg-white p-7 shadow-panel">
              <h2 className="text-lg font-semibold text-ink-950">
                Send us an enquiry
              </h2>
              <p className="mt-1 text-sm text-ink-950/60">
                Share a few details and we'll call you back.
              </p>
              <div className="mt-5">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
