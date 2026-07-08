import type { Metadata } from "next";
import { AGENCY_NAME, AGENCY_TAGLINE } from "@/lib/config";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: `${AGENCY_NAME} — ${AGENCY_TAGLINE}`,
  description: `${AGENCY_NAME}: premium properties and smart investments across Gurugram, Delhi and Goa. Chat with Ashirvad, our AI property consultant, for a verified shortlist that fits your needs.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
