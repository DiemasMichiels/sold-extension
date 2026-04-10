export interface SiteConfig {
  id: string
  country: string
  countryCode: string
  name: string
  /** Currency symbol for display (e.g. €, £) */
  currency: string
  /** ISO 4217 currency code (e.g. EUR, GBP) */
  currencyCode: string
  mapUrl: string
  hostMatch: string
  isListingPage: (url: string) => boolean
  priceSelectors: string[]
  /** Selectors where price text should be hidden but the element must stay visible (e.g. map pins) */
  priceTextSelectors?: string[]
  /** Hide ancestor when an element matching selector contains this text. Defaults to `.text-block` if closestSelector is omitted. */
  hideTextBlocks?: {
    selector: string
    text: string
    closestSelector?: string
  }[]
  /** Hide individual items: when an element matching selector has text containing textContains, hide the closest ancestor matching closestSelector (or the element itself) */
  hideItems?: {
    selector: string
    textContains: string
    closestSelector?: string
  }[]
  /** Enable URL polling for SPA sites like Zillow where navigation doesn't reload the page */
  spaMode?: boolean
  getPrice: (doc: Document) => number | null
}

export const sites: SiteConfig[] = [
  {
    id: 'immoweb',
    country: 'Belgium',
    countryCode: 'BE',
    name: 'Immoweb',
    currency: '\u20AC',
    currencyCode: 'EUR',
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
      '.map__marker-content',
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
    currencyCode: 'EUR',
    mapUrl:
      'https://www.funda.nl/en/zoeken/kaart/koop?selected_area=[%22nl%22]&object_type=[%22house%22,%22apartment%22]&construction_type=[%22resale%22]&zoom=8&centerLat=52.1858&centerLng=5.2677',
    hostMatch: 'funda.nl',
    isListingPage: (url) => /funda\.nl\/(en\/)?detail\//.test(url),
    priceSelectors: [
      '.object-header__price',
      '.object-header__price-main',
      'dt:has(+ dd .object-header__price)',
      '.object-header__price span',
      '#main-content > div > div.relative.flex.size-full.grow > div > div.absolute.bottom-4.left-1\\/2.z-10.-translate-x-1\\/2 > div > div > div > div.relative.flex.flex-col.p-4.pt-6.\\@xl\\:flex-1.\\@xl\\:pt-4 > div.mt-2 > div.flex.gap-2 > div',
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
    currencyCode: 'GBP',
    mapUrl:
      'https://www.rightmove.co.uk/property-for-sale/map.html?locationIdentifier=USERDEFINEDAREA%5E%7B%22polylines%22%3A%22%7BvcjJfx%7Bo%40%3Fsokl%40%7CckEqrmCnroAc%7Ec%40%60o%7CEwhfAbc%7EJcyzCrl%60Geys%40fufDiosAtsbBazNllfAnsAviaBt%7Bk%40lybAjjcB%60oaBzbbFj%7C%7CDl%60%7D%5E%60hIf%7C%7BHgcPl%7ByFail%7B%40dpn%40%22%7D&viewType=MAP&numberOfPropertiesPerPage=95&sortType=6&channel=BUY&transactionType=BUY&propertyTypes=flat%2Cterraced%2Csemi-detached%2Cdetached',
    hostMatch: 'rightmove.co.uk',
    isListingPage: (url) => /rightmove\.co\.uk\/properties\//.test(url),
    priceSelectors: [
      '[data-testid="price"]',
      '[data-testid="primaryPrice"]',
      '.propertyHeaderPrice .price',
      '#propertyHeaderPrice .price',
      '[class*="SinglePinCard_price"]',
      '.sdc_stampDutyCalculator',
      '#mortgageCalculator',
      '[data-test="pageHeaderNav"] > a > div:last-child span',
    ],
    priceTextSelectors: ['[class*="PricePin_pricePin"]'],
    getPrice: (doc) => {
      const el =
        doc.querySelector('[data-testid="price"]') ||
        doc.querySelector('[data-testid="primaryPrice"]') ||
        doc.querySelector('#propertyHeaderPrice .price')
      if (!el) return null
      const text = el.textContent || ''
      const num = parseInt(text.replace(/[^\d]/g, ''), 10)
      return isNaN(num) ? null : num
    },
  },
  {
    id: 'zillow',
    country: 'United States',
    countryCode: 'US',
    name: 'Zillow',
    currency: '\u0024',
    currencyCode: 'USD',
    mapUrl:
      'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22isMapVisible%22%3Atrue%2C%22mapBounds%22%3A%7B%22west%22%3A-141.2076151131316%2C%22east%22%3A-64.1275369881316%2C%22south%22%3A-1.3531568788829667%2C%22north%22%3A68.12584397703623%7D%2C%22mapZoom%22%3A4%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%7D%2C%22isListVisible%22%3Atrue%2C%22usersSearchTerm%22%3A%22%22%7D',
    hostMatch: 'zillow.com',
    isListingPage: (url) => /zillow\.com\/homedetails\//.test(url),
    priceSelectors: [
      '[data-testid="property-card-price"]',
      '[data-testid="price"]',
      '[data-testid="home-info"] .price-text',
      '[data-testid="chip-personalize-payment-module"]',
      '[data-testid="monthly-payment"]',
      '[data-testid="market-value-module"]',
      '[data-testid="monthly-payment-module"]',
      '[data-testid="facts-and-features"] [data-testid="category-group"].last-of-type',
      '[data-testid="action-bar-info-section"]',
    ],
    hideTextBlocks: [
      {
        selector: 'h2',
        text: 'Price history',
        closestSelector: '[class*="DataModule"]',
      },
    ],
    hideItems: [
      {
        selector: '[aria-label="At a glance facts"] span',
        textContains: '$',
        closestSelector: '[aria-label="At a glance facts"] > div',
      },
      {
        selector: '[aria-label="At a glance facts"] span',
        textContains: 'sqft',
        closestSelector: '[aria-label="At a glance facts"] > div',
      },
    ],
    priceTextSelectors: ['[data-test="property-marker"]'],
    spaMode: true,
    getPrice: (doc) => {
      const el =
        doc.querySelector('[data-testid="home-info"] .price-text') ||
        doc.querySelector('[data-testid="price"]')
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
