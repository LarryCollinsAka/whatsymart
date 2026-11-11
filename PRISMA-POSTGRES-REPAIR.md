# Prisma / PostgreSQL repair notes

## Changes in this repair

- Removed the embedded database credential from `scripts/build-prisma.js` and replaced it with a non-secret local placeholder used only for Prisma Client generation.
- Made Prisma Client generation fail the build when generation fails instead of silently continuing.
- Declared PostgreSQL `vector` and `postgis` extensions for the existing vector embedding field and store geolocation field.
- Added optional seller latitude/longitude and a PostGIS `geography(Point, 4326)` field, plus a coordinate lookup index.
- Converted monetary database fields (product prices, order amounts, seller wallet balance, payouts and ledger entries) from floating point to `Decimal(14,2)`.
- Updated the Lemon Squeezy webhook to use Decimal arithmetic and an atomic transaction so duplicate webhook deliveries cannot double-credit the seller.
- Expanded the idempotent demo seed to add nine Cameroon-market products (in addition to the existing jasmine rice) with XAF prices, English/French product translations and primary demo images.
- Removed the shared hardcoded demo password; the seed now requires `SEED_DEMO_PASSWORD` and blocks production seeding unless explicitly enabled.
- Added Prisma validation, formatting, migration and status scripts.

## Important limitations

- No database connection was available in this workspace, so no live database was inspected or migrated.
- Prisma CLI dependencies could not be downloaded in this workspace (npm registry DNS/network failure), so `prisma validate`, generated Prisma Client, Next.js build and migration generation could not be run here.
- The initial migration has deliberately not been fabricated. Generate it with Prisma CLI against the correct database after confirming whether the target is empty or already contains data.
- PostGIS must be available on the PostgreSQL server and in the migration/shadow database. Confirm this with the provider before applying the schema. If it is unavailable, do not apply the migration until we agree on a compatible geolocation strategy.
- Converting existing Float money columns to Decimal requires reviewing existing values and the generated migration SQL before deployment.

## Security action

The original archive contained a database connection credential embedded in the build script. Rotate that credential at its provider immediately, update your local `.env` / deployment environment variables, and do not paste the new secret into chat or commit it to Git.
