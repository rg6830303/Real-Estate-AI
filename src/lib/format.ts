/** "1.75" crore → "₹1.75 Cr"; "0.85" → "₹85 L" — the way Indian buyers read prices. */
export function formatPriceCr(priceCr: number): string {
  if (priceCr >= 1) {
    const rounded = Math.round(priceCr * 100) / 100;
    return `₹${rounded} Cr`;
  }
  const lakh = Math.round(priceCr * 100);
  return `₹${lakh} L`;
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString("en-IN")} sq ft`;
}
