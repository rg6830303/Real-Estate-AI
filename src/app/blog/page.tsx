import { ArrowUpRight, CalendarDays } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { AGENCY_NAME, CONTACT } from "@/lib/config";

export const metadata = {
  title: `Blog — ${AGENCY_NAME}`,
  description: "Insights on Gurugram and Sohna real estate — projects, corridors and investment guides.",
};

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

const POSTS: Post[] = [
  {
    slug: "why-bellavista-gurgaon-smart-investment-2025",
    title: "Why Bellavista Gurgaon is a smart investment in 2025",
    excerpt:
      "Central Park Bellavista in Sector 48 pairs serviced-residence convenience with strong rental demand. Here's why investors are taking note.",
    date: "Jun 2025",
    image: "/radiance/props/bellavista.jpg",
  },
  {
    slug: "central-park-sohna-road-flower-valley-apartments",
    title: "Central Park Flower Valley: township living on Sohna Road",
    excerpt:
      "Inside the amenities, connectivity and lifestyle of one of Sohna's most ambitious integrated townships.",
    date: "May 2025",
    image: "/radiance/props/aqua.png",
  },
  {
    slug: "living-in-sector-48-bellavista-location-advantage",
    title: "Living in Sector 48: the Bellavista location advantage",
    excerpt:
      "Schools, offices, connectivity and resale — what makes Sohna Road's Sector 48 a consistently strong address.",
    date: "Apr 2025",
    image: "/radiance/props/belgravia.jpg",
  },
  {
    slug: "bignonia-towers-sohna-gurgaon",
    title: "Bignonia Towers, Sohna: grand residences for growing families",
    excerpt:
      "Large-format 3 & 4 BHK homes in the Flower Valley township — a look at layouts, pricing and appreciation potential.",
    date: "Mar 2025",
    image: "/radiance/props/bignonia.webp",
  },
  {
    slug: "the-orchard-sohna-gurgaon",
    title: "The Orchard, Sohna: boutique low-rise floor living",
    excerpt:
      "Independent floors with township amenities — the format quietly winning over Gurugram's end-users.",
    date: "Feb 2025",
    image: "/radiance/props/flamingo.png",
  },
];

export default function BlogPage() {
  return (
    <>
      <SiteHeader />
      <PageHero
        title="Our Blog"
        crumb="Blog"
        subtitle="Market insights, project deep-dives and investment guides across Gurugram and Sohna."
        image="/radiance/locations/loc2.png"
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 100}>
              <a
                href={`${CONTACT.website}/blog-detail/${p.slug}`}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-950/10 bg-white shadow-card transition hover:shadow-panel"
              >
                <div
                  className="h-44 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${p.image})` }}
                />
                <div className="flex flex-1 flex-col p-5">
                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-950/45">
                    <CalendarDays className="h-3.5 w-3.5" /> {p.date}
                  </p>
                  <h2 className="mt-2 text-base font-semibold leading-snug text-ink-950">
                    {p.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-950/65">{p.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                    Read more <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
