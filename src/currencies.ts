/** Rates: 1 EUR = X of target currency */
export type Rates = Record<string, number>

export interface CurrencyInfo {
  code: string
  name: string
}

const CACHE_KEY = 'exchangeRates_v2'
const CURRENCIES_CACHE_KEY = 'currencyList_v2'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

let ratesCache: Rates | null = null
let currenciesCache: CurrencyInfo[] | null = null

async function fetchCurrencies(): Promise<CurrencyInfo[]> {
  const res = await fetch('https://api.frankfurter.dev/v1/currencies')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: Record<string, string> = await res.json()
  return Object.entries(data).map(([code, name]) => ({ code, name }))
}

async function fetchRates(): Promise<Rates> {
  const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return { EUR: 1, ...data.rates }
}

/** Load available currencies (cached 24h) */
export async function loadCurrencies(): Promise<CurrencyInfo[]> {
  if (currenciesCache) return currenciesCache

  try {
    const cached = await chrome.storage.local.get(CURRENCIES_CACHE_KEY)
    if (cached[CURRENCIES_CACHE_KEY]) {
      const { list, timestamp } = cached[CURRENCIES_CACHE_KEY] as {
        list: CurrencyInfo[]
        timestamp: number
      }
      if (Date.now() - timestamp < CACHE_TTL) {
        currenciesCache = list
        return list
      }
    }
  } catch {}

  try {
    const list = await fetchCurrencies()
    currenciesCache = list
    chrome.storage.local.set({
      [CURRENCIES_CACHE_KEY]: { list, timestamp: Date.now() },
    })
    return list
  } catch {
    return [{ code: 'EUR', name: 'Euro' }]
  }
}

/** Load rates from cache or fetch fresh ones */
export async function loadRates(): Promise<Rates> {
  if (ratesCache) return ratesCache

  try {
    const cached = await chrome.storage.local.get(CACHE_KEY)
    if (cached[CACHE_KEY]) {
      const { rates, timestamp } = cached[CACHE_KEY] as {
        rates: Rates
        timestamp: number
      }
      if (Date.now() - timestamp < CACHE_TTL) {
        ratesCache = rates
        return rates
      }
    }
  } catch {}

  try {
    const rates = await fetchRates()
    ratesCache = rates
    chrome.storage.local.set({
      [CACHE_KEY]: { rates, timestamp: Date.now() },
    })
    return rates
  } catch {
    return { EUR: 1 }
  }
}

/** Convert an amount from one currency to another using EUR-based rates */
export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string,
  rates: Rates,
): number {
  if (fromCode === toCode) return amount
  const fromRate = rates[fromCode] ?? 1
  const toRate = rates[toCode] ?? 1
  // amount in "from" -> EUR -> "to"
  const eur = amount / fromRate
  return Math.round(eur * toRate)
}
