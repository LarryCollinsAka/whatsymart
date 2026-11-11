# Migration and deployment guide

This repository intentionally does **not** ship a fabricated migration. The target PostgreSQL database has not been inspected, so generating an initial migration or applying schema changes without knowing whether it already contains production data would be unsafe.

## Before generating migrations

1. Confirm the PostgreSQL provider and version, and confirm that both `postgis` and `vector` extensions are available (including in the Prisma shadow database used by `migrate dev`).
2. Back up the database.
3. Set `DATABASE_URL` and `DIRECT_URL` locally using your provider's recommended connection strings. Never commit `.env` or paste credentials into chat.
4. Run `npx prisma format`, `npx prisma validate`, and `npx prisma migrate status`.
5. If this is an empty development database, generate the initial migration with `npx prisma migrate dev --name init` and review the SQL before applying it.
6. If this database already contains tables/data, do **not** use `migrate dev --name init` blindly. Compare the live schema, baseline existing migrations where appropriate, and generate a reviewed incremental migration. Review the Float-to-Decimal conversions carefully.

## PostGIS SQL to add to the generated migration

Prisma models the PostGIS values as `Unsupported("geography(Point, 4326)")`; the actual spatial columns, backfill, and GiST indexes need SQL migration statements. Add these statements after the corresponding tables/columns exist. Confirm your provider supports PostGIS first.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- Existing seller/store primary location.
CREATE INDEX IF NOT EXISTS "sellers_location_gix"
  ON "sellers" USING GIST ("location");
UPDATE "sellers"
SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
WHERE "longitude" IS NOT NULL AND "latitude" IS NOT NULL;

-- Multiple store, warehouse, restaurant and pickup locations.
ALTER TABLE "business_locations"
  ADD COLUMN IF NOT EXISTS "geo" geography(Point, 4326);
UPDATE "business_locations"
SET "geo" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
WHERE "longitude" IS NOT NULL AND "latitude" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "business_locations_geo_gix"
  ON "business_locations" USING GIST ("geo");
```

## Recommended database-level integrity constraints

Add these to a reviewed migration after the relevant tables are created. They protect invariants that Prisma's schema language cannot express directly.

```sql
ALTER TABLE "delivery_jobs"
  ADD CONSTRAINT "delivery_jobs_exactly_one_order_chk"
  CHECK (num_nonnulls("orderId", "restaurantOrderId", "businessOrderId") = 1);

ALTER TABLE "product_variants"
  ADD CONSTRAINT "product_variants_stock_nonnegative_chk" CHECK ("stock" >= 0);
ALTER TABLE "products"
  ADD CONSTRAINT "products_stock_nonnegative_chk" CHECK ("stock" >= 0);
ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "restaurant_order_items"
  ADD CONSTRAINT "restaurant_order_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "business_order_items"
  ADD CONSTRAINT "business_order_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "supply_order_items"
  ADD CONSTRAINT "supply_order_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "business_locations"
  ADD CONSTRAINT "business_locations_latitude_chk" CHECK ("latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "business_locations_longitude_chk" CHECK ("longitude" BETWEEN -180 AND 180);
```

Also enforce in application transactions that a variant's option values all belong to the same product as the variant, that wholesale quantity bands do not overlap, and that restaurant reservations do not overlap beyond the restaurant's capacity. Those rules need transactional logic (or additional carefully designed PostgreSQL constraints), not just a Prisma relation.

## Deployment

After reviewing and committing the generated migration:

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

Do not run seed against production unless the seed data is explicitly intended for that environment. PostGIS support varies by managed PostgreSQL provider; if it is unavailable, pause deployment and choose a compatible geospatial approach before applying the migration.

## AI feature tables

The Prisma schema also defines AI chat sessions/messages, recommendation batches/items, and recommendation event analytics. These tables persist the data needed by a future AI assistant and recommendation engine; they do not connect to an AI provider or implement ranking. Product semantic embeddings use `vector(1536)`, so configure the embedding model to return 1536 dimensions or deliberately update the column and migration together. Keep provider secrets outside the database and browser bundle.
