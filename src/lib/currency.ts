// Real-time Exchange Rate API with in-memory server caching (0ms latency overhead)

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
  time_last_update_unix: number;
}

let cachedRates: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "CA$",
  AUD: "AU$",
};

export function getCurrencySymbol(code?: string): string {
  if (!code) return "$";
  return CURRENCY_SYMBOLS[code.toUpperCase()] || "$";
}

export async function getExchangeRates(base = "USD"): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && now - lastFetchTime < CACHE_DURATION_MS) {
    return cachedRates;
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data: ExchangeRateResponse = await res.json();
      cachedRates = data.rates;
      lastFetchTime = now;
      return data.rates;
    }
  } catch (err) {
    console.warn("Failed to fetch live FX rates, using fallback rates:", err);
  }

  // Fallback rates if API is unreachable
  return {
    USD: 1,
    EUR: 0.92,
    GBP: 0.78,
    INR: 83.5,
    CAD: 1.36,
    AUD: 1.52,
  };
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return amount;
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  const inUSD = amount / fromRate;
  return inUSD * toRate;
}
