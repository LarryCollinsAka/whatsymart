This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## PostgreSQL / Prisma setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string. Never commit `.env`.
2. Install dependencies with `npm ci`.
3. Validate the Prisma schema with `npx prisma format` and `npx prisma validate`.
4. For a new empty database, create and apply the initial migration with `npx prisma migrate dev --name init`. For an existing database, follow `prisma/migrations/README.md` and baseline only after checking the live schema and taking a backup.
5. Generate the Prisma Client with `npx prisma generate`.
6. Seed local/staging demo data by setting `SEED_DEMO_PASSWORD` and running `npx prisma db seed`.

The schema uses PostgreSQL `vector` and `postgis` extensions. Confirm that both are available on your PostgreSQL provider before applying migrations. The seed is demo data, not production catalogue content.

## Expanded database architecture

The Prisma schema now includes product variants and related-product links, multi-location geospatial records, restaurant menus/orders/reservations, hybrid delivery jobs and delivery partners, supplier-retailer procurement, and B2B RFQ/quotation/wholesale orders. See [SCHEMA-ARCHITECTURE.md](./SCHEMA-ARCHITECTURE.md) for feature boundaries and [prisma/migrations/README.md](./prisma/migrations/README.md) for the safe migration procedure.

**Important:** schema changes are not yet applied to any database. Confirm the PostgreSQL provider, PostGIS/vector extension availability, and whether the target database is empty or already contains data before generating or deploying migrations.
