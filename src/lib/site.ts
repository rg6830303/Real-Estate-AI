/**
 * Static marketing content mirrored from radiancerealtors.com — builders,
 * service locations, milestones, testimonials and the value proposition.
 * Kept in one module so pages stay declarative and easy to update.
 */

export interface Builder {
  name: string;
  /** Slug used in /properties?builder=… filtering. */
  slug: string;
}

/** The eight developer brands Radiance represents (homepage "Browse Builders"). */
export const BUILDERS: Builder[] = [
  { name: "DLF", slug: "dlf" },
  { name: "Emaar", slug: "emaar" },
  { name: "M3M", slug: "m3m" },
  { name: "Central Park", slug: "central-park" },
  { name: "Elan Group", slug: "elan" },
  { name: "Spaze", slug: "spaze" },
  { name: "Godrej", slug: "godrej" },
  { name: "Central Park Flower Valley", slug: "central-park-flower-valley" },
];

export interface ServiceLocation {
  name: string;
  slug: string;
  blurb: string;
  image: string;
}

/** Trending locations (real Radiance scenics, self-hosted in /public). */
export const LOCATIONS: ServiceLocation[] = [
  {
    name: "Gurgaon",
    slug: "gurgaon",
    blurb: "India's millennium city — luxury towers, floors and offices across the Golf Course and Sohna corridors.",
    image: "/radiance/locations/loc3.png",
  },
  {
    name: "Dwarka Expressway",
    slug: "dwarka-expressway",
    blurb: "The fastest-appreciating NCR corridor, connecting Delhi to New Gurugram with new-generation projects.",
    image: "/radiance/locations/loc2.png",
  },
  {
    name: "Goa",
    slug: "goa",
    blurb: "Holiday homes and second residences by the coast — lifestyle investments with strong rental demand.",
    image: "/radiance/locations/loc1.png",
  },
];

export interface Milestone {
  value: string;
  label: string;
}

/** "What Numbers Say — Our Milestones" strip. */
export const MILESTONES: Milestone[] = [
  { value: "25+", label: "Years of expertise" },
  { value: "5000+", label: "Happy customers" },
  { value: "100+", label: "Premium properties" },
  { value: "120+", label: "Projects delivered" },
];

export interface WhyPoint {
  title: string;
  body: string;
}

/** "Why Choose Us" — mirrors the agency's stated values. */
export const WHY_US: WhyPoint[] = [
  {
    title: "Ethics & transparency",
    body: "We uphold the highest ethical standards in the industry, maintaining transparency and integrity in every transaction.",
  },
  {
    title: "Sustainable practices",
    body: "We integrate sustainable, eco-friendly practices into our projects, promoting environmentally responsible real estate.",
  },
  {
    title: "Deep market research",
    body: "Every recommendation is backed by rigorous market research so you invest with clarity and confidence.",
  },
  {
    title: "Relationships first",
    body: "We are more than a real estate company — we are your trusted partners in finding the perfect home.",
  },
];

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

/** Client testimonials (names as featured on the Radiance site). */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sunita Kapoor",
    role: "Home buyer, Gurugram",
    quote:
      "Radiance understood exactly what my family needed and shortlisted homes that actually fit our budget and lifestyle. No pressure, just honest guidance from start to keys in hand.",
  },
  {
    name: "Vikas Malhotra",
    role: "Investor, Dwarka Expressway",
    quote:
      "Their market read on the Dwarka Expressway corridor was spot on. The rate-per-sq-ft analysis helped me pick an investment that has already appreciated well.",
  },
  {
    name: "Ananya Sharma",
    role: "First-time buyer, Sohna Road",
    quote:
      "As a first-time buyer I had endless questions. The team walked me through RERA, loans and possession patiently — I never felt rushed into a decision.",
  },
];

export interface HeroSlide {
  image: string;
  heading: string;
  sub: string;
}

/** Hero slideshow — real headings from the Radiance homepage over agency imagery. */
export const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/radiance/props/skyvillas.jpg",
    heading: "Exclusive homes, tailored for your dreams.",
    sub: "Premium residences across Gurugram, Dwarka Expressway and Goa — curated for how you want to live.",
  },
  {
    image: "/radiance/props/aqua.png",
    heading: "Invest in more than a property — invest in your future.",
    sub: "High-conviction investments backed by rigorous market research and honest, rate-per-sq-ft value analysis.",
  },
  {
    image: "/radiance/props/flamingo.png",
    heading: "Discover homes that inspire your best life.",
    sub: "From luxury floors and sky villas to smart commercial assets — guided with trust, integrity and excellence.",
  },
];

/** Primary navigation shared by header and mobile menu. */
export const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "Builders", href: "/builders" },
  { label: "About", href: "/about" },
  { label: "Mission & Vision", href: "/mission-vision" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
