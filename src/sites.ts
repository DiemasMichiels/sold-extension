export interface SiteConfig {
  id: string
  country: string
  countryCode: string
  name: string
  currency: string
  mapUrl: string
  hostMatch: string
  isListingPage: (url: string) => boolean
  priceSelectors: string[]
  /** Hide ancestor `.text-block` when an element matching selector contains this text */
  hideTextBlocks?: { selector: string; text: string }[]
  getPrice: (doc: Document) => number | null
}

export const sites: SiteConfig[] = [
  {
    id: 'immoweb',
    country: 'Belgium',
    countryCode: 'BE',
    name: 'Immoweb',
    currency: '\u20AC',
    mapUrl:
      'https://www.immoweb.be/en/map/house/for-sale?countries=BE&isNewlyBuilt=false&page=1&orderBy=relevance',
    hostMatch: 'immoweb.be',
    isListingPage: (url) => /immoweb\.be\/en\/classified\//.test(url),
    priceSelectors: [
      '.classified__price .sr-only',
      '.classified__header--immoweb .classified__price',
      'p.classified__price',
      '.classified__price span',
      '.card--result__price',
      '.classified__information--financial',
      'div[object-type="card-list-item"]',
    ],
    hideTextBlocks: [
      { selector: 'h2.text-block__title', text: 'Financial' },
      { selector: 'h2.text-block__title', text: 'Get in touch' },
    ],
    getPrice: (doc) => {
      const el =
        doc.querySelector('.classified__price .sr-only') ||
        doc.querySelector(
          '.classified__price span:not(.classified__price-label)',
        )
      if (!el) return null
      const text = el.textContent || ''
      const num = parseInt(text.replace(/[^\d]/g, ''), 10)
      return isNaN(num) ? null : num
    },
  },
  {
    id: 'funda',
    country: 'Netherlands',
    countryCode: 'NL',
    name: 'Funda',
    currency: '\u20AC',
    mapUrl:
      'https://www.funda.nl/en/zoeken/kaart/koop?selected_area=[%22nl%22]&zoom=8&centerLat=52.1176&centerLng=5.3773',
    hostMatch: 'funda.nl',
    isListingPage: (url) => /funda\.nl\/(en\/)?detail\//.test(url),
    priceSelectors: [
      '.object-header__price',
      '.object-header__price-main',
      'dt:has(+ dd .object-header__price)',
      '.object-header__price span',
    ],
    getPrice: (doc) => {
      const el =
        doc.querySelector('.object-header__price-main') ||
        doc.querySelector('.object-header__price')
      if (!el) return null
      const text = el.textContent || ''
      const num = parseInt(text.replace(/[^\d]/g, ''), 10)
      return isNaN(num) ? null : num
    },
  },
  {
    id: 'rightmove',
    country: 'United Kingdom',
    countryCode: 'GB',
    name: 'Rightmove',
    currency: '\u00A3',
    mapUrl: 'https://www.rightmove.co.uk/property-for-sale/map.html',
    hostMatch: 'rightmove.co.uk',
    isListingPage: (url) => /rightmove\.co\.uk\/properties\//.test(url),
    priceSelectors: [
      '._1gfnqJ3Vtd1z40MlC0MzXu',
      '[data-testid="price"]',
      '.propertyHeaderPrice .price',
      '#propertyHeaderPrice .price',
    ],
    getPrice: (doc) => {
      const el =
        doc.querySelector('[data-testid="price"]') ||
        doc.querySelector('._1gfnqJ3Vtd1z40MlC0MzXu') ||
        doc.querySelector('#propertyHeaderPrice .price')
      if (!el) return null
      const text = el.textContent || ''
      const num = parseInt(text.replace(/[^\d]/g, ''), 10)
      return isNaN(num) ? null : num
    },
  },
]

export function getCurrentSite(): SiteConfig | null {
  const hostname = window.location.hostname
  return sites.find((s) => hostname.includes(s.hostMatch)) || null
}

export function formatPrice(amount: number, currency: string): string {
  return `${currency}${amount.toLocaleString()}`
}
