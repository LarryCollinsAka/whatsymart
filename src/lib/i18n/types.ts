export type Locale = 'en' | 'fr' | 'es' | 'pt' | 'nl'

export const DEFAULT_LOCALE: Locale = 'en'

export const SUPPORTED_LOCALES: { code: Locale; name: string; flag: string; nativeName: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English (Primary)' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', nativeName: 'Nederlands' },
]

export interface Dictionary {
  common: {
    appName: string
    tagline: string
    searchPlaceholder: string
    searchBtn: string
    cities: string
    currency: string
    allDepartments: string
    seeAll: string
    loading: string
    offlineNotice: string
  }
  nav: {
    home: string
    explore: string
    sellers: string
    suggestions: string
    becomeSeller: string
    orders: string
    profile: string
    login: string
    register: string
    logout: string
    reportIssue: string
    support: string
  }
  hero: {
    badge: string
    titlePart1: string
    titleHighlight: string
    titlePart2: string
    subtitle: string
    verifiedSellers: string
    payments: string
    expressDelivery: string
    whatsappSupport: string
  }
  product: {
    elite: string
    limitedStock: string
    verified: string
    soldThisWeek: string
    available: string
    orderWhatsApp: string
    orderInSeconds: string
    deliveryPrefix: string
  }
  sellers: {
    trustedNearby: string
    productsCount: string
    rating: string
  }
  features: {
    whyChoose: string
    fasterTitle: string
    fasterDesc: string
    verifiedTitle: string
    verifiedDesc: string
    instantTitle: string
    instantDesc: string
  }
  referral: {
    title: string
    desc: string
    shareBtn: string
    copied: string
  }
  suggestions: {
    badge: string
    title: string
    subtitle: string
    proposeBtn: string
    allIdeas: string
    modalTitle: string
    modalSubtitle: string
    categoryLabel: string
    titleLabel: string
    descLabel: string
    cancel: string
    submit: string
    planned: string
    underReview: string
    by: string
  }
  reports: {
    title: string
    subtitle: string
    targetType: string
    reason: string
    targetId: string
    targetPlaceholder: string
    explanation: string
    evidence: string
    uploadBtn: string
    submit: string
    successTitle: string
    successDesc: string
    backHome: string
  }
  admin: {
    title: string
    badge: string
    subtitle: string
    tabTransfers: string
    tabPayouts: string
    tabReports: string
    tabSellers: string
    gmv: string
    platformFees: string
    activeSellers: string
    appleGpaySplit: string
    confirmReceipt: string
    reject: string
    markPaid: string
    resolved: string
    resolveBtn: string
  }
  seller: {
    title: string
    whatsappLabel: string
    tabProducts: string
    tabWallet: string
    tabSettings: string
    pendingBalance: string
    weeklySales: string
    rating: string
    addProduct: string
    productName: string
    level1: string
    level2: string
    level3: string
    price: string
    stock: string
    deliveryTime: string
    description: string
    aiWriteBtn: string
    photoUpload: string
    publishBtn: string
    requestPayout: string
    payoutAmount: string
    payoutMethod: string
    payoutDetails: string
    confirmPayout: string
    whatsappSettingsTitle: string
    whatsappSettingsDesc: string
    whatsappNumberLabel: string
    whatsappToggleLabel: string
    saveBtn: string
  }
  catalog: {
    title: string
    subtitle: string
    allProducts: string
    searchPlaceholder: string
    sortBy: string
    priceAsc: string
    priceDesc: string
    popular: string
    noProductsFound: string
    resultsFor: string
  }
  auth: {
    loginTitle: string
    loginSubtitle: string
    registerTitle: string
    registerSubtitle: string
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    nameLabel: string
    namePlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    loginBtn: string
    registerBtn: string
    loggingIn: string
    registering: string
    wantToSell: string
    alreadyHaveAccount: string
    noAccountYet: string
    createAccount: string
    signIn: string
    demoAccountsTitle: string
  }
  footer: {
    about: string
    rights: string
    madeWithLove: string
    marketplace: string
    exploreCatalog: string
    partnerStores: string
    becomeCertified: string
    trackOrder: string
    popularAisles: string
    communitySupport: string
    publicSuggestions: string
    reportProblem: string
    support24: string
  }
}
