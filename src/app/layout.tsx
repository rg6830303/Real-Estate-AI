import type { Metadata } from "next";
import { AGENCY_NAME, MARKET_REGION } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${AGENCY_NAME} — AI Property Consultant`,
  description: `Chat with ${AGENCY_NAME}'s AI property consultant to find the right home or investment in ${MARKET_REGION}.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
