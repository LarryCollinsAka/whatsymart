require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const extensions = await prisma.$queryRaw`
    SELECT
      name,
      default_version,
      installed_version
    FROM pg_available_extensions
    WHERE name IN ('postgis', 'vector')
    ORDER BY name
  `;

  console.table(extensions);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
