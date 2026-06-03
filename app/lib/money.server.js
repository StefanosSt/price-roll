/* global BigInt */
// Money helpers.
//
// Shopify sends money as decimal strings ("19.99"). We store integer MINOR
// UNITS (e.g. cents) as BigInt so the price-history log stays exact and tiny.
// The number of decimals is per-currency (EUR=2, JPY=0, BHD=3) — defaults to 2,
// which is correct for the vast majority of currencies.

export function toMinorUnits(value, exponent = 2) {
  if (value == null || value === "") return null;
  const factor = 10 ** exponent;
  return BigInt(Math.round(Number(value) * factor));
}

export function fromMinorUnits(minor, exponent = 2) {
  if (minor == null) return null;
  return Number(minor) / 10 ** exponent;
}

// Format minor units as a localized currency string for display.
export function formatMoney(minor, currencyCode = "USD", exponent = 2) {
  if (minor == null) return "—";
  const amount = Number(minor) / 10 ** exponent;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return amount.toFixed(exponent);
  }
}
