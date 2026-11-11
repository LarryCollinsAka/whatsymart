import { PrismaClient, Role, ProductBadge, PayoutMethod, BusinessCapability, BusinessMemberRole, LocationType, VerificationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding WhatsyMart Multilingual Enterprise Database...')

  // Demo accounts are for local/staging only. Never ship a shared password.
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Refusing to create demo accounts in production. Set ALLOW_DEMO_SEED=true only for an isolated demo database.')
  }
  const seedPassword = process.env.SEED_DEMO_PASSWORD
  if (!seedPassword || seedPassword.length < 12) {
    throw new Error('Set SEED_DEMO_PASSWORD to a unique password of at least 12 characters before seeding.')
  }
  const defaultPassword = await bcrypt.hash(seedPassword, 12)

  // 2. Create RBAC Users
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@whatsymart.com' },
    update: {},
    create: {
      email: 'superadmin@whatsymart.com',
      name: 'Executive Director',
      password: defaultPassword,
      role: Role.SUPERADMIN,
      locale: 'en',
      isVerified: true,
    },
  })

  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@whatsymart.com' },
    update: {},
    create: {
      email: 'seller@whatsymart.com',
      name: 'Mama Ngono Market',
      phone: '+237699112233',
      password: defaultPassword,
      role: Role.SELLER,
      locale: 'en',
      isVerified: true,
    },
  })

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@whatsymart.com' },
    update: {},
    create: {
      email: 'customer@whatsymart.com',
      name: 'David Miller',
      phone: '+15551234567',
      password: defaultPassword,
      role: Role.CUSTOMER,
      locale: 'en',
      isVerified: true,
    },
  })

  // 3. Create Seller Profile
  const sellerStore = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      storeName: 'Mama Ngono Market',
      storeSlug: 'mama-ngono-market',
      bio: 'Farm fresh agro-products, cereals, and organic staples from verified cooperatives.',
      whatsappNumber: '237699112233',
      whatsappEnabled: true,
      preferredLocale: 'en',
      isApproved: true,
      isElite: true,
      isVerified: true,
      commissionRate: 10.0,
      payoutMethod: PayoutMethod.BANK_TRANSFER,
      balance: 320.0,
      totalSales: 320,
    },
  })

  // 3b. Create the seller's first independent business and primary location.
  const business = await prisma.businessProfile.upsert({
    where: { slug: 'mama-ngono-market' },
    update: {},
    create: {
      sellerId: sellerStore.id,
      businessName: 'Mama Ngono Market',
      slug: 'mama-ngono-market',
      description: 'Farm fresh agro-products, cereals, and organic staples from verified cooperatives.',
      capabilities: [BusinessCapability.RETAIL, BusinessCapability.WHOLESALE],
      country: 'Cameroon',
      city: 'Yaoundé',
      address: 'Marché Central, Allée 4, Boutique 12',
      phone: '+237699112233',
      email: sellerUser.email,
      isActive: true,
      isVerified: true,
      verificationStatus: VerificationStatus.APPROVED,
    },
  })

  await prisma.businessMembership.upsert({
    where: { businessId_userId: { businessId: business.id, userId: sellerUser.id } },
    update: { role: BusinessMemberRole.OWNER, isActive: true },
    create: { businessId: business.id, userId: sellerUser.id, role: BusinessMemberRole.OWNER },
  })

  const primaryLocation = await prisma.businessLocation.findFirst({
    where: { businessId: business.id, isPrimary: true },
  })
  if (!primaryLocation) {
    await prisma.businessLocation.create({
      data: {
        businessId: business.id,
        name: 'Mama Ngono Market - Main Branch',
        code: 'MAIN',
        locationType: LocationType.STORE,
        address: 'Marché Central, Allée 4, Boutique 12',
        city: 'Yaoundé',
        country: 'Cameroon',
        latitude: 3.8667,
        longitude: 11.5167,
        offersDelivery: true,
        offersPickup: true,
        isPrimary: true,
      },
    })
  }

  // Verification belongs to a business, not to the seller account.
  await prisma.sellerVerification.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      businessName: 'Mama Ngono Fresh Market',
      businessType: 'SOLE_TRADER',
      businessCountry: 'Cameroon',
      businessCity: 'Yaoundé',
      businessAddress: 'Marché Central, Allée 4, Boutique 12',
      nationalIdUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      selfieWithIdUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      businessRegDocUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      taxIdUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
      proofOfAddressUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80',
      storeFrontPhotoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      productCategories: ['Food & Fresh Market', 'Grains & Starches'],
      estimatedMonthlyGmv: '$2,000 – $5,000/month',
      hasPhysicalInventory: true,
      whatsappNumber: '+237 699 112 233',
      instagramHandle: 'mamangono_fresh',
      facebookPageUrl: 'https://facebook.com/mamangonomarket',
      referralCode: 'WM-LAUNCH-2026',
      reviewedBy: superadmin.id,
      reviewedAt: new Date(),
    },
  })

  // 4. Create 3-Level Categories with 5-Language Translations (EN, FR, ES, PT, NL)
  // Level 1: Root Category
  const rootFood = await prisma.category.upsert({
    where: { slug: 'food-and-market' },
    update: {},
    create: {
      name: 'Food & Fresh Market',
      slug: 'food-and-market',
      emoji: '🌾',
      level: 1,
      translations: {
        create: [
          { locale: 'en', name: 'Food & Fresh Market', description: 'Fresh groceries, cereals and farm produce' },
          { locale: 'fr', name: 'Alimentation & Marché', description: 'Vivres frais, céréales et produits maraîchers' },
          { locale: 'es', name: 'Alimentación y Mercado', description: 'Comestibles frescos, cereales y productos agrícolas' },
          { locale: 'pt', name: 'Alimentação e Mercado', description: 'Mantimentos frescos, cereais e produtos do campo' },
          { locale: 'nl', name: 'Levensmiddelen & Markt', description: 'Verse boodschappen, granen en landbouwproducten' },
        ],
      },
    },
  })

  // Level 2: Sub-category
  const subGrains = await prisma.category.upsert({
    where: { slug: 'grains-and-starches' },
    update: {},
    create: {
      name: 'Grains & Starches',
      slug: 'grains-and-starches',
      emoji: '🌾',
      level: 2,
      parentId: rootFood.id,
      translations: {
        create: [
          { locale: 'en', name: 'Grains & Starches' },
          { locale: 'fr', name: 'Céréales & Féculents' },
          { locale: 'es', name: 'Cereales y Féculas' },
          { locale: 'pt', name: 'Cereais e Féculas' },
          { locale: 'nl', name: 'Granen & Zetmeel' },
        ],
      },
    },
  })

  // Level 3: Child Sub-category
  const childRice = await prisma.category.upsert({
    where: { slug: 'rice-and-semolina' },
    update: {},
    create: {
      name: 'Rice & Semolina',
      slug: 'rice-and-semolina',
      emoji: '🍚',
      level: 3,
      parentId: subGrains.id,
      translations: {
        create: [
          { locale: 'en', name: 'Rice & Semolina' },
          { locale: 'fr', name: 'Riz & Semoules' },
          { locale: 'es', name: 'Arroz y Sémolas' },
          { locale: 'pt', name: 'Arroz e Sêmolas' },
          { locale: 'nl', name: 'Rijst & Griesmeel' },
        ],
      },
    },
  })

  // 5. Create Multilingual Products with 5 Language Translations
  await prisma.product.upsert({
    where: { slug: 'fragrant-jasmine-rice-25kg' },
    update: {},
    create: {
      businessId: business.id,
      categoryId: childRice.id,
      name: 'Fragrant Jasmine Rice 25kg',
      slug: 'fragrant-jasmine-rice-25kg',
      description: 'Premium long-grain fragrant white rice in a 25kg burlap bag.',
      price: 28.5,
      currency: 'USD',
      stock: 45,
      isPublished: true,
      isApproved: true,
      totalSales: 128,
      weekSales: 128,
      deliveryTime: '5 min',
      badge: ProductBadge.ELITE,
      tags: ['rice', 'grains', 'staple', 'food'],
      translations: {
        create: [
          {
            locale: 'en',
            name: 'Fragrant Jasmine Rice 25kg',
            description: 'Premium long-grain fragrant white rice in a 25kg bag.',
          },
          {
            locale: 'fr',
            name: 'Riz parfumé 25kg',
            description: 'Riz blanc parfumé de qualité supérieure en sac de 25kg.',
          },
          {
            locale: 'es',
            name: 'Arroz perfumado 25kg',
            description: 'Arroz blanco perfumado de calidad premium en saco de 25kg.',
          },
          {
            locale: 'pt',
            name: 'Arroz aromático 25kg',
            description: 'Arroz branco perfumado de alta qualidade em saco de 25kg.',
          },
          {
            locale: 'nl',
            name: 'Geurige Jasmijnrijst 25kg',
            description: 'Luxe geurige witte rijst in zak van 25kg.',
          },
        ],
      },
    },
  })

  // 6. Add realistic Cameroon-market demo products. All operations are idempotent.
  const freshProduce = await prisma.category.upsert({
    where: { slug: 'fresh-produce' },
    update: {},
    create: {
      name: 'Fresh Produce', slug: 'fresh-produce', emoji: '🥬', level: 2, parentId: rootFood.id,
      translations: { create: [
        { locale: 'en', name: 'Fresh Produce' },
        { locale: 'fr', name: 'Produits frais' },
        { locale: 'es', name: 'Productos frescos' },
        { locale: 'pt', name: 'Produtos frescos' },
        { locale: 'nl', name: 'Verse producten' },
      ] },
    },
  })
  const oils = await prisma.category.upsert({
    where: { slug: 'oils-and-condiments' },
    update: {},
    create: {
      name: 'Oils & Condiments', slug: 'oils-and-condiments', emoji: '🫙', level: 2, parentId: rootFood.id,
      translations: { create: [
        { locale: 'en', name: 'Oils & Condiments' },
        { locale: 'fr', name: 'Huiles & condiments' },
        { locale: 'es', name: 'Aceites y condimentos' },
        { locale: 'pt', name: 'Óleos e condimentos' },
        { locale: 'nl', name: 'Oliën & smaakmakers' },
      ] },
    },
  })

  const demoProducts = [
    {
      categoryId: childRice.id, name: 'Cameroon Premium Rice 25kg', slug: 'cameroon-premium-rice-25kg',
      description: 'Locally sourced, carefully cleaned long-grain rice in a 25kg sack.', price: 18500, stock: 65,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&auto=format&fit=crop&q=85',
      fr: ['Riz premium du Cameroun 25 kg', 'Riz local à longs grains, soigneusement nettoyé, en sac de 25 kg.'],
    },
    {
      categoryId: freshProduce.id, name: 'Fresh Plantains (Bunch)', slug: 'fresh-plantains-bunch',
      description: 'Fresh green plantains selected from local farms.', price: 3500, stock: 40,
      image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=900&auto=format&fit=crop&q=85',
      fr: ['Bananes plantain fraîches (régime)', 'Bananes plantain vertes et fraîches sélectionnées auprès de producteurs locaux.'],
    },
    {
      categoryId: freshProduce.id, name: 'Fresh Tomatoes 5kg', slug: 'fresh-tomatoes-5kg',
      description: 'Ripe, firm tomatoes suitable for everyday cooking, packed in a 5kg crate.', price: 4500, stock: 28,
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=900&auto=format&fit=crop&q=85',
      fr: ['Tomates fraîches 5 kg', 'Tomates mûres et fermes pour la cuisine quotidienne, en cageot de 5 kg.'],
    },
    {
      categoryId: oils.id, name: 'Traditional Red Palm Oil 5L', slug: 'traditional-red-palm-oil-5l',
      description: 'Locally produced red palm oil, filtered and packed in a sealed 5-litre container.', price: 6500, stock: 32,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=900&auto=format&fit=crop&q=85',
      fr: ['Huile de palme rouge traditionnelle 5 L', 'Huile de palme rouge locale, filtrée et conditionnée dans un bidon scellé de 5 litres.'],
    },
    {
      categoryId: childRice.id, name: 'Red Kidney Beans 5kg', slug: 'red-kidney-beans-5kg',
      description: 'Clean, dry red beans supplied in a 5kg food-grade bag.', price: 7000, stock: 24,
      image: 'https://images.unsplash.com/photo-1515543904379-3d757afb72e4?w=900&auto=format&fit=crop&q=85',
      fr: ['Haricots rouges 5 kg', 'Haricots rouges propres et secs dans un sac alimentaire de 5 kg.'],
    },
    {
      categoryId: childRice.id, name: 'Yellow Maize 10kg', slug: 'yellow-maize-10kg',
      description: 'Dried yellow maize suitable for milling, porridge and household cooking.', price: 6000, stock: 50,
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&auto=format&fit=crop&q=85',
      fr: ['Maïs jaune 10 kg', 'Maïs jaune séché pour la mouture, la bouillie et la cuisine familiale.'],
    },
    {
      categoryId: freshProduce.id, name: 'Fresh Avocados (6 pieces)', slug: 'fresh-avocados-6-pieces',
      description: 'Six fresh, naturally ripened avocados from local growers.', price: 2500, stock: 18,
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=900&auto=format&fit=crop&q=85',
      fr: ['Avocats frais (6 pièces)', 'Six avocats frais mûris naturellement par des producteurs locaux.'],
    },
    {
      categoryId: oils.id, name: 'Roasted Groundnut Paste 1kg', slug: 'roasted-groundnut-paste-1kg',
      description: 'Smooth roasted peanut paste with no added sugar, packed in a 1kg jar.', price: 3000, stock: 22,
      image: 'https://images.unsplash.com/photo-1505576633757-0ac1084af824?w=900&auto=format&fit=crop&q=85',
      fr: ['Pâte d’arachide grillée 1 kg', 'Pâte d’arachide grillée onctueuse, sans sucre ajouté, en pot de 1 kg.'],
    },
    {
      categoryId: freshProduce.id, name: 'Fresh Onions 5kg', slug: 'fresh-onions-5kg',
      description: 'Firm red onions packed in a ventilated 5kg sack.', price: 4000, stock: 35,
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=900&auto=format&fit=crop&q=85',
      fr: ['Oignons frais 5 kg', 'Oignons rouges fermes conditionnés dans un sac aéré de 5 kg.'],
    },
  ]

  for (const item of demoProducts) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name, description: item.description, price: item.price,
        currency: 'XAF', stock: item.stock, isPublished: true, isApproved: true,
        categoryId: item.categoryId, businessId: business.id,
      },
      create: {
        businessId: business.id, categoryId: item.categoryId,
        name: item.name, slug: item.slug, description: item.description,
        price: item.price, currency: 'XAF', stock: item.stock,
        isPublished: true, isApproved: true, tags: ['cameroon', 'local', 'market'],
      },
    })

    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: product.id, locale: 'en' } },
      update: { name: item.name, description: item.description },
      create: { productId: product.id, locale: 'en', name: item.name, description: item.description },
    })
    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: product.id, locale: 'fr' } },
      update: { name: item.fr[0], description: item.fr[1] },
      create: { productId: product.id, locale: 'fr', name: item.fr[0], description: item.fr[1] },
    })

    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id, isPrimary: true } })
    if (!existingImage) {
      await prisma.productImage.create({
        data: { productId: product.id, r2Url: item.image, altText: item.name, isPrimary: true, sortOrder: 0 },
      })
    }
  }

  console.log(`✅ Seeded ${demoProducts.length + 1} demo products and multilingual categories.`)
  console.log('✅ Multilingual seeding configured successfully!')
  console.log('👉 Locales supported: EN (Primary), FR, ES, PT, NL')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
