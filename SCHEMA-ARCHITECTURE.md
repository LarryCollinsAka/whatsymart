# WhatsyMart database architecture — feature coverage

This schema extends the existing marketplace without creating separate customer identities. The existing `User`, `Seller`, `Product`, and `Order` core remains the foundation.

## Implemented in Prisma schema

- **Product catalogue:** multilingual `ProductTranslation`; product stock; option/value/variant tables with per-variant SKU, price, stock and image; optional explicit related/upsell/cross-sell links in `ProductRelation`.
- **Pagination support:** indexes for published/approved product feeds by creation date, category and seller. Pagination itself is an API/query concern (`take`/`skip` or preferably cursor pagination), not a database table.
- **Geolocation:** seller primary coordinates and PostGIS geography field, plus multi-location `BusinessLocation` records for stores, warehouses, restaurants and pickup points. Spatial indexes and coordinate backfills are documented in the migration guide.
- **Restaurants:** restaurant profile, multilingual menu categories/items, restaurant orders/order items, delivery/pickup/dine-in fulfillment and reservations.
- **Hybrid delivery:** a delivery job can belong to exactly one marketplace, restaurant or B2B order; it can be handled by a platform delivery partner, seller or third party; status history records progression and optional coordinates.
- **Supplier / retailer:** shared business profile, supplier profile, supplier-retailer relationship, wholesale price tiers and procurement/supply orders.
- **B2B wholesale:** RFQs, RFQ items, supplier quotations and quote items, business orders and business order items.
- **Money:** monetary values use PostgreSQL Decimal columns, not binary floating point.

## Important implementation boundaries

The schema is the persistence foundation, not the complete feature implementation. The following still require application/API work:

1. Product listing endpoints must implement stable cursor pagination and return `stock` or variant availability/quantity. Product detail endpoints must resolve the requested locale with a fallback chain, return variants and explicit related products, and expose stock safely.
2. Product variant creation and checkout must validate selected option values, calculate the selected variant price, and decrement inventory atomically. A parent product's stock should not be treated as authoritative when it has tracked variants.
3. Geospatial search must use PostGIS `ST_DWithin` / distance ordering, not only latitude/longitude sorting. Store and restaurant map UIs need permission-aware browser geolocation and manual address fallback.
4. Restaurant ordering needs opening-hours, item availability, prep-time, delivery-zone, payment, cancellation and refund workflows. Reservation capacity and time-slot conflict handling need transactional application logic.
5. Delivery dispatch needs partner onboarding/verification, live location updates, assignment/acceptance timeouts, route/ETA calculation, notifications and proof of delivery. The schema does not itself guarantee fast delivery.
6. Supplier onboarding, relationship approval, price tier selection, RFQ visibility, quotation award and B2B payment/fulfilment require authorization and workflow APIs.
7. Enforce the additional database check constraints and PostGIS migration SQL described in `prisma/migrations/README.md`.

## Deployment safety

No migration has been generated or applied. First identify the PostgreSQL host and whether the target database is empty or already contains data. Back up the database, inspect migration status, review generated SQL (especially monetary type conversions), and only then deploy. Do not paste database credentials into chat or commit them to source control.

## AI assistant and recommendation data (added)

- **AI chat:** `AIChatSession` stores a user or anonymous session, locale and safe page/cart context; `AIChatMessage` stores ordered system/user/assistant/tool messages, model/token metadata and optional product references.
- **Personalized recommendations:** `AIProductRecommendation` stores a recommendation batch and its source (home, product page, search, cart, checkout or chat); `AIProductRecommendationItem` stores ranked products, optional relevance scores and localized explanations.
- **Recommendation analytics:** `AIRecommendationEvent` records impressions, clicks, add/remove-cart, purchase, save and dismiss events, with source, position and optional user/session attribution. This supports offline evaluation and ranking improvements.
- **Semantic retrieval:** the existing `Product.aiEmbedding` vector column can support embedding-based candidate retrieval. Its configured dimension is 1536; the embedding model must output exactly that dimension, or the column and migration must be changed together.

### AI implementation and privacy boundaries

1. The schema stores conversation history and recommendation outcomes; it does not provide an LLM, embedding generation, vector search queries, prompt orchestration or recommendation ranking by itself. Implement these in server-side services and API routes.
2. Keep provider API keys in server environment variables or a secrets manager. Never store keys in `AIChatMessage.metadata`, the database, browser bundles or logs.
3. Store only context needed for the feature. Do not put passwords, payment card data, authentication tokens, or unnecessary sensitive personal data in chat context or metadata. Define retention/deletion policies and honor account deletion/export requirements.
4. Enforce ownership checks on chat sessions and recommendation history. Anonymous `sessionKey` values should be random, opaque identifiers; do not use raw IP addresses or device fingerprints as identifiers.
5. Log recommendation impressions as well as clicks and purchases; otherwise offline ranking metrics will be biased toward items users already clicked. Attribute conversions carefully and avoid double-counting.
6. Recommendations must be filtered by publication/approval, stock, seller status, locale, delivery eligibility and user permissions before display. Re-check price and inventory at checkout; an AI recommendation is never a guarantee of availability or price.
