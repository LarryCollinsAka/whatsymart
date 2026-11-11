# Demo seeding

The seed creates a demo admin, seller, customer, multilingual categories and Cameroon-market demo products. It is idempotent for the seeded users, categories and products.

Set a unique local/staging password first (PowerShell):

```powershell
$env:SEED_DEMO_PASSWORD = 'use-a-unique-password-of-at-least-12-chars'
npx prisma db seed
```

The script refuses to create demo accounts in production unless `ALLOW_DEMO_SEED=true` is explicitly set. Do not use demo accounts or demo credentials on a public production system. Product image URLs are demo image sources; replace them with your approved product assets before launch.
