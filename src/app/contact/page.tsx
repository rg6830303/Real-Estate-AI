import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import ContactForm from "@/components/ContactForm";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { AGENCY_NAME, CONTACT } from "@/lib/config";

export const metadata = {
  title: `Contact — ${AGENCY_NAME}`,
  description:
    "Get in touch with Radiance Realtors. Call, WhatsApp or send an enquiry — or book a site visit for any project.",
};

export default function ContactPage() {
  const details = [
    { Icon: Phone, label: "Call us", value: CONTACT.phone, href: `tel:${CONTACT.phoneHref}` },
    {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: CONTACT.phone,
      href: `https://wa.me/${CONTACT.whatsapp}`,
    },
    { Icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { Icon: MapPin, label: "Serving", value: "Gurugram · Dwarka Expressway · Goa", href: null },
  ];

  return (
    <>
      <SiteHeader />
      <PageHero
        title="Connect with us"
        crumb="Contact"
        subtitle="Our team is here 24/7. Send an enquiry, book a site visit, or ask Ashirvad anything about our properties."
        image="/radiance/locations/loc3.png"
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Details */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink-950">Get in touch</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-950/65">
            Whether you&apos;re buying your first home, upgrading or investing, we&apos;ll guide you
            end to end with honest, verified advice.
          </p>
          <div className="mt-6 space-y-3">
            {details.map(({ Icon, label, value, href }) => {
              const inner = (
                <div className="flex items-center gap-3 rounded-xl border border-ink-950/10 bg-white p-4 shadow-card transition hover:border-gold-500">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-gold-400">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-ink-950/45">{label}</p>
                    <p className="text-sm font-medium text-ink-950">{value}</p>
                  </div>
                </div>
              );
              return href ? (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="block">
                  {inner}
                </a>
              ) : (
                <div key={label}>{inner}</div>
              );
            })}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-ink-950/10 shadow-card">
            <iframe
              title="Radiance Realtors — Gurugram"
              src="https://www.google.com/maps?q=Gurugram,Haryana&output=embed"
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Form */}
        <ContactForm />
      </section>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
