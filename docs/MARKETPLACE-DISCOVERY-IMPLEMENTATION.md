# Marketplace discovery implementation

This increment makes the homepage's product and store discovery database-backed and introduces a public Stores directory.

## Added
- `GET /api/stores`: paginated public store directory with search, country/city filters, active approved product counts, sample catalogue categories and primary active location.
- `GET /api/stores/[slug]`: public store detail and approved product catalogue.
- `/stores`: searchable, paginated public directory.
- `/stores/[slug]`: public business storefront.
- Homepage discovery now fetches approved products from `/api/products` and approved businesses from `/api/stores`.
- `/sellers` redirects to `/stores`; seller accounts remain internal and can own multiple business storefronts.
- Public product and nearby-location queries now require an active business and an approved seller.

## Public visibility rules
A store is listed only when `BusinessProfile.isActive = true` and its seller has `Seller.isApproved = true`. Only products with both `isPublished = true` and `isApproved = true` are exposed. Product counts use this same eligibility filter.

## Deliberate omissions
The current schema does not contain dedicated product-review/store-review, brand assignment, or seller payment-method models. This increment does not invent ratings, review counts, brands or payment methods. Store cards explicitly indicate that ratings are not yet available. Those features require their own data model and workflows before they can be presented as verified facts.

## Verification
- No Prisma schema changes or migrations were needed.
- No existing migration was edited.
- The source archive's `.env` was excluded from the working copy.
- A full TypeScript/Next.js build could not be completed in this environment because dependency installation did not finish. Run `npm ci`, `npx prisma generate`, `npx prisma validate`, `npx tsc --noEmit`, and `npm run build` in the project environment before deployment.
