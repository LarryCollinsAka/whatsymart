import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { ProductDetailActions } from './product-detail-actions'

const LOCALES = ['en', 'fr', 'es', 'pt', 'nl']
type Props = { params: Promise<{ slug: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const requestedLocale = cookieStore.get('wm_locale')?.value || 'en'
  const locale = LOCALES.includes(requestedLocale) ? requestedLocale : 'en'

  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true, isApproved: true, business: { is: { isActive: true, seller: { is: { isApproved: true } } } } },
    include: {
      business: {
        select: {
          id: true,
          businessName: true,
          slug: true,
          seller: { select: { id: true, storeName: true, storeSlug: true, whatsappNumber: true, isElite: true, isVerified: true } },
        },
      },
      category: { select: { name: true, slug: true } },
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      translations: true,
      variants: {
        where: { isAvailable: true },
        orderBy: { createdAt: 'asc' },
        include: {
          optionValues: {
            include: { optionValue: { select: { value: true, option: { select: { name: true } } } } },
          },
        },
      },
    },
  }).catch(() => null)

  if (!product) notFound()
  const translation = product.translations.find((item) => item.locale === locale)
  const name = translation?.name || product.name
  const description = translation?.description || product.description
  const similar = await prisma.product.findMany({
    where: { isPublished: true, isApproved: true, categoryId: product.categoryId, id: { not: product.id }, business: { is: { isActive: true, seller: { is: { isApproved: true } } } } },
    take: 4,
    orderBy: { totalSales: 'desc' },
    include: {
      business: {
        select: {
          id: true,
          businessName: true,
          slug: true,
          seller: { select: { id: true, storeName: true, storeSlug: true, whatsappNumber: true, isElite: true, isVerified: true } },
        },
      },
      images: { where: { isPrimary: true }, take: 1 },
      translations: { where: { locale }, take: 1 },
    },
  }).catch(() => [])

  const images = product.images.length ? product.images : []
  const primaryImage = images[0]?.r2Url
  const variants = product.variants.flatMap((variant) => {
    const adjustment = variant.price ? Number(variant.price) - Number(product.price) : 0
    if (variant.optionValues.length) {
      return variant.optionValues.map((entry) => ({
        id: variant.id,
        name: entry.optionValue.option.name,
        value: entry.optionValue.value,
        priceAdjustment: adjustment,
        stock: variant.stock,
      }))
    }
    return [{
      id: variant.id,
      name: 'Variant',
      value: variant.name || variant.sku || 'Standard',
      priceAdjustment: adjustment,
      stock: variant.stock,
    }]
  })

  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
    <div className="text-sm text-gray-500"><Link href="/products" className="hover:text-emerald-700">Products</Link> / {product.category.name} / <span className="text-gray-900">{name}</span></div>
    <section className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-3xl bg-white border border-gray-100 flex items-center justify-center">{primaryImage ? <img src={primaryImage} alt={name} className="h-full w-full object-contain"/> : <span className="text-7xl">📦</span>}</div>
        {images.length > 1 && <div className="grid grid-cols-4 gap-3">{images.slice(1).map((image) => <div key={image.id} className="aspect-square rounded-xl overflow-hidden bg-white border"><img src={image.r2Url} alt={image.altText || name} className="w-full h-full object-cover"/></div>)}</div>}
      </div>
      <div className="space-y-5">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{product.category.name}</p><h1 className="mt-2 text-3xl font-black text-gray-950">{name}</h1><Link href={`/stores/${product.business.slug}`} className="mt-2 inline-block text-sm text-gray-500 hover:text-emerald-700">Sold by {product.business.businessName}</Link></div>
        <div className="flex items-baseline gap-3"><span className="text-3xl font-black text-emerald-800">{new Intl.NumberFormat(locale, { style: 'currency', currency: product.currency }).format(Number(product.price))}</span>{product.comparePrice && <span className="text-lg text-gray-400 line-through">{new Intl.NumberFormat(locale, { style: 'currency', currency: product.currency }).format(Number(product.comparePrice))}</span>}</div>
        <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</p>
        <div className="border-y border-gray-100 py-5"><h2 className="font-bold text-gray-900 mb-2">Description</h2><p className="text-sm leading-7 text-gray-600 whitespace-pre-line">{description || 'No description has been provided yet.'}</p><div className="mt-3 flex flex-wrap gap-2">{LOCALES.map((code) => <span key={code} className={`rounded-full px-2.5 py-1 text-xs ${product.translations.some((item) => item.locale === code) ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>{code.toUpperCase()}{product.translations.some((item) => item.locale === code) ? ' · available' : ''}</span>)}</div></div>
        <ProductDetailActions product={{ id: product.id, name, price: Number(product.price), currency: product.currency, stock: product.stock, sellerName: product.business.businessName, whatsappNumber: product.business.seller.whatsappNumber || '', slug: product.slug }} variants={variants} />
      </div>
    </section>
    {similar.length > 0 && <section className="space-y-4"><div><h2 className="text-2xl font-black">Similar products</h2><p className="text-sm text-gray-500">More products in {product.category.name}</p></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{similar.map((item) => <ProductCard key={item.id} id={item.id} name={item.translations[0]?.name || item.name} slug={item.slug} usdPrice={Number(item.price)} priceCurrency={item.currency} weekSales={item.weekSales} badge={item.badge} imageUrl={item.images[0]?.r2Url} seller={{ ...item.business.seller, storeName: item.business.businessName, businessSlug: item.business.slug }}/>)}</div></section>}
  </div>
}
