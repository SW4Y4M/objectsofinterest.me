export function formatPrice(price?: string | null, currency?: string | null): string | null {
  const normalizedPrice = price?.trim();
  if (!normalizedPrice) {
    return null;
  }

  const normalizedCurrency = currency?.trim().toUpperCase();
  return normalizedCurrency ? `${normalizedCurrency} ${normalizedPrice}` : normalizedPrice;
}
